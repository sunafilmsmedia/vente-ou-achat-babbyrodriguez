// ============================================================================
// Scoring — « Vendre avant d'acheter ou l'inverse ? »
// ----------------------------------------------------------------------------
// Contrairement aux apps acheteur/vendeur (un score 0-100 de « préparation »),
// ce scoring est BIPOLAIRE : chaque facteur pousse vers une stratégie ou
// l'autre. netScore va de -100 (acheter avant) à +100 (vendre avant) ; un
// score proche de 0 signifie que les deux options sont coordonnées de front
// ("simultane").
//
// Les 3 facteurs financiers (besoin de l'argent de la vente, capacité à
// porter deux hypothèques, économies indépendantes) pèsent le plus lourd —
// c'est ce qui détermine réellement si on PEUT acheter avant de vendre.
// L'équité accumulée et la priorité de la personne affinent la recommandation.
// ============================================================================

import type { Answers, ScoringFactor, ScoringResult, Verdict } from "./types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Au-delà de ce seuil (en valeur absolue), on tranche clairement pour une
// stratégie. En-dessous, les deux options sont assez équilibrées : on
// recommande de les coordonner en parallèle.
const SEUIL_TRANCHE = 18;

export function computeScoring(answers: Answers): ScoringResult {
  const factors: ScoringFactor[] = [];
  let score = 0;

  // delta > 0 favorise "vendre avant" ; delta < 0 favorise "acheter avant".
  const add = (delta: number, label: string, tone: ScoringFactor["tone"]) => {
    score += delta;
    factors.push({ label, delta, tone });
  };

  // ── ¿Necesita el dinero de la venta? (el factor más importante) ──────────
  switch (answers.needsSaleMoney) {
    case "oui_absolument":
      add(32, "Necesita el dinero de la venta de su propiedad actual para financiar su próxima compra", "vendre");
      break;
    case "oui_partiel":
      add(16, "Una parte de su cuota inicial provendrá de la venta de su propiedad actual", "vendre");
      break;
    case "non_assez_economies":
      add(-22, "Sus ahorros ya son suficientes, sin esperar el producto de la venta", "acheter");
      break;
    case "ne_sais_pas":
      add(0, "Todavía no está seguro(a) de sus necesidades financieras para la compra", "neutre");
      break;
  }

  // ── ¿Puede asumir dos propiedades al mismo tiempo? ────────────────────────
  switch (answers.canCarryTwoMortgages) {
    case "oui_sans_probleme":
      add(-28, "Puede asumir dos propiedades sin problema — nada le obliga a vender antes de comprar", "acheter");
      break;
    case "oui_courte_periode":
      add(-10, "Podría resistir solo durante un período corto", "acheter");
      break;
    case "non":
      add(28, "No podría asumir dos hipotecas al mismo tiempo", "vendre");
      break;
    case "ne_sais_pas":
      add(0, "No está seguro(a) de poder mantener dos propiedades", "neutre");
      break;
  }

  // ── Ahorros independientes de la venta ────────────────────────────────────
  switch (answers.hasSavings) {
    case "oui":
      add(-14, "Tiene ahorros disponibles, independientes de la venta de su propiedad", "acheter");
      break;
    case "non":
      add(14, "No tiene ahorros fuera de la venta de su propiedad actual", "vendre");
      break;
    case "prefere_ne_pas_repondre":
      add(0, "Su situación de ahorros queda por validar con un agente", "neutre");
      break;
  }

  // ── Prioridad principal ────────────────────────────────────────────────────
  switch (answers.priority) {
    case "meilleur_prix":
      add(14, "Obtener el mejor precio por su propiedad actual es su prioridad — eso requiere tiempo, sin la presión de una compra pendiente", "vendre");
      break;
    case "maison_parfaite":
      add(-16, "Encontrar la casa perfecta es su prioridad, aunque eso tome tiempo — no quiere apresurarse a vender", "acheter");
      break;
    case "eviter_deux_hypotheques":
      add(20, "Evitar pagar dos hipotecas es su prioridad número uno", "vendre");
      break;
    case "eviter_deplacement_double":
      add(-18, "Evitar mudarse dos veces es su prioridad", "acheter");
      break;
  }

  // ── Plusvalía acumulada (antigüedad como propietario) ─────────────────────
  switch (answers.ownershipDuration) {
    case "moins_3_ans":
      add(-3, "Propietario(a) desde hace menos de 3 años — la plusvalía acumulada todavía es limitada", "acheter");
      break;
    case "3_5_ans":
      add(3, "Propietario(a) desde hace 3 a 5 años — ya se empieza a acumular plusvalía", "vendre");
      break;
    case "5_10_ans":
      add(6, "Propietario(a) desde hace 5 a 10 años — probablemente se acumuló una plusvalía cómoda", "vendre");
      break;
    case "plus_10_ans":
      add(8, "Propietario(a) desde hace más de 10 años — su plusvalía es probablemente significativa", "vendre");
      break;
  }

  score = clamp(Math.round(score), -100, 100);

  return { netScore: score, verdict: verdictFor(score), factors };
}

function verdictFor(score: number): Verdict {
  if (score >= SEUIL_TRANCHE) return "vendre_avant";
  if (score <= -SEUIL_TRANCHE) return "acheter_avant";
  return "simultane";
}
