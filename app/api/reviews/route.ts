import { NextResponse } from "next/server";
import crypto from "crypto";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  createPendingReview,
  hashIp,
  isRateLimited,
  recordSubmission,
} from "@/lib/reviews";
import { REVIEW_PRODUCTS } from "@/lib/reviewConstants";
import { MAX_REVIEW_FILES } from "@/lib/media";
import { validateMediaFile } from "@/lib/mediaValidation";

export const runtime = "nodejs";

const BUCKET = "review-media";
const VALID_PRODUCTS = new Set<string>(REVIEW_PRODUCTS.map((p) => p.value));

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Reviews are not available yet.", code: "SUPABASE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const productSlug = String(form.get("product") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const rating = Number(form.get("rating"));

  // --- Field validation ---
  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Please select a rating between 1 and 5." },
      { status: 400 },
    );
  }
  if (!message) {
    return NextResponse.json(
      { error: "Please write your review message." },
      { status: 400 },
    );
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  const product = VALID_PRODUCTS.has(productSlug) ? productSlug : "general";

  // --- Rate limiting (max N submissions / IP hash / 24h) ---
  const ipHash = hashIp(clientIp(request));
  if (await isRateLimited(ipHash)) {
    return NextResponse.json(
      { error: "Too many review submissions. Please try again later." },
      { status: 429 },
    );
  }

  // --- File validation (MIME + extension + magic bytes must all agree) ---
  const files = form
    .getAll("media")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length > MAX_REVIEW_FILES) {
    return NextResponse.json(
      { error: `Please upload at most ${MAX_REVIEW_FILES} files.` },
      { status: 400 },
    );
  }

  const validated: { file: File; ext: string; contentType: string }[] = [];
  for (const file of files) {
    const result = await validateMediaFile(file);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    validated.push({ file, ext: result.ext!, contentType: result.contentType! });
  }

  // --- Upload media to Supabase Storage (server-side, service role) ---
  const supabase = getSupabaseAdmin();
  const mediaUrls: string[] = [];
  try {
    for (const { file, ext, contentType } of validated) {
      // Randomised path — original filename is never trusted or reused.
      const path = `reviews/${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      mediaUrls.push(data.publicUrl);
    }
  } catch (err) {
    console.error("[reviews] media upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 502 },
    );
  }

  // --- Save as pending (never public until approved) ---
  try {
    await createPendingReview({
      name,
      email: email || null,
      productSlug: product,
      rating,
      title: title || null,
      message,
      mediaUrls,
    });
  } catch (err) {
    console.error("[reviews] insert failed:", err);
    return NextResponse.json(
      { error: "Could not save your review. Please try again." },
      { status: 502 },
    );
  }

  // Count this accepted submission toward the rate limit.
  await recordSubmission(ipHash);

  return NextResponse.json({ ok: true });
}
