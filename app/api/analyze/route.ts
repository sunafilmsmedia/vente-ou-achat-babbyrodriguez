import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { computeScoring } from "@/lib/scoring";
import { buildFallbackReport, regionNames } from "@/lib/fallbackReport";
import { BRAND } from "@/lib/brand";
import type { AnalyzeResponse, Answers, Report } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Usted es un experto en bienes raíces residenciales de Quebec (región de ${BRAND.region}, sector de ${BRAND.city}) que redacta una recomendación de estrategia personalizada para una persona que ya posee una propiedad y desea cambiarla.

Su tarea NO ES decidir la estrategia — ya está determinada por un cálculo determinista provisto en "scoring.verdict" (vendre_avant | acheter_avant | simultane). Su rol es únicamente poner esa recomendación en palabras, de forma cálida, honesta y personalizada según las respuestas dadas.

Su tono: cálido, profesional, en ESPAÑOL con tratamiento formal (usted / su / sus — nunca tuteo), nunca alarmista, nunca comercial.

Reglas absolutas:
- NUNCA cambie el veredicto provisto. Nunca presente una estrategia distinta a la de "scoring.verdict".
- No invente ninguna cifra precisa (monto, tasa, porcentaje) que no provenga de las respuestas dadas.
- "benefits": exactamente 3 o 4 beneficios concretos de la estrategia recomendada, en frases cortas que empiecen con un verbo en infinitivo (ej. "Conocer su presupuesto real...", "Evitar...").
- "steps": exactamente 4 pasos cortos y accionables, en el orden lógico de la estrategia recomendada.
- "summary": una sola frase que anuncie los beneficios a continuación (estilo: "Según sus respuestas, [vender primero / comprar primero / coordinar ambas] podría permitirle:").
- "marketInsight": una observación útil sobre la coordinación venta/compra (préstamo puente, oferta condicional, cláusula de 72 horas, fechas de cierre), sin cifras inventadas.
- Sin markdown, sin emojis, sin frases vacías.
- Redacte TODO el informe en ESPAÑOL, tratando al lector de "usted" (su / sus). Nunca tutee ("tú", "tu", "tus").`;

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // fallthrough
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
  return null;
}

function isValidReport(r: unknown): r is Report {
  if (!r || typeof r !== "object") return false;
  const x = r as Record<string, unknown>;
  return (
    typeof x.headline === "string" &&
    typeof x.summary === "string" &&
    Array.isArray(x.benefits) &&
    x.benefits.length >= 3 &&
    Array.isArray(x.steps) &&
    x.steps.length >= 3 &&
    typeof x.marketInsight === "string"
  );
}

export async function POST(req: Request) {
  let body: { answers?: Answers };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const answers = body.answers ?? {};
  const scoring = computeScoring(answers);
  const fallback = buildFallbackReport(answers, scoring);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const payload: AnalyzeResponse = { scoring, report: fallback, generatedBy: "fallback" };
    return NextResponse.json(payload);
  }

  try {
    const client = new Anthropic({ apiKey });
    const userMessage = {
      answers: {
        ...answers,
        currentCity: regionNames(answers.currentCity),
      },
      scoring,
      fallbackHints: {
        headline: fallback.headline,
        summary: fallback.summary,
        marketInsight: fallback.marketInsight,
      },
      requiredSchema: {
        headline: "frase de apertura que retoma el veredicto, 1 línea",
        summary: "1 frase que anuncia los beneficios a continuación",
        benefits: ["3 a 4 beneficios concretos, frases cortas"],
        steps: [{ title: "...", description: "..." }],
        marketInsight: "observación sobre la coordinación venta/compra",
      },
    };

    const completion = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Aquí están los datos. Responda únicamente con un objeto JSON válido que respete el esquema.\n\n${JSON.stringify(
            userMessage,
            null,
            2
          )}`,
        },
      ],
    });

    const textBlock = completion.content.find((c) => c.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const parsed = extractJson(text);

    if (isValidReport(parsed)) {
      const payload: AnalyzeResponse = { scoring, report: parsed, generatedBy: "claude" };
      return NextResponse.json(payload);
    }
  } catch (err) {
    console.error("[analyze] Claude error", err);
  }

  const payload: AnalyzeResponse = { scoring, report: fallback, generatedBy: "fallback" };
  return NextResponse.json(payload);
}
