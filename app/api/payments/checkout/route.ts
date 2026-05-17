import { NextResponse } from "next/server";
import { paymentPlans, type PaymentPlanId } from "@/data/paymentPlans";

type CheckoutRequest = {
  planId?: PaymentPlanId;
  payerEmail?: string;
  listingId?: string;
};

type MercadoPagoPreferenceResponse = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  message?: string;
  error?: string;
};

function getBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          "Falta configurar MERCADO_PAGO_ACCESS_TOKEN en las variables de entorno.",
      },
      { status: 500 }
    );
  }

  let body: CheckoutRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const plan = body.planId ? paymentPlans[body.planId] : undefined;

  if (!plan) {
    return NextResponse.json({ error: "Plan de pago inválido." }, { status: 400 });
  }

  const baseUrl = getBaseUrl(request);
  const externalReference = [
    "motordata",
    plan.id,
    body.listingId || "sin-anuncio",
    Date.now(),
  ].join(":");

  const preference = {
    items: [
      {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        quantity: 1,
        currency_id: plan.currency,
        unit_price: plan.price,
      },
    ],
    payer: body.payerEmail ? { email: body.payerEmail } : undefined,
    back_urls: {
      success: `${baseUrl}/pagos/resultado?status=success`,
      pending: `${baseUrl}/pagos/resultado?status=pending`,
      failure: `${baseUrl}/pagos/resultado?status=failure`,
    },
    auto_return: "approved",
    external_reference: externalReference,
    statement_descriptor: "MOTORDATA",
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preference),
  });

  const data = (await response.json()) as MercadoPagoPreferenceResponse;

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.message ||
          data.error ||
          "Mercado Pago no pudo crear la preferencia de pago.",
      },
      { status: response.status }
    );
  }

  const checkoutUrl = data.init_point || data.sandbox_init_point;

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Mercado Pago no devolvió una URL de checkout." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    preferenceId: data.id,
    checkoutUrl,
  });
}
