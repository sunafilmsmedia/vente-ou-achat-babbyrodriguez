"use client";

import { motion } from "framer-motion";

// Outils réellement disponibles au Québec pour coordonner une vente et un
// achat. Utiles peu importe la stratégie recommandée — on les présente
// toujours, pas seulement pour le verdict "simultane".
const OUTILS = [
  {
    nom: "Oferta condicional a la venta",
    detail:
      "Su oferta de compra está condicionada a la venta de su propiedad actual dentro de un plazo preciso. Esto protege su compra si su venta toma más tiempo.",
  },
  {
    nom: "Cláusula de 72 horas",
    detail:
      "Si el vendedor recibe otra oferta mientras la suya está condicionada, usted generalmente tiene 72 horas para levantar su condición o retirarse.",
  },
  {
    nom: "Préstamo puente (bridge financing)",
    detail:
      "Un préstamo a corto plazo que adelanta una parte de la plusvalía de su propiedad actual antes de que la venta se concrete, para financiar su próxima compra.",
  },
  {
    nom: "Fechas de cierre alineadas",
    detail:
      "Coordinando las fechas de toma de posesión de ambas transacciones con los notarios, evita mudarse dos veces o quedarse sin vivienda.",
  },
];

export default function CoordinationBlock() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-12"
    >
      <h3 className="text-xs uppercase tracking-[0.18em] text-[var(--color-slate-500)] mb-2">
        Herramientas para coordinar su venta y su compra
      </h3>
      <p className="text-sm text-[var(--color-slate-400)] mb-5 leading-relaxed">
        Sin importar la estrategia recomendada, estas herramientas reducen el riesgo de
        quedarse sin vivienda — o de pagar dos hipotecas durante demasiado tiempo.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {OUTILS.map((o, i) => (
          <motion.div
            key={o.nom}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 + i * 0.05 }}
            className="glass-card rounded-2xl p-5"
          >
            <p className="font-medium text-[var(--color-brand-100)]">{o.nom}</p>
            <p className="text-xs text-[var(--color-slate-400)] mt-2 leading-relaxed">{o.detail}</p>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-[var(--color-slate-500)] italic leading-relaxed">
        Disponibilidad y condiciones variables según el prestamista y el contexto de la
        transacción — a validar con un agente inmobiliario y un agente hipotecario.
      </p>
    </motion.section>
  );
}
