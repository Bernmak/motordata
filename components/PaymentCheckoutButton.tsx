"use client";

import { useState } from "react";
import type { PaymentPlanId } from "@/data/paymentPlans";

type PaymentCheckoutButtonProps = {
  planId: PaymentPlanId;
  label: string;
  payerEmail?: string;
  listingId?: string;
  className?: string;
};

export default function PaymentCheckoutButton({
  planId,
  label,
  payerEmail,
  listingId,
  className = "",
}: PaymentCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, payerEmail, listingId }),
      });
      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "No se pudo iniciar el pago.");
      }

      window.location.assign(data.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "No se pudo iniciar el pago."
      );
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={isLoading}
        className={
          className ||
          "rounded-xl bg-[#063b75] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#052f5f] disabled:cursor-not-allowed disabled:bg-gray-400"
        }
      >
        {isLoading ? "Abriendo Mercado Pago..." : label}
      </button>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
