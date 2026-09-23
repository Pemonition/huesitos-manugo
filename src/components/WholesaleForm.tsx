"use client";

import { useState } from "react";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export function WholesaleForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string; quantity: number } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const quantity = Number(form.get("quantity") ?? 0);

    const payload = {
      name,
      companyName: form.get("companyName"),
      phone: form.get("phone"),
      email: form.get("email"),
      city: form.get("city"),
      quantity,
      message: form.get("message"),
    };

    try {
      const res = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Não foi possível enviar seu pedido de orçamento.");
      }

      setSent({ name, quantity });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    const text = encodeURIComponent(
      `Olá! Sou ${sent.name} e preenchi o formulário de revenda no site pedindo um orçamento para ${sent.quantity} unidades de Huesitos.`
    );
    return (
      <div className="grid gap-3 rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
        <p className="text-amber-900">
          Recebemos seu pedido! Pra agilizar, continue a conversa com a gente pelo WhatsApp:
        </p>
        {whatsappNumber ? (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${text}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-4 py-3 text-center font-semibold text-white hover:bg-green-700"
          >
            Continuar no WhatsApp
          </a>
        ) : (
          <p className="text-sm text-amber-700">
            Em breve entraremos em contato pelos dados enviados.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-amber-900">Quero revender</h3>
      <p className="text-sm text-amber-700">
        Para grandes quantidades, o preço e o prazo são combinados com você — preencha
        e falamos pelo WhatsApp.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Nome
          <input name="name" required className="rounded border border-amber-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Loja / empresa (opcional)
          <input name="companyName" className="rounded border border-amber-300 px-3 py-2" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Telefone / WhatsApp
          <input name="phone" required className="rounded border border-amber-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          E-mail (opcional)
          <input type="email" name="email" className="rounded border border-amber-300 px-3 py-2" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Cidade (opcional)
          <input name="city" className="rounded border border-amber-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Quantidade desejada
          <input type="number" name="quantity" min={1} required className="rounded border border-amber-300 px-3 py-2" />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        Mensagem (opcional)
        <textarea name="message" rows={3} className="rounded border border-amber-300 px-3 py-2" />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-lg border-2 border-amber-700 px-4 py-3 font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
      >
        {submitting ? "Enviando..." : "Pedir orçamento"}
      </button>
    </form>
  );
}
