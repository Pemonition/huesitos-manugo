"use client";

import { useState } from "react";
import { formatCentsToBRL } from "@/lib/format";

type Props = {
  productSlug: string;
  productName: string;
  unitPriceCents: number;
};

export function BuyForm({ productSlug, productName, unitPriceCents }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = unitPriceCents * quantity;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      productSlug,
      quantity,
      customerName: form.get("customerName"),
      customerEmail: form.get("customerEmail"),
      customerPhone: form.get("customerPhone"),
      addressStreet: form.get("addressStreet"),
      addressNumber: form.get("addressNumber"),
      addressComplement: form.get("addressComplement"),
      addressCity: form.get("addressCity"),
      addressState: form.get("addressState"),
      addressZip: form.get("addressZip"),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Não foi possível iniciar o pagamento.");
      }

      // Redireciona para o Checkout Pro do Mercado Pago — de lá pra frente
      // é o Mercado Pago quem cuida da tela de pagamento.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-amber-900">Comprar {productName}</h3>

      <label className="grid gap-1 text-sm">
        Quantidade
        <input
          type="number"
          min={1}
          max={500}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="rounded border border-amber-300 px-3 py-2"
          required
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Nome completo
          <input name="customerName" required className="rounded border border-amber-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Telefone / WhatsApp
          <input name="customerPhone" required className="rounded border border-amber-300 px-3 py-2" />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        E-mail
        <input type="email" name="customerEmail" required className="rounded border border-amber-300 px-3 py-2" />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <label className="grid gap-1 text-sm">
          Endereço (rua)
          <input name="addressStreet" required className="rounded border border-amber-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Número
          <input name="addressNumber" required className="rounded border border-amber-300 px-3 py-2" />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        Complemento (opcional)
        <input name="addressComplement" className="rounded border border-amber-300 px-3 py-2" />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="grid gap-1 text-sm">
          Cidade
          <input name="addressCity" required className="rounded border border-amber-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          UF
          <input name="addressState" required maxLength={2} placeholder="SC" className="rounded border border-amber-300 px-3 py-2 uppercase" />
        </label>
        <label className="grid gap-1 text-sm">
          CEP
          <input name="addressZip" required className="rounded border border-amber-300 px-3 py-2" />
        </label>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-amber-100 pt-3">
        <span className="text-sm text-amber-800">Total</span>
        <span className="text-xl font-bold text-amber-900">{formatCentsToBRL(total)}</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-lg bg-amber-700 px-4 py-3 font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
      >
        {submitting ? "Preparando pagamento..." : "Ir para pagamento (Pix, cartão ou boleto)"}
      </button>
    </form>
  );
}
