const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

async function ask(prompt: string): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Gemini] HTTP ${res.status}:`, errText);
    throw new Error(`Gemini ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) {
    console.error("[Gemini] empty response:", data);
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}

// pulls the first {...} or [...] block out of any string
function extractJSON<T>(raw: string, kind: "object" | "array"): T {
  const stripped = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const pattern = kind === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = stripped.match(pattern);

  if (!match) {
    console.error("[Gemini] no JSON found in:", stripped.slice(0, 300));
    throw new Error(`Gemini response had no valid JSON. Got: ${stripped.slice(0, 200)}`);
  }

  try {
    return JSON.parse(match[0]) as T;
  } catch {
    console.error("[Gemini] JSON parse failed:", match[0].slice(0, 300));
    throw new Error(`Gemini JSON parse error. Raw snippet: ${match[0].slice(0, 200)}`);
  }
}

// ── notes ──────────────────────────────────────────────────────────────────

export interface GeminiNote {
  title: string;
  overview: string;
  objectives: string[];
  keyConcepts: string[];
  definitions: string[];
  importantPoints: string[];
  examples: string[];
  summary: string;
}

export async function generateNoteWithGemini(topic: string, sourceText?: string): Promise<GeminiNote> {
  const context = sourceText?.trim()
    ? `\n\nSource material provided by the student:\n"""\n${sourceText.slice(0, 4000)}\n"""`
    : "";

  const prompt = `You are a study assistant generating structured notes for a student.
Topic: "${topic}"${context}

Return ONLY a JSON object matching this exact shape:
{
  "title": "concise note title (max 8 words)",
  "overview": "2-3 sentence overview of the topic",
  "objectives": ["learning objective 1", "learning objective 2", "learning objective 3"],
  "keyConcepts": ["concept 1", "concept 2", "concept 3", "concept 4"],
  "definitions": ["Term - definition", "Term - definition", "Term - definition"],
  "importantPoints": ["point 1", "point 2", "point 3"],
  "examples": ["example 1", "example 2"],
  "summary": "1-2 sentence summary"
}

Keep each bullet to one sentence. Return only the JSON, no markdown fences.`;

  const raw = await ask(prompt);
  return extractJSON<GeminiNote>(raw, "object");
}

// ── flashcards ─────────────────────────────────────────────────────────────

export interface GeminiCard {
  front: string;
  back: string;
}

export async function generateFlashcardsWithGemini(topic: string, count = 8): Promise<GeminiCard[]> {
  const prompt = `You are a study assistant creating flashcards for a student.
Topic: "${topic}"
Generate exactly ${count} flashcard question/answer pairs.

Return ONLY a JSON array:
[{"front":"question","back":"answer"}]

Rules: concise answers (1-2 sentences), vary question types, return only raw JSON.`;

  const raw = await ask(prompt);
  return extractJSON<GeminiCard[]>(raw, "array");
}

// ── flashcards from note sections ──────────────────────────────────────────

export async function generateFlashcardsFromSectionsWithGemini(
  noteTitle: string,
  sections: { heading: string; bullets: string[] }[],
  count = 12
): Promise<GeminiCard[]> {
  const noteContent = sections
    .map((s) => `${s.heading}:\n${s.bullets.map((b) => `- ${b}`).join("\n")}`)
    .join("\n\n");

  const prompt = `You are a study assistant creating flashcards from a student's notes.
Note title: "${noteTitle}"

Note content:
${noteContent.slice(0, 3000)}

Generate exactly ${count} flashcard question/answer pairs based on the notes above.
Return ONLY a JSON array:
[{"front":"question","back":"answer"}]

Base every question on the notes. Return only raw JSON.`;

  const raw = await ask(prompt);
  return extractJSON<GeminiCard[]>(raw, "array");
}

// ── study buddy ────────────────────────────────────────────────────────────

export async function askStudyBuddy(
  subjectName: string,
  question: string,
  noteContext: string
): Promise<string> {
  const hasNotes = noteContext.trim().length > 0;

  const prompt = hasNotes
    ? `You are a helpful study assistant for a student studying "${subjectName}".

Student's saved notes:
"""
${noteContext.slice(0, 3000)}
"""

Question: "${question}"

Answer based on the notes when possible. If not covered, use general knowledge and say so. Keep it under 4 sentences.`
    : `You are a helpful study assistant for a student studying "${subjectName}".
No notes saved yet.

Question: "${question}"

Answer from general knowledge. Keep it under 4 sentences. Encourage generating notes on this topic.`;

  return ask(prompt);
}

// ── grade image/pdf scanner ────────────────────────────────────────────────

export async function parseGradingFileWithGemini(
  base64Data: string,
  mimeType: string
): Promise<{ name: string; weight: number }[]> {
  console.log("[Gemini vision] sending mime type:", mimeType);

  // gemini-flash vision only supports images, not pdf
  // if it's a pdf we shouldn't be calling this — caller handles that
  const isImage = mimeType.startsWith("image/");
  if (!isImage) {
    throw new Error(`File type "${mimeType}" cannot be read as an image. Please upload a PNG, JPG, or WebP screenshot of your syllabus instead.`);
  }

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
            {
              text: `Look at this image and extract every grading category with its percentage weight.

Return ONLY a JSON array like this:
[{"name":"Exams","weight":30},{"name":"Quizzes","weight":20}]

Rules:
- "name" is the category label (string)
- "weight" is the percentage as a plain number, no % sign
- only include items that have a clear percentage
- return raw JSON array only, nothing else`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Gemini vision] HTTP ${res.status}:`, errText);
    throw new Error(`Gemini ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  console.log("[Gemini vision] raw:", JSON.stringify(text));

  if (!text) {
    console.error("[Gemini vision] full response:", JSON.stringify(data));
    throw new Error("Gemini returned an empty response. The image may be unclear — try a higher quality screenshot.");
  }

  const parsed = extractJSON<{ name: string; weight: number }[]>(text, "array");
  return parsed.filter((item) => item.name && typeof item.weight === "number" && item.weight > 0);
}

// ── grade text scanner (for PDFs / pasted text) ───────────────────────────

export async function parseGradingTextWithGemini(
  text: string
): Promise<{ name: string; weight: number }[]> {
  const prompt = `Extract every grading category and its percentage weight from this syllabus text.

Text:
"""
${text.slice(0, 4000)}
"""

Return ONLY a JSON array:
[{"name":"Exams","weight":30},{"name":"Quizzes","weight":20}]

Rules:
- "name" is the category label (string)
- "weight" is the percentage as a plain number, no % sign
- only include items with an explicit percentage
- return raw JSON array only, nothing else`;

  const raw = await ask(prompt);
  console.log("[Gemini text] raw:", raw);
  const parsed = extractJSON<{ name: string; weight: number }[]>(raw, "array");
  return parsed.filter((item) => item.name && typeof item.weight === "number" && item.weight > 0);
}
