import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions · Frahnoir" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="By purchasing from Frahnoir, you agree to the following terms."
    >
      <ul>
        <li>
          Products are subject to availability. Pre-order items are dispatched
          as per the stated pre-order terms.
        </li>
        <li>Prices are subject to change without prior notice.</li>
        <li>
          Customers must provide an accurate delivery address and contact
          details. Frahnoir is not responsible for delays or failed deliveries
          caused by incorrect information.
        </li>
        <li>
          Frahnoir may cancel any order it reasonably believes to be suspicious
          or fraudulent.
        </li>
        <li>
          Our Shipping, Cancellation &amp; Refund, and Privacy policies govern
          all purchases made through this website.
        </li>
      </ul>
      <p>
        Questions about these terms? Contact{" "}
        <a href="mailto:frahnoir@gmail.com">frahnoir@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
