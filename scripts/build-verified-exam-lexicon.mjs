import fs from "node:fs/promises";
import path from "node:path";

const pagePath = path.join(process.cwd(), "app", "page.tsx");
const outputPath = path.join(process.cwd(), "app", "verified-exam-lexicon.ts");
const auditPath = path.join(process.cwd(), "LEXICON_AUDIT.md");
const cachePath = path.join(process.cwd(), ".lexicon-cache.json");

function extractExamLines(source) {
  const match = source.match(/const examWordLines = `([\s\S]*?)`\.trim\(\)/);
  if (!match) throw new Error("Could not find examWordLines in app/page.tsx");
  return match[1]
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [word, level, cn] = line.split("|");
      return { word, level, cn };
    });
}

function normalizeIpa(text) {
  return text
    .replace(/\./g, "")
    .replace(/[()]/g, "")
    .replace(/ɹ/g, "r")
    .replace(/ɚ/g, "ə")
    .replace(/ɝ/g, "ɜː")
    .replace(/ːː/g, "ː")
    .replace(/\s+/g, "")
    .trim();
}

function pickIpa(phonetics = []) {
  const texts = phonetics
    .map((phonetic) => phonetic?.text)
    .filter((text) => typeof text === "string" && /^\/.+\/$/.test(text))
    .map(normalizeIpa);
  const withoutSyllabic = texts.find((text) => !/[̩]/u.test(text));
  return withoutSyllabic ?? texts[0] ?? "";
}

function pickMeaning(meanings = []) {
  const meaning = meanings.find((item) => item?.partOfSpeech && item?.definitions?.[0]?.definition);
  if (!meaning) return { part: "", definition: "" };
  return {
    part: meaning.partOfSpeech,
    definition: meaning.definitions[0].definition.replace(/\s+/g, " ").trim(),
  };
}

async function readCache() {
  try {
    return JSON.parse(await fs.readFile(cachePath, "utf8"));
  } catch {
    return {};
  }
}

async function writeCache(cache) {
  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

async function fetchEntry(word, cache) {
  if (cache[word]) return cache[word];
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const first = payload[0] ?? {};
      const ipa = pickIpa(first.phonetics);
      const meaning = pickMeaning(first.meanings);
      cache[word] = { ipa, ...meaning, source: url };
      return cache[word];
    } catch (error) {
      if (attempt === 3) {
        cache[word] = { ipa: "", part: "", definition: "", source: url, error: String(error?.message ?? error) };
        return cache[word];
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    }
  }
}

function toTsString(value) {
  return JSON.stringify(value);
}

function renderLexicon(entries) {
  const rows = entries.map(({ word, cn, data }) => {
    return `  ${toTsString(word)}: { ipa: ${toTsString(data.ipa)}, part: ${toTsString(data.part)}, definition: ${toTsString(data.definition)}, cn: ${toTsString(cn)} },`;
  });

  return `export type VerifiedExamLexiconEntry = {
  ipa: string;
  part: string;
  definition: string;
  cn: string;
};

export const verifiedExamLexicon = {
${rows.join("\n")}
} as const satisfies Record<string, VerifiedExamLexiconEntry>;
`;
}

function renderAudit(entries) {
  const missing = entries.filter(({ data }) => !data.ipa || !data.part || !data.definition);
  const lines = [
    "# Wordoria Lexicon Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Source used for the initial exam-word pass:",
    "- Free Dictionary API: https://dictionaryapi.dev/",
    "",
    "Policy:",
    "- IPA is normalized for display by removing syllable dots and rhotic helper symbols where needed.",
    "- Chinese glosses remain Wordoria's study glosses from the existing CET/Contest source list.",
    "- Entries in the unresolved section must be manually checked before claiming dictionary-grade coverage.",
    "",
    `Exam entries checked: ${entries.length}`,
    `Unresolved entries: ${missing.length}`,
    "",
    "## Unresolved",
    "",
    ...missing.map(({ word, data }) => `- ${word}: ${data.error ?? "missing IPA, part, or definition"}`),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

const source = await fs.readFile(pagePath, "utf8");
const examLines = extractExamLines(source);
const cache = await readCache();
const entries = [];

for (const [index, entry] of examLines.entries()) {
  const data = await fetchEntry(entry.word, cache);
  entries.push({ ...entry, data });
  if ((index + 1) % 25 === 0) {
    await writeCache(cache);
    console.log(`Fetched ${index + 1}/${examLines.length}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 80));
}

await writeCache(cache);
await fs.writeFile(outputPath, renderLexicon(entries), "utf8");
await fs.writeFile(auditPath, renderAudit(entries), "utf8");

const unresolved = entries.filter(({ data }) => !data.ipa || !data.part || !data.definition);
console.log(`Generated ${outputPath}`);
console.log(`Unresolved entries: ${unresolved.length}`);
