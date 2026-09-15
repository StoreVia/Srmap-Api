import { TypingDifficulty } from './typingtest.types';

const EASY_WORD_BANK = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'with', 'as', 'not',
  'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his', 'from', 'they', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who',
  'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
  'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'water', 'long', 'very',
  'great', 'small', 'every', 'found', 'still', 'between', 'name', 'should', 'home', 'big', 'give', 'air', 'line',
  'set', 'own', 'under', 'read', 'last', 'never', 'life', 'always', 'those', 'both', 'paper', 'together', 'got',
  'group', 'often', 'run', 'important', 'until', 'side', 'feet', 'car', 'mile', 'walk', 'white', 'sea', 'began',
  'grow', 'took', 'river', 'four', 'carry', 'state', 'once', 'book', 'hear', 'stop', 'without', 'second', 'late',
  'miss', 'idea', 'enough', 'eat', 'face', 'watch', 'far', 'real', 'almost', 'let', 'above', 'girl', 'sometimes',
  'mountain', 'cut', 'young', 'talk', 'soon', 'list', 'song', 'being', 'leave', 'family', 'body', 'music', 'color'
];

const MEDIUM_PARAGRAPHS = [
  'In the heart of the bustling city, morning light filtered through the tall glass buildings, casting long shadows across the crowded streets. People hurried along the sidewalks, coffee cups in hand, ready to begin another productive day. Technology has fundamentally reshaped how we communicate, work, and collaborate across vast distances. While modern tools provide remarkable convenience, the value of meaningful human connection and deep focus remains irreplaceable. Every great achievement begins with patience, steady discipline, and a willingness to learn from every setback encountered along the way.',
  'Learning to write clean, effective code is both an art and a rigorous science. When developers approach a problem, they must balance algorithmic efficiency, readable architecture, and user accessibility. Modern web applications demand fast response times, secure authentication protocols, and intuitive interfaces. As digital systems continue to evolve, understanding core data structures and distributed computing becomes ever more vital. Success in software engineering is rarely about innate genius; rather, it is the result of continuous curiosity, rigorous testing, and persistent problem solving.',
  'Scientific discoveries have continually transformed our understanding of the universe, from the microscopic behavior of subatomic particles to the grand expansion of distant galaxies. Throughout history, bold innovators have questioned conventional wisdom, pushing the boundaries of human knowledge. Exploration requires courage, open minds, and an unwavering commitment to truth. When we look toward the future, the challenges of sustainable energy, global health, and ethical intelligence will demand our collective creativity, resilience, and international collaboration across all fields of study.'
];

const HARD_PARAGRAPHS = [
  'const streamHandler = async (req: Request, res: Response): Promise<void> => { try { const { session-id, max_retries = 3 } = req.headers; if (!session-id || typeof session-id !== "string") { return res.status(400).json({ error: "ERR_INVALID_HEADER", code: 400 }); } const payload-data = await db.query("SELECT id, hash_val, status FROM events WHERE retry_count <= ? AND is_active = 1;", [max_retries]); res.setHeader("X-RateLimit-Remaining", "99"); res.status(200).json({ success: true, count: payload-data.length, timestamp: Date.now() }); } catch (err) { logger.error(`[CRITICAL_FAIL]: ${err}`); res.status(500).end(); } };',
  'Architecture-Overview: Distributed event-driven pipelines leverage TCP/IP sockets (port: 8080/8443) with TLS-v1.3 encryption. When throughput exceeds 15,000 req/sec, asynchronous worker-pools must throttle buffer-allocation (min: 64KB, max: 2048KB). Ensure that semi-colon delimiters, hyphens, and quoted string-literals like "x-auth-token" and "content-disposition: inline;" are parsed with zero-copy memory buffers to avoid garbage-collection overhead. Algorithms with O(n*log(k)) complexity remain superior for priority-queue heaps under heavy-load scenarios.',
  'function BinarySearchTree<T>(comparator: (a: T, b: T) => number) { this.root = null; this.insert = function(val: T): boolean { if (!val) return false; const new-node = { key: val, left: null, right: null, height: 1 }; if (!this.root) { this.root = new-node; return true; } let curr = this.root; while (curr) { const diff = comparator(val, curr.key); if (diff === 0) return false; if (diff < 0) { if (!curr.left) { curr.left = new-node; break; } curr = curr.left; } else { if (!curr.right) { curr.right = new-node; break; } curr = curr.right; } } return true; }; }'
];

export const generateTypingPrompt = (difficulty: TypingDifficulty): string => {
  if (difficulty === 'easy') {
    const shuffled = [...EASY_WORD_BANK].sort(() => Math.random() - 0.5);
    const selected = [];
    while (selected.length < 130) {
      selected.push(...shuffled.slice(0, Math.min(shuffled.length, 130 - selected.length)));
    }
    return selected.slice(0, 130).join(' ');
  }

  if (difficulty === 'medium') {
    const chosen = MEDIUM_PARAGRAPHS[Math.floor(Math.random() * MEDIUM_PARAGRAPHS.length)];
    return chosen;
  }

  const chosen = HARD_PARAGRAPHS[Math.floor(Math.random() * HARD_PARAGRAPHS.length)];
  return chosen;
};
