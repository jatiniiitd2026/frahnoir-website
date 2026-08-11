import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Shipping Policy · Frahnoir" };

export default function ShippingPolicyPage() {
  return (
    <LegalPage title="Shipping Policy">
      <ul>
        <li>
          Orders are shipped through <strong>Delhivery</strong> or other trusted
          courier partners.
        </li>
        <li>
          <strong>Estimated dispatch time:</strong> 2–5 business days after your
          order is confirmed.
        </li>
        <li>
          <strong>Estimated delivery time:</strong> 3–7 business days after
          dispatch, depending on your location.
        </li>
        <li>
          Shipping is <strong>included</strong> in the product price unless
          stated otherwise.
        </li>
        <li>
          You will receive <strong>tracking details</strong> once your order has
          been shipped.
        </li>
      </ul>
      <p>
        Delivery timelines are estimates and may vary due to courier or regional
        factors, public holidays, or unforeseen delays. For any shipping query,
        contact us at{" "}
        <a href="mailto:frahnoir@gmail.com">frahnoir@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
