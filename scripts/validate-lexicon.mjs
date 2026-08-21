import fs from "node:fs";
import { verifiedExamLexicon } from "../app/verified-exam-lexicon.ts";
import { vocabularyMemberships } from "../app/vocabulary-memberships.ts";
import { wordExamples } from "../app/word-examples.ts";

const page = fs.readFileSync("app/page.tsx", "utf8");

function between(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error(`Could not find block ${start}`);
  return source.slice(from, to);
}

function matchAll(source, pattern, group = 1) {
  return [...source.matchAll(pattern)].map((match) => match[group]);
}

const baseWords = matchAll(between(page, "const baseWordBank", "const expandedWordData"), /\bword:\s*"([^"]+)"/g);
const expandedWords = matchAll(between(page, "const expandedWordData", "const expandedWordBank"), /\["([^"]+)",\s*"(?:noun|verb|adjective|adverb)"/g);
const advancedWords = matchAll(between(page, "const advancedWordData", "const advancedWordBank"), /\["([^"]+)",\s*"(?:noun|verb|adjective|adverb)"/g);
const examLines = page.match(/const examWordLines = `([\s\S]*?)`\.trim\(\)/)?.[1]
  ?.trim().split(/\r?\n/).filter(Boolean) ?? [];
const examWords = examLines.map((line) => line.split("|")[0]);
const words = [...new Set([...baseWords, ...expandedWords, ...advancedWords, ...examWords])];
const curatedIpa = new Map(matchAll(page, /\["([^"]+)",\s*"(\/[^\"]+\/(?:;\s*\/[^\"]+\/)?)"\]/g, 0).map((entry) => {
  const [, word, ipa] = entry.match(/\["([^"]+)",\s*"(\/[^\"]+\/(?:;\s*\/[^\"]+\/)?)"\]/);
  return [word, ipa];
}));
const verifiedEntries = new Map(Object.entries(verifiedExamLexicon));
const failures = [];

for (const word of words) {
  const exam = verifiedEntries.get(word);
  const ipa = curatedIpa.get(word) ?? exam?.ipa;
  if (!ipa) failures.push(`${word}: missing IPA`);

  const item = wordExamples[word];
  if (!item) {
    failures.push(`${word}: missing example entry`);
    continue;
  }
  const tokenCount = item.example.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g)?.length ?? 0;
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordPattern = new RegExp(`(?<![a-z])${escapedWord}(?:s|es|ed|ing)?(?![a-z])`, "i");
  if (!item.example.trim()) failures.push(`${word}: missing English example`);
  if (!item.exampleCn.trim()) failures.push(`${word}: missing Chinese example`);
  if (tokenCount < 6 || tokenCount > 22) failures.push(`${word}: example length ${tokenCount} outside 6-22 words`);
  if (!wordPattern.test(item.example)) failures.push(`${word}: target word absent from example`);
}

for (const word of examWords) {
  const entry = verifiedEntries.get(word);
  if (!entry) {
    failures.push(`${word}: missing verified exam entry`);
    continue;
  }
  if (!entry.ipa) failures.push(`${word}: missing verified exam IPA`);
  if (!entry.part) failures.push(`${word}: missing verified exam part`);
  if (!entry.definition) failures.push(`${word}: missing verified exam English definition`);
  if (!entry.cn) failures.push(`${word}: missing verified exam Chinese gloss`);
}

const examples = Object.values(wordExamples).map((item) => item.example.toLowerCase());
if (new Set(examples).size !== examples.length) failures.push("duplicate example sentences found");
if (Object.keys(wordExamples).length !== words.length) failures.push(`example count mismatch: expected ${words.length}, got ${Object.keys(wordExamples).length}`);
if (words.length !== 1113) failures.push(`word count changed: expected 1113, got ${words.length}`);

const expectedVocabularyListSizes = { cet4: 500, cet6: 500, gaokao: 500, ielts: 500, visual: 46, advanced: 298 };

for (const [listId, listWords] of Object.entries(vocabularyMemberships)) {
  const expectedSize = expectedVocabularyListSizes[listId];
  if (listWords.length !== expectedSize) failures.push(`${listId}: expected ${expectedSize} words, got ${listWords.length}`);
  if (new Set(listWords).size !== listWords.length) failures.push(`${listId}: duplicate membership found`);
  for (const word of listWords) {
    if (!words.includes(word)) failures.push(`${listId}: unknown word ${word}`);
  }
}

if (failures.length > 0) {
  console.error(`Lexicon validation failed with ${failures.length} issue(s):`);
  console.error(failures.slice(0, 80).join("\n"));
  process.exit(1);
}

console.log(`Lexicon validation passed: ${words.length} words, ${examWords.length} verified exam rows, ${examples.length} bilingual examples.`);
