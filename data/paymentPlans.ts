export type PaymentPlanId = "publication_featured" | "seller_pack";

export type PaymentPlan = {
  id: PaymentPlanId;
  title: string;
  description: string;
  price: number;
  currency: "ARS";
};

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  publication_featured: {
    id: "publication_featured",
    title: "Publicación destacada",
    description: "Mayor visibilidad para un vehículo publicado en Motordata.",
    price: 5000,
    currency: "ARS",
  },
  seller_pack: {
    id: "seller_pack",
    title: "Pack vendedor",
    description: "Publicación destacada y prioridad de revisión para vendedores.",
    price: 12000,
    currency: "ARS",
  },
};

export const publicPaymentPlans = Object.values(paymentPlans);
