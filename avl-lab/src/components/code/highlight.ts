/** Tiny, dependency-free C/C++ highlighter (comments, strings, preprocessor, keywords, types, numbers, calls). */
export interface Token {
  text: string;
  cls?: 'kw' | 'ty' | 'str' | 'num' | 'cm' | 'pp' | 'fn';
}

const KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'struct', 'typedef', 'static',
  'const', 'sizeof', 'class', 'public', 'private', 'explicit', 'new', 'delete', 'nullptr', 'NULL', 'true', 'false', 'using',
  'namespace', 'this', 'enum', 'EXIT_FAILURE', 'EXIT_SUCCESS', 'EOF',
]);
const TYPES = new Set(['int', 'char', 'void', 'long', 'short', 'float', 'double', 'unsigned', 'bool', 'size_t', 'Node', 'Queue', 'AVLTree', 'std', 'string', 'queue', 'streamsize', 'FILE']);

export function tokenizeLine(line: string, inBlock: boolean): { tokens: Token[]; inBlock: boolean } {
  const tokens: Token[] = [];
  let i = 0;
  const push = (text: string, cls?: Token['cls']) => text && tokens.push({ text, cls });

  if (inBlock) {
    const end = line.indexOf('*/');
    if (end === -1) return { tokens: [{ text: line, cls: 'cm' }], inBlock: true };
    push(line.slice(0, end + 2), 'cm');
    i = end + 2;
    inBlock = false;
  }
  if (/^\s*#/.test(line.slice(i)) && i === 0) {
    return { tokens: [{ text: line, cls: 'pp' }], inBlock: false };
  }
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest.startsWith('//')) {
      push(rest, 'cm');
      break;
    }
    if (rest.startsWith('/*')) {
      const end = rest.indexOf('*/', 2);
      if (end === -1) {
        push(rest, 'cm');
        inBlock = true;
        break;
      }
      push(rest.slice(0, end + 2), 'cm');
      i += end + 2;
      continue;
    }
    const ch = line[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) j += line[j] === '\\' ? 2 : 1;
      push(line.slice(i, j + 1), 'str');
      i = j + 1;
      continue;
    }
    const num = /^\d+(\.\d+)?/.exec(rest);
    if (num && !/[A-Za-z_]/.test(line[i - 1] ?? '')) {
      push(num[0], 'num');
      i += num[0].length;
      continue;
    }
    const id = /^[A-Za-z_]\w*/.exec(rest);
    if (id) {
      const w = id[0];
      const after = line.slice(i + w.length).trimStart();
      if (KEYWORDS.has(w)) push(w, 'kw');
      else if (TYPES.has(w)) push(w, 'ty');
      else if (after.startsWith('(')) push(w, 'fn');
      else push(w);
      i += w.length;
      continue;
    }
    push(ch);
    i += 1;
  }
  return { tokens, inBlock };
}

export function tokenizeSource(src: string): Token[][] {
  let inBlock = false;
  return src.split('\n').map((line) => {
    const r = tokenizeLine(line, inBlock);
    inBlock = r.inBlock;
    return r.tokens;
  });
}
