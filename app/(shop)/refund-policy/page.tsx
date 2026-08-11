import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy · Frahnoir",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Cancellation & Refund Policy">
      <h2>Cancellations</h2>
      <ul>
        <li>Cancellations are allowed before the order is dispatched.</li>
        <li>
          After dispatch, cancellation may not be possible as the order is
          already in transit.
        </li>
      </ul>

      <h2>Refunds</h2>
      <ul>
        <li>
          Refunds are processed only for eligible cases, such as a{" "}
          <strong>wrong or damaged product</strong>, or a{" "}
          <strong>failed payment / order issue</strong>.
        </li>
        <li>
          Approved refunds are processed within{" "}
          <strong>5–7 business days</strong> to the original payment method.
        </li>
        <li>
          For a damaged product, you must contact us within{" "}
          <strong>24–48 hours</strong> of delivery with a clear unboxing
          video/photos so we can verify and resolve it.
        </li>
      </ul>
      <p>
        To request a cancellation or refund, email{" "}
        <a href="mailto:frahnoir@gmail.com">frahnoir@gmail.com</a> or message us
        on <a href="https://wa.me/919311230533">WhatsApp</a> with your order
        details.
      </p>
    </LegalPage>
  );
}
