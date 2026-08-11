import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "About Us · Frahnoir" };

export default function AboutPage() {
  return (
    <LegalPage title="About Us">
      <p>
        Frahnoir is a luxury fragrance brand focused on rich{" "}
        <strong>extrait de parfum</strong> compositions, premium presentation,
        and memorable scent experiences.
      </p>
      <p>
        Every Frahnoir fragrance is created to linger — layered, characterful,
        and designed to be lived in. From the first note to the final drydown,
        our aim is a scent, and an unboxing, that feels considered and
        indulgent.
      </p>
    </LegalPage>
  );
}
