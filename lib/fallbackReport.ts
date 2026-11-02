// Rapport déterministe — utilisé tel quel quand aucune clé Anthropic n'est
// configurée, et comme filet de sécurité si l'appel à Claude échoue.
// Le verdict et le score ne sont JAMAIS décidés ici : ils viennent de
// lib/scoring.ts. Ce fichier ne fait que les mettre en mots (en espagnol,
// vouvoiement formel via « usted »).

import { REGIONS } from "./regions";
import type { Answers, Report, ScoringResult, Verdict } from "./types";

const HEADLINES: Record<Verdict, string> = {
  vendre_avant: "Vender antes de comprar podría ser más ventajoso para usted.",
  acheter_avant: "Comprar antes de vender podría ser más ventajoso para usted.",
  simultane: "Coordinar su venta y su compra en paralelo podría ser la mejor estrategia para usted.",
};

const VERBE: Record<Verdict, string> = {
  vendre_avant: "vender primero",
  acheter_avant: "comprar primero",
  simultane: "coordinar ambas al mismo tiempo",
};

const PROPERTY_LABEL: Record<string, string> = {
  maison: "casa unifamiliar",
  condo: "condominio",
  duplex_triplex: "dúplex o tríplex",
  autre: "propiedad",
};

const VALUE_RANGE_LABEL: Record<string, string> = {
  moins_400k: "menos de 400 000 $",
  "400_650k": "entre 400 000 $ y 650 000 $",
  plus_650k: "650 000 $ o más",
  ne_sais_pas: "por confirmar",
};

export function regionNames(ids?: string[]): string[] {
  return (ids ?? []).map((id) => REGIONS.find((r) => r.id === id)?.name ?? id);
}

function currentCityLabel(answers: Answers): string {
  return regionNames(answers.currentCity)[0] ?? "su ciudad";
}

function propertyLabel(answers: Answers): string {
  return PROPERTY_LABEL[answers.currentPropertyType ?? "autre"] ?? "propiedad";
}

function summaryFor(verdict: Verdict): string {
  return `Según sus respuestas, ${VERBE[verdict]} podría permitirle:`;
}

function benefitsFor(verdict: Verdict, answers: Answers): string[] {
  const nextType = "su próxima propiedad";
  switch (verdict) {
    case "vendre_avant":
      return [
        `Conocer su presupuesto real para ${nextType}, basado en el producto neto de su venta.`,
        "Reducir el riesgo de asumir dos hipotecas al mismo tiempo.",
        "Negociar su próxima compra con mejor visibilidad financiera.",
        "Evitar la presión de dos pagos durante un período prolongado.",
      ];
    case "acheter_avant":
      return [
        "Tomarse el tiempo para encontrar la propiedad que realmente se ajusta a sus criterios.",
        "Evitar tener que mudarse dos veces o quedarse sin vivienda entre ambas transacciones.",
        `Negociar la venta de su ${propertyLabel(answers)} sin la presión de un comprador apurado.`,
        "Aprovechar una oportunidad en cuanto se presente, sin esperar el resultado de su venta.",
      ];
    case "simultane":
      return [
        "Coordinar las fechas de cierre para mudarse una sola vez.",
        "Mantener flexibilidad si una transacción toma más tiempo de lo previsto.",
        "Usar herramientas como la oferta condicional o el préstamo puente para reducir el riesgo financiero.",
        "Avanzar en ambos frentes a la vez, sin perder tiempo.",
      ];
  }
}

function stepsFor(verdict: Verdict, answers: Answers): Report["steps"] {
  const secteurTexte = currentCityLabel(answers);
  const valeur = VALUE_RANGE_LABEL[answers.currentPropertyValue ?? "ne_sais_pas"];

  switch (verdict) {
    case "vendre_avant":
      return [
        {
          title: "Hacer evaluar su propiedad actual",
          description: `Su estimación (${valeur}) es un punto de partida. Una evaluación gratuita da el monto neto que se convertirá en su cuota inicial.`,
        },
        {
          title: "Poner su propiedad en venta",
          description: "En cuanto se confirme el monto neto, conocerá su presupuesto real para lo que sigue — y negociará su compra con total confianza.",
        },
        {
          title: "Precalificarse durante la comercialización",
          description: "Nada impide reunirse con un prestamista mientras su propiedad está en el mercado, para estar listo(a) para ofertar en cuanto se concrete la venta.",
        },
        {
          title: "Empezar a vigilar el mercado",
          description: `Ya podemos identificar lo que se vende en ${secteurTexte}, para que esté listo(a) para moverse rápido una vez concretada su venta.`,
        },
      ];
    case "acheter_avant":
      return [
        {
          title: "Confirmar su capacidad con un prestamista",
          description: "Un prestamista validará lo que puede asumir considerando su hipoteca actual y sus deudas.",
        },
        {
          title: "Empezar activamente su búsqueda",
          description: `Nos enfocamos en ${secteurTexte} según sus criterios — no tiene prisa por vender, puede esperar la oportunidad adecuada.`,
        },
        {
          title: "Preparar una oferta condicional a la venta",
          description: "Una cláusula de venta de su propiedad actual protege su compra si su venta toma más tiempo de lo previsto.",
        },
        {
          title: "Poner su propiedad actual en el mercado una vez asegurada la compra",
          description: "Venderá con una fecha de entrega que le convenga, sin la presión de no tener un nuevo lugar adónde ir.",
        },
      ];
    case "simultane":
      return [
        {
          title: "Hacer evaluar su propiedad actual",
          description: `Su estimación (${valeur}) sirve de base para calcular lo que puede plantearse en paralelo.`,
        },
        {
          title: "Poner ambos expedientes en marcha al mismo tiempo",
          description: `Preparamos la comercialización de su propiedad mientras vigilamos ${secteurTexte} para la siguiente.`,
        },
        {
          title: "Explorar el préstamo puente y la oferta condicional",
          description: "Estas dos herramientas permiten comprar antes de que su venta se concrete, sin asumir todo el peso de ambas hipotecas por mucho tiempo.",
        },
        {
          title: "Alinear las fechas de cierre",
          description: "El objetivo: una sola transición, no dos mudanzas — sincronizamos las fechas con ambos notarios.",
        },
      ];
  }
}

function marketInsightFor(answers: Answers): string {
  const secteur = currentCityLabel(answers);
  return `En ${secteur}, el plazo de venta y el plazo de compra nunca están perfectamente sincronizados. Un agente que gestiona ambas transacciones a la vez puede negociar fechas de cierre flexibles, una cláusula de 72 horas o un préstamo puente — herramientas que reducen el riesgo, sin importar la estrategia elegida.`;
}

export function buildFallbackReport(answers: Answers, scoring: ScoringResult): Report {
  const verdict = scoring.verdict;

  return {
    headline: HEADLINES[verdict],
    summary: summaryFor(verdict),
    benefits: benefitsFor(verdict, answers),
    steps: stepsFor(verdict, answers),
    marketInsight: marketInsightFor(answers),
  };
}

export const VERDICT_HEADLINES = HEADLINES;
