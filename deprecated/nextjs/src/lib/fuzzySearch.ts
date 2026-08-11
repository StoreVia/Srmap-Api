
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return track[str2.length][str1.length];
}

function isSubsequence(query: string, text: string): boolean {
  let qIdx = 0;
  let tIdx = 0;
  while (qIdx < query.length && tIdx < text.length) {
    if (query[qIdx] === text[tIdx]) {
      qIdx++;
    }
    tIdx++;
  }
  return qIdx === query.length;
}

export function fuzzyMatch(text: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!text) return false;

  const normalizedText = text.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedText.includes(normalizedQuery)) return true;

  if (normalizedQuery.length >= 3 && isSubsequence(normalizedQuery, normalizedText)) {
    return true;
  }

  const textWords = normalizedText.split(/[\s\-_:]+/).filter(Boolean);
  const queryWords = normalizedQuery.split(/[\s\-_:]+/).filter(Boolean);

  for (const qWord of queryWords) {
    if (qWord.length < 2) continue;

    let wordMatched = false;
    for (const tWord of textWords) {
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        wordMatched = true;
        break;
      }

      const dist = levenshteinDistance(qWord, tWord);
      const maxAllowedDistance = qWord.length <= 4 ? 1 : 2;
      if (dist <= maxAllowedDistance) {
        wordMatched = true;
        break;
      }
    }

    if (wordMatched) return true;
  }

  return false;
}