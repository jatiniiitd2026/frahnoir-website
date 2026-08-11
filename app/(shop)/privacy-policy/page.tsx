import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy · Frahnoir" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Your privacy matters to us. This policy explains what we collect and how it is used."
    >
      <h2>Information We Collect</h2>
      <ul>
        <li>Name, phone number, email address, and shipping address.</li>
        <li>Order and payment information required to process your purchase.</li>
      </ul>

      <h2>How We Use Your Data</h2>
      <ul>
        <li>
          Only for order processing, delivery, customer support, and legal
          compliance.
        </li>
      </ul>

      <h2>Payments &amp; Shipping</h2>
      <ul>
        <li>
          Payments are securely handled by <strong>Razorpay</strong>. We do not
          store your card or banking details.
        </li>
        <li>
          Shipping is handled by <strong>Delhivery</strong> or trusted courier
          partners, who receive only the details needed to deliver your order.
        </li>
      </ul>

      <h2>Data Protection</h2>
      <ul>
        <li>
          We <strong>do not sell</strong> your personal data to any third party.
        </li>
        <li>
          Data is retained only as long as needed for orders, support, and legal
          requirements.
        </li>
      </ul>
      <p>
        For any privacy request, contact{" "}
        <a href="mailto:frahnoir@gmail.com">frahnoir@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
