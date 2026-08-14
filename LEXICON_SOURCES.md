# Wordoria Lexicon Sources

Wordoria's bilingual example collection combines original sentences with examples selected from open lexical resources. Automated checks verify coverage, target-word presence, sentence length, duplicate removal, and the presence of a Chinese translation. Machine-ranked or machine-translated entries should not be described as individually human-certified.

## Sources

- **Tatoeba** sentence exports: example sentences and, where available, Chinese translations. Sentence records are distributed under CC BY 2.0 FR unless an individual sentence states a different license. Source: https://tatoeba.org/en/downloads
- **WordNet 3.0**: sense matching and selected usage examples under the WordNet license. Source: https://wordnet.princeton.edu/license-and-commercial-use
- **English Wiktionary**, accessed through Free Dictionary API: selected usage examples under Wiktionary's Creative Commons Attribution-ShareAlike terms. Sources: https://en.wiktionary.org/ and https://dictionaryapi.dev/
- **Wordoria original**: newly written examples and manually corrected entries created for this project.

Each entry in `app/word-examples.ts` retains a source category and review status. The local preparation workspace also retains sentence identifiers and contributor names for source-level review; that workspace is intentionally excluded from Git because it contains large downloaded corpora and models.
