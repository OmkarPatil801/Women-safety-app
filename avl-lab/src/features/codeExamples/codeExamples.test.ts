import { describe, expect, it } from 'vitest';
import { FUNCTION_DOCS } from './functionDocs';
import { FUNCTIONS, findRange } from './functionIndex';
import { SOURCES, type Lang } from './sources';
import { tokenizeSource } from '../../components/code/highlight';

describe('code examples', () => {
  for (const lang of ['c', 'cpp'] as Lang[]) {
    const lines = SOURCES[lang].text.split('\n');
    it(`${lang}: every indexed function is found, has a sane range and documentation`, () => {
      for (const fn of FUNCTIONS[lang]) {
        const r = findRange(lines, fn.match);
        expect(r, `${lang} ${fn.id}`).not.toBeNull();
        expect(r!.end).toBeGreaterThanOrEqual(r!.start);
        expect(lines[r!.end].includes('}'), `${lang} ${fn.id} ends on a brace`).toBe(true);
        expect(FUNCTION_DOCS[fn.id], `docs for ${fn.id}`).toBeTruthy();
      }
    });
    it(`${lang}: tokenizer round-trips the source exactly`, () => {
      const tokens = tokenizeSource(SOURCES[lang].text);
      expect(tokens.map((l) => l.map((t) => t.text).join('')).join('\n')).toBe(SOURCES[lang].text);
    });
    it(`${lang}: contains every required function`, () => {
      const text = SOURCES[lang].text;
      for (const name of ['rightRotate', 'leftRotate', 'inorder', 'preorder', 'postorder', 'levelOrder', 'minValueNode', 'getBalance']) {
        expect(text).toContain(name);
      }
    });
  }
  it('the right-rotation range covers the whole function', () => {
    const lines = SOURCES.c.text.split('\n');
    const r = findRange(lines, 'Node *rightRotate(')!;
    const body = lines.slice(r.start, r.end + 1).join('\n');
    expect(body).toContain('return y;');
    expect(body).toContain('z->left = T2;');
  });
});
