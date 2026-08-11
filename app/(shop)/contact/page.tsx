import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Contact Us · Frahnoir" };

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact Us"
      intro="We're happy to help with orders, dispatch, and product questions."
    >
      <h2>Get in Touch</h2>
      <ul>
        <li>
          <strong>Brand:</strong> Frahnoir
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:frahnoir@gmail.com">frahnoir@gmail.com</a>
        </li>
        <li>
          <strong>Phone / WhatsApp:</strong>{" "}
          <a href="https://wa.me/919311230533">+91 93112 30533</a>
        </li>
        <li>
          <strong>Business Location:</strong> A-3/99 2nd Floor, Paschim Vihar,
          New Delhi – 110063, West Delhi
        </li>
        <li>
          <strong>Support Hours:</strong> 9:00 am to 5:00 pm IST, all week
        </li>
      </ul>
    </LegalPage>
  );
}
