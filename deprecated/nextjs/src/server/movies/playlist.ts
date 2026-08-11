export function playlistFromSegmentFile(segmentFile: string, segmentBaseUrl: string) {
  const lines = segmentFile
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.some((line) => line === "#EXTM3U")) return null;

  return lines.map((line) => {
    if (line.startsWith("#")) return line;
    return new URL(line, `${segmentBaseUrl}/`).toString();
  }).join("\n");
}