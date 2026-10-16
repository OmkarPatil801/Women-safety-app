/**
 * Cross-checks the shipped C and C++ programs (public/code) against the TypeScript engine.
 * Both programs are compiled with AddressSanitizer + UBSan (which also reports memory leaks),
 * driven through their menus with the same random operations, and compared with the engine.
 * The suite is skipped automatically when gcc/g++ are not installed.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { AvlTree } from './index';

const has = (cmd: string) => spawnSync(cmd, ['--version']).status === 0;
const available = has('gcc') && has('g++');
const codeDir = resolve(__dirname, '../../../public/code');

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

describe.skipIf(!available)('C and C++ programs match the TypeScript engine', () => {
  let dir = '';
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'avl-c-'));
    const san = ['-fsanitize=address,undefined', '-fno-omit-frame-pointer', '-g'];
    execFileSync('gcc', ['-std=c99', '-Wall', '-Wextra', '-pedantic', '-Werror', ...san, join(codeDir, 'avl_tree.c'), '-o', join(dir, 'c')]);
    execFileSync('g++', ['-std=c++11', '-Wall', '-Wextra', '-pedantic', '-Werror', ...san, join(codeDir, 'avl_tree.cpp'), '-o', join(dir, 'cpp')]);
  }, 120000);
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  function session(seed: number) {
    const rand = rng(seed);
    const tree = new AvlTree();
    const lines: string[] = [];
    for (let i = 0; i < 250; i++) {
      const key = Math.floor(rand() * 80) - 10;
      if (rand() < 0.6) {
        lines.push('1', String(key));
        tree.insert(key, { record: false });
      } else {
        lines.push('2', String(key));
        tree.delete(key, { record: false });
      }
    }
    lines.push('4', '5', '6', '7', '9', '0');
    return { input: lines.join('\n') + '\n', tree };
  }

  const tail = (out: string) => {
    const get = (label: string) => new RegExp(`${label}: ([^\\n]*)`).exec(out)?.[1].trim().split(/\s+/).filter(Boolean).map(Number) ?? [];
    return {
      inorder: get('In-order'),
      preorder: get('Pre-order'),
      postorder: get('Post-order'),
      levelorder: get('Level-order'),
      height: Number(/Tree height: (\d+)/.exec(out)?.[1]),
    };
  };

  for (const exe of ['c', 'cpp']) {
    for (const seed of [11, 22, 33]) {
      it(`${exe} program, seed ${seed}: same traversals/height as the engine, no leaks or UB`, () => {
        const { input, tree } = session(seed);
        const r = spawnSync(join(dir, exe), { input, encoding: 'utf8' });
        expect(r.stderr).toBe(''); // sanitizers print to stderr
        expect(r.status).toBe(0);
        const got = tail(r.stdout);
        expect(got.inorder).toEqual(tree.inorder());
        expect(got.preorder).toEqual(tree.preorder());
        expect(got.postorder).toEqual(tree.postorder());
        expect(got.levelorder).toEqual(tree.levelorder());
        expect(got.height).toBe(tree.height);
      });
    }
  }

  it('handles empty tree, bad input and EOF without crashing', () => {
    for (const exe of ['c', 'cpp']) {
      const r = spawnSync(join(dir, exe), { input: '2\n5\n3\n7\nabc\n1\nxyz\n4\n7\n8\n99\n', encoding: 'utf8' });
      expect(r.status).toBe(0);
      expect(r.stderr).toBe('');
      expect(r.stdout).toMatch(/Tree is empty/);
    }
  });
});
