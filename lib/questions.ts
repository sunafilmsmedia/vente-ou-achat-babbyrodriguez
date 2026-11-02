import type { Answers } from "./types";

export type QuestionId =
  | "reasonForChange"
  | "searchStage"
  | "currentPropertyType"
  | "currentCity"
  | "currentPropertyValue"
  | "ownershipDuration"
  | "needsSaleMoney"
  | "canCarryTwoMortgages"
  | "hasSavings"
  | "priority"
  | "fullName"
  | "email"
  | "phone";

export type QuestionKind = "choice" | "regions" | "text";

export interface Choice<V extends string = string> {
  value: V;
  label: string;
  hint?: string;
}

export interface QuestionDef {
  id: QuestionId;
  kind: QuestionKind;
  title: string;
  subtitle?: string;
  choices?: Choice[];
  autoAdvance?: boolean;
  showIf?: (a: Answers) => boolean;
  // kind "regions" seulement — combien de secteurs maximum (défaut : 1).
  maxRegions?: number;
  regionsPlaceholder?: string;
  // kind "text" seulement.
  inputType?: "text" | "email" | "tel";
  placeholder?: string;
  autoComplete?: string;
  helper?: string;
}

export const QUESTIONS: QuestionDef[] = [
  // ── Étape 1 — Su proyecto ───────────────────────────────────────────────
  {
    id: "reasonForChange",
    kind: "choice",
    title: "¿Por qué desea cambiar de propiedad?",
    subtitle: "Para que entendamos su proyecto.",
    autoAdvance: true,
    choices: [
      { value: "plus_espace", label: "Necesito más espacio" },
      { value: "plus_petite", label: "Deseo una propiedad más pequeña" },
      { value: "quartier_ville", label: "Quiero cambiar de barrio o de ciudad" },
      { value: "autre", label: "Otra razón", hint: "Calidad de vida, gastos, cambio personal…" },
    ],
  },
  {
    id: "searchStage",
    kind: "choice",
    title: "¿Ya ha empezado a buscar su próxima propiedad?",
    autoAdvance: true,
    choices: [
      { value: "trouve", label: "Sí, encontré una propiedad que me interesa" },
      { value: "visite", label: "Sí, estoy visitando propiedades actualmente" },
      { value: "annonces", label: "Sí, estoy viendo los anuncios en línea" },
      { value: "pas_commence", label: "No, primero quiero saber qué hacer con mi propiedad actual" },
    ],
  },

  // ── Étape 2 — Su propiedad actual ───────────────────────────────────────
  {
    id: "currentPropertyType",
    kind: "choice",
    title: "¿Qué tipo de propiedad posee actualmente?",
    autoAdvance: true,
    choices: [
      { value: "maison", label: "Casa unifamiliar", hint: "Separada, adosada o en hilera" },
      { value: "condo", label: "Condominio" },
      { value: "duplex_triplex", label: "Dúplex o tríplex" },
      { value: "autre", label: "Otra" },
    ],
  },
  {
    id: "currentCity",
    kind: "regions",
    title: "¿En qué ciudad se encuentra su propiedad actual?",
    subtitle: "Selecciónela de la lista — o escríbala.",
    autoAdvance: true,
    maxRegions: 1,
    regionsPlaceholder: "Escriba una ciudad (ej. Longueuil, Brossard…)",
  },
  {
    id: "currentPropertyValue",
    kind: "choice",
    title: "¿Cuál es el valor aproximado de su propiedad actual?",
    autoAdvance: true,
    choices: [
      { value: "moins_400k", label: "Menos de 400 000 $" },
      { value: "400_650k", label: "400 000 $ a 649 999 $" },
      { value: "plus_650k", label: "650 000 $ o más" },
      { value: "ne_sais_pas", label: "No lo sé" },
    ],
  },
  {
    id: "ownershipDuration",
    kind: "choice",
    title: "¿Hace cuánto tiempo es propietario(a) de esta propiedad?",
    subtitle: "Esto cambia la plusvalía que probablemente ha acumulado.",
    autoAdvance: true,
    choices: [
      { value: "moins_3_ans", label: "Menos de 3 años" },
      { value: "3_5_ans", label: "3 a 5 años" },
      { value: "5_10_ans", label: "5 a 10 años" },
      { value: "plus_10_ans", label: "Más de 10 años" },
    ],
  },

  // ── Étape 3 — Su situación financiera ───────────────────────────────────
  {
    id: "needsSaleMoney",
    kind: "choice",
    title: "¿Necesita el dinero de la venta de su propiedad actual para comprar la siguiente?",
    autoAdvance: true,
    choices: [
      { value: "oui_absolument", label: "Sí, absolutamente" },
      { value: "oui_partiel", label: "Sí, para una parte de mi cuota inicial" },
      { value: "non_assez_economies", label: "No, tengo ahorros suficientes" },
      { value: "ne_sais_pas", label: "Todavía no lo sé" },
    ],
  },
  {
    id: "canCarryTwoMortgages",
    kind: "choice",
    title: "¿Podría asumir los gastos de dos propiedades durante algunos meses?",
    autoAdvance: true,
    choices: [
      { value: "oui_sans_probleme", label: "Sí, sin problema" },
      { value: "oui_courte_periode", label: "Sí, pero solo por un período corto" },
      { value: "non", label: "No" },
      { value: "ne_sais_pas", label: "No lo sé" },
    ],
    // Si la personne a déjà dit avoir ABSOLUMENT besoin de l'argent de la
    // vente pour acheter, elle ne peut par définition pas porter deux
    // propriétés — la question devient inutile.
    showIf: (a) => a.needsSaleMoney !== "oui_absolument",
  },
  {
    id: "hasSavings",
    kind: "choice",
    title: "¿Tiene ahorros disponibles para su próxima compra, independientemente de la venta de su propiedad actual?",
    autoAdvance: true,
    choices: [
      { value: "oui", label: "Sí" },
      { value: "non", label: "No" },
      { value: "prefere_ne_pas_repondre", label: "Prefiero no responder" },
    ],
  },

  // ── Étape 4 — Sus prioridades ────────────────────────────────────────────
  {
    id: "priority",
    kind: "choice",
    title: "¿Qué es lo más importante para usted en este cambio?",
    autoAdvance: true,
    choices: [
      { value: "meilleur_prix", label: "Obtener el mejor precio posible por mi propiedad actual" },
      { value: "maison_parfaite", label: "Encontrar la casa perfecta, aunque eso tome tiempo" },
      { value: "eviter_deux_hypotheques", label: "Evitar pagar dos hipotecas" },
      { value: "eviter_deplacement_double", label: "Evitar tener que mudarme dos veces" },
    ],
  },

  // ── Datos de contacto ────────────────────────────────────────────────────
  {
    id: "fullName",
    kind: "text",
    title: "¿Cuál es su nombre completo?",
    subtitle: "Para saber a quién dirigirnos.",
    inputType: "text",
    autoComplete: "name",
    placeholder: "María Pérez",
  },
  {
    id: "email",
    kind: "text",
    title: "¿Cuál es su correo electrónico?",
    subtitle: "Ahí recibirá su estrategia.",
    inputType: "email",
    autoComplete: "email",
    placeholder: "maria@ejemplo.com",
  },
  {
    id: "phone",
    kind: "text",
    title: "¿Cuál es su número de teléfono?",
    subtitle: "Para que un agente pueda contactarle rápidamente.",
    inputType: "tel",
    autoComplete: "tel",
    placeholder: "(514) 555-0123",
  },
];

export function getVisibleQuestions(answers: Answers): QuestionDef[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

export function isAnswered(q: QuestionDef, a: Answers): boolean {
  switch (q.id) {
    case "reasonForChange": return !!a.reasonForChange;
    case "searchStage": return !!a.searchStage;
    case "currentPropertyType": return !!a.currentPropertyType;
    case "currentCity": return Array.isArray(a.currentCity) && a.currentCity.length >= 1;
    case "currentPropertyValue": return !!a.currentPropertyValue;
    case "ownershipDuration": return !!a.ownershipDuration;
    case "needsSaleMoney": return !!a.needsSaleMoney;
    case "canCarryTwoMortgages": return !!a.canCarryTwoMortgages;
    case "hasSavings": return !!a.hasSavings;
    case "priority": return !!a.priority;
    case "fullName": return !!(a.fullName ?? "").trim();
    case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((a.email ?? "").trim());
    case "phone": return (a.phone ?? "").replace(/\D/g, "").length >= 10;
  }
}
