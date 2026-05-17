import Link from "next/link";

type PaymentResultPageProps = {
  searchParams: Promise<{
    status?: string;
    collection_status?: string;
    payment_id?: string;
    preference_id?: string;
  }>;
};

const statusContent = {
  success: {
    title: "Pago aprobado",
    text: "Recibimos la confirmación de Mercado Pago. La activación comercial puede revisarse desde administración.",
    className: "bg-[#e8f7ef] text-[#0f5132] ring-emerald-200",
  },
  pending: {
    title: "Pago pendiente",
    text: "Mercado Pago todavía está procesando la operación. Revisá el estado más tarde.",
    className: "bg-[#fff4bf] text-[#7a6100] ring-yellow-200",
  },
  failure: {
    title: "Pago no completado",
    text: "La operación no se aprobó. Podés volver a intentarlo cuando quieras.",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
};

export default async function PaymentResultPage({
  searchParams,
}: PaymentResultPageProps) {
  const params = await searchParams;
  const status = params.status || params.collection_status || "pending";
  const content =
    status === "success" || status === "approved"
      ? statusContent.success
      : status === "failure" || status === "rejected"
        ? statusContent.failure
        : statusContent.pending;

  return (
    <main className="min-h-screen bg-[#2f3742] px-6 py-10 text-[#0b1f33]">
      <section
        className={`mx-auto max-w-2xl rounded-2xl p-6 shadow-sm ring-1 ${content.className}`}
      >
        <p className="text-sm font-black uppercase tracking-wide">Motordata</p>
        <h1 className="mt-2 text-3xl font-black">{content.title}</h1>
        <p className="mt-3 text-sm leading-6">{content.text}</p>

        {(params.payment_id || params.preference_id) && (
          <div className="mt-5 rounded-xl bg-white/70 p-4 text-sm">
            {params.payment_id && <p>Pago: {params.payment_id}</p>}
            {params.preference_id && <p>Preferencia: {params.preference_id}</p>}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/vender"
            className="rounded-xl bg-[#063b75] px-5 py-3 text-center text-sm font-bold text-white"
          >
            Volver a vender
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-bold text-[#063b75]"
          >
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
