/**
 * Optional end-to-end browser test (Playwright).
 *
 *   npm run dev                      # in one terminal
 *   CHROME_PATH=/path/to/chrome npm run test:e2e
 *
 * Environment: BASE (default http://127.0.0.1:5173), CHROME_PATH (a Chrome/Chromium executable;
 * omit it to use a Playwright-managed browser if you ran `npx playwright-core install chromium`).
 */
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '  -> ' + extra)); };
const nodes = () => page.locator('[data-node]').count();
const nodeKeys = async () => (await page.locator('[data-node]').evaluateAll((els) => els.map((e) => +e.getAttribute('data-node')))).sort((a, b) => a - b);
const val = page.locator('input[inputmode="numeric"]').first();
const feedback = () => page.locator('[role="status"], [role="alert"]').filter({ hasText: /.+/ }).first().innerText().catch(() => '');
async function op(label, text) { await val.fill(text); await page.getByRole('button', { name: label, exact: true }).click(); await page.waitForTimeout(120); }
async function setMode(m) { await page.selectOption('#play-mode', m); }

// ---------- navigation ----------
await page.goto(BASE + '/');
const links = ['Home', 'Learn AVL Trees', 'Interactive Visualizer', 'Rotations Lab', 'Algorithms & Pseudocode', 'C Implementation', 'C++ Implementation', 'Complexity Analysis', 'Practice & Quiz', 'About'];
for (const l of links) {
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: new RegExp('^' + l.replace(/[+&]/g, (c) => '\\' + c)) }).first().click();
  await page.waitForTimeout(350);
  const h1 = await page.locator('h1').first().innerText();
  const active = await page.getByRole('navigation', { name: 'Main navigation' }).locator('a[aria-current="page"]').innerText();
  check(`nav: ${l} -> h1 "${h1.slice(0, 40)}", active item highlighted`, h1.length > 0 && active.includes(l.split(' ')[0]), active);
}
await page.goto(BASE + '/nonexistent');
check('404 page', (await page.locator('h1').innerText()).includes('does not exist'));

// ---------- visualizer ----------
await page.goto(BASE + '/visualizer');
await page.getByText('Your tree is empty').waitFor();
check('visualizer: empty state shown', await page.getByText('Your tree is empty').isVisible());
await setMode('instant');
await op('Insert', '');
check('validation: empty input', (await feedback()).includes('type a number'), await feedback());
await op('Insert', 'abc');
check('validation: non-number', (await feedback()).includes('not a number'), await feedback());
await op('Insert', '1.5');
check('validation: decimal', (await feedback()).includes('whole numbers'), await feedback());
await op('Insert', '99999999');
check('validation: huge value', (await feedback()).includes('too large'), await feedback());
check('validation: tree still empty', (await nodes()) === 0);
await op('Delete', '5');
check('delete from empty tree handled', (await feedback()).toLowerCase().includes('empty'), await feedback());
await op('Search', '5');
check('search in empty tree handled', (await feedback()).toLowerCase().includes('empty'), await feedback());
for (const k of ['10', '20', '30']) await op('Insert', k);
await page.waitForTimeout(700);
check('insert 10,20,30 -> 3 nodes', (await nodes()) === 3);
const rootPos = await page.locator('[data-node="20"]').evaluate((e) => e.getBoundingClientRect().top);
const topOf = async (k) => page.locator(`[data-node="${k}"]`).evaluate((e) => e.getBoundingClientRect().top);
check('RR rotation made 20 the root (highest node)', (await topOf(20)) < (await topOf(10)) && (await topOf(20)) < (await topOf(30)), `${rootPos}`);
check('valid AVL badge', await page.getByText('Valid AVL tree').isVisible());
await op('Insert', '20');
check('duplicate rejected with explanation', (await feedback()).includes('already'), await feedback());
check('duplicate left tree unchanged', (await nodes()) === 3);
await op('Delete', '999');
check('delete missing value', (await feedback()).includes('not in the tree'), await feedback());
// larger tree
await page.getByPlaceholder('10, 20, 30, 40').fill('40, 50, 25, 5, 15, 35');
await page.keyboard.press('Enter');
await page.waitForTimeout(800);
check('insert several -> 9 nodes', (await nodes()) === 9, String(await nodes()));
check('keys in tree', JSON.stringify(await nodeKeys()) === JSON.stringify([5, 10, 15, 20, 25, 30, 35, 40, 50]), JSON.stringify(await nodeKeys()));
// step playback: manual mode
await setMode('manual');
await op('Insert', '45');
const stepText = () => page.getByText(/Step \d+ \/ \d+/).first().innerText();
check('manual mode starts at step 1', (await stepText()).startsWith('Step 1 /'), await stepText());
await page.getByRole('button', { name: 'Next step' }).click();
await page.getByRole('button', { name: 'Next step' }).click();
check('next step advances', (await stepText()).startsWith('Step 3 /'), await stepText());
await page.getByRole('button', { name: 'Previous step' }).click();
check('previous step goes back', (await stepText()).startsWith('Step 2 /'), await stepText());
await page.getByRole('button', { name: 'Resume', exact: true }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: 'Pause' }).click();
check('pause works', await page.getByRole('button', { name: /^(Resume|Replay)$/ }).isVisible());
await page.selectOption('select[aria-label="Animation speed"]', '4');
await page.getByRole('button', { name: /^(Resume|Replay)$/ }).click();
await page.waitForFunction(() => /Step (\d+) \/ \1/.test(document.body.innerText), null, { timeout: 15000 });
check('playback runs to the final step at 4x', true);
await page.getByRole('button', { name: 'Restart operation' }).click();
await page.waitForTimeout(200);
check('restart goes to step 1/2', /Step [12] \//.test(await stepText()));
await page.getByRole('button', { name: 'Pause' }).click().catch(() => {});
// jump to the end via slider
await page.locator('input[aria-label="Step position"]').fill(String(10000)).catch(() => {});
// search
await setMode('instant');
await op('Search', '15');
check('search found', (await feedback()).includes('found'), await feedback());
await page.getByRole('button', { name: 'First step' }).first().click().catch(() => {});
await op('Search', '16');
check('search not found', (await feedback()).includes('not in the tree'), await feedback());
// traversals
await page.getByRole('button', { name: 'In-order', exact: true }).click();
await page.waitForTimeout(200);
const finalNote = await page.locator('text=/In-order: /').first().innerText().catch(() => '');
check('in-order traversal summary sorted', /In-order: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50\./.test(finalNote), finalNote);
for (const t of ['Pre-order', 'Post-order', 'Level-order']) {
  await page.getByRole('button', { name: t, exact: true }).click();
  await page.waitForTimeout(150);
}
check('all four traversals run', true);
// delete root & two-children
const before = await nodes();
await setMode('instant');
await op('Delete', '30');
await page.waitForTimeout(900);
check('delete root works', (await nodes()) === before - 1 && !(await nodeKeys()).includes(30), JSON.stringify(await nodeKeys()));
check('still valid AVL after delete', await page.getByText('Valid AVL tree').isVisible());
// undo / redo
await page.getByRole('button', { name: 'Undo' }).click();
await page.waitForTimeout(500);
check('undo restores deleted node', (await nodeKeys()).includes(30));
await page.getByRole('button', { name: 'Redo' }).click();
await page.waitForTimeout(500);
check('redo removes it again', !(await nodeKeys()).includes(30));
// random / clear / example
await page.getByRole('button', { name: 'Random' }).click();
await page.waitForTimeout(600);
const rn = await nodes();
check('random tree has 7-12 nodes', rn >= 7 && rn <= 12, String(rn));
check('random tree is valid AVL', await page.getByText('Valid AVL tree').isVisible());
await page.selectOption('select[aria-label="Load an example tree"]', 'fibonacci');
await page.waitForTimeout(600);
check('Fibonacci example loads 12 nodes', (await nodes()) === 12);
await op('Delete', '12');
check('cascading deletion ran', (await page.locator('text=/2 rotations were needed/').count()) >= 1, await feedback());
await page.getByRole('button', { name: 'Clear' }).click();
await page.waitForTimeout(500);
check('clear empties tree', (await nodes()) === 0);
// node inspection
await page.selectOption('select[aria-label="Load an example tree"]', 'balanced');
await page.waitForTimeout(600);
await page.locator('[data-node="20"]').click();
check('selecting a node shows properties', await page.getByText('Left subtree height').isVisible());
// pseudocode tab
await page.getByRole('tab', { name: 'Pseudocode' }).click();
check('pseudocode panel visible', await page.getByRole('region', { name: /Pseudocode for/ }).isVisible());
// zoom controls
await page.getByRole('button', { name: 'Zoom in' }).click();
await page.getByRole('button', { name: 'Fit tree to screen' }).click();
await page.getByRole('button', { name: 'Reset view to 100%' }).click();
check('zoom/fit/reset buttons work', true);
const zoomText = await page.getByText(/drag to pan/).innerText();
check('reset view shows 100%', zoomText.includes('100%'), zoomText);

// ---------- rotations ----------
await page.goto(BASE + '/rotations');
for (const c of ['LL', 'RR', 'LR', 'RL']) {
  await page.getByRole('tab', { name: new RegExp('^' + c + ' ') }).click();
  await page.waitForTimeout(300);
  check(`rotations: ${c} case renders summary`, await page.getByText(new RegExp(`Case [A-D]: ${c}`)).first().isVisible());
  await page.getByRole('button', { name: /Next step|Go to first/ }).first().isVisible();
  await page.locator('input[aria-label="Step position"]').first().evaluate((el) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, el.max); el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(250);
}
const prog = JSON.parse(await page.evaluate(() => localStorage.getItem('avl-lab:progress:v1')));
check('rotations explored saved to localStorage', prog.rotations.length === 4, JSON.stringify(prog.rotations));
check('rotation explored counter in sidebar', await page.getByText('4/4').first().isVisible());

// ---------- code viewer ----------
await page.goto(BASE + '/c');
await page.getByRole('button', { name: 'Copy the code that is currently shown' }).click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
const cSrc = readFileSync(resolve(ROOT, 'public/code/avl_tree.c'), 'utf8');
check('copy puts the exact C source on the clipboard', clip === cSrc, `${clip.length} vs ${cSrc.length}`);
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Download avl_tree\.c/ }).click()]);
const dlPath = await dl.path();
check('download gives avl_tree.c with correct content', dl.suggestedFilename() === 'avl_tree.c' && readFileSync(dlPath, 'utf8') === cSrc);
await page.getByRole('button', { name: 'rightRotate()' }).click();
check('function view shows just rightRotate', (await page.locator('pre[aria-label="C source code"] code').innerText()).includes('z->left = T2') && !(await page.locator('pre[aria-label="C source code"] code').innerText()).includes('#include'));
check('beginner explanation shown (6 points)', await page.getByText('Why does the left child move up?').isVisible());
await page.getByRole('button', { name: 'Complete implementation' }).click();
await page.getByLabel('Search in code').fill('leftRotate');
await page.waitForTimeout(250);
check('code search counts matches', await page.getByText(/\d+\/\d+/).first().isVisible());
await page.getByRole('tab', { name: 'C++' }).click();
const [dl2] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Download avl_tree\.cpp/ }).click()]);
check('download C++ source', readFileSync(await dl2.path(), 'utf8') === readFileSync(resolve(ROOT, 'public/code/avl_tree.cpp'), 'utf8'));
const raw = await page.request.get(BASE + '/code/avl_tree.c');
check('public /code/avl_tree.c served', raw.ok() && (await raw.text()) === cSrc);

// ---------- lessons ----------
await page.goto(BASE + '/learn/what-is-a-tree');
await page.getByRole('radio', { name: /Any leaf/ }).check();
await page.getByRole('button', { name: 'Check answer' }).click();
check('lesson knowledge check feedback', await page.getByText('Correct.').isVisible());
check('lesson marked complete', await page.getByRole('button', { name: 'Lesson completed' }).isVisible());
await page.getByRole('link', { name: /What is a Binary Search Tree/ }).last().click();
await page.waitForTimeout(400);
check('next lesson navigation', page.url().endsWith('/learn/binary-search-tree'));
const prog2 = JSON.parse(await page.evaluate(() => localStorage.getItem('avl-lab:progress:v1')));
check('lesson progress saved', prog2.lessons.includes('what-is-a-tree'));
for (const id of ['why-avl', 'what-is-avl', 'height-balance-factor']) {
  await page.goto(BASE + '/learn/' + id);
  await page.waitForTimeout(300);
  check(`lesson ${id} renders`, (await page.locator('h1').innerText()).length > 3);
}
// BF explorer
await page.getByRole('radio', { name: '-2' }).click();
check('BF explorer shows violation', await page.getByText('Violation.').isVisible());

// ---------- quiz ----------
await page.goto(BASE + '/practice');
await page.getByRole('button', { name: /Start Beginner/ }).click();
await page.waitForTimeout(200);
check('quiz: answer hidden before submit', (await page.getByText('Correct answer').count()) === 0);
const submit = page.getByRole('button', { name: 'Submit answer' });
check('quiz: submit disabled until answered', await submit.isDisabled());
let answeredCount = 0;
for (let i = 0; i < 11; i++) {
  const radios = page.getByRole('radio');
  if ((await radios.count()) > 0) await radios.first().check();
  else { await page.locator('input[inputmode="numeric"]').fill('1'); }
  await submit.click();
  await page.waitForTimeout(80);
  answeredCount++;
  const explain = await page.getByRole('status').filter({ hasText: /Correct!|Not quite/ }).count();
  if (i === 0) check('quiz: immediate feedback + explanation after submit', explain === 1);
  const finish = page.getByRole('button', { name: 'See results' });
  if (await finish.isVisible().catch(() => false)) { await finish.click(); break; }
  await page.getByRole('button', { name: 'Next question' }).click();
}
await page.waitForTimeout(300);
check('quiz: results page', await page.getByText(/\d+ \/ \d+/).first().isVisible());
const prog3 = JSON.parse(await page.evaluate(() => localStorage.getItem('avl-lab:progress:v1')));
check('quiz answers recorded in progress', Object.keys(prog3.quiz).length >= 10 && prog3.lastResult?.total >= 10, JSON.stringify(Object.keys(prog3.quiz).length));
await page.getByRole('button', { name: /Retry \(reshuffled\)/ }).click();
check('quiz retry starts a new session', await page.getByText(/Question 1 of/).isVisible());
await page.getByRole('button', { name: /Save & exit/ }).click();
check('save & exit offers Resume', await page.getByRole('button', { name: 'Resume' }).isVisible());
await page.reload();
await page.getByRole('button', { name: 'Resume' }).waitFor({ timeout: 5000 }).catch(() => {});
check('quiz session survives reload', await page.getByRole('button', { name: 'Resume' }).isVisible());
// progress persisted across reload
await page.goto(BASE + '/');
check('home progress reflects activity', /[1-9]/.test(await page.locator('[aria-label="Learning progress"]').innerText()));
// reset
await page.getByRole('button', { name: 'Reset progress' }).click();
await page.getByRole('button', { name: 'Yes, reset' }).click();
const prog4 = JSON.parse(await page.evaluate(() => localStorage.getItem('avl-lab:progress:v1')) ?? 'null');
check('reset clears progress', !prog4 || (prog4.lessons.length === 0 && Object.keys(prog4.quiz).length === 0));

// ---------- theme & motion ----------
await page.getByRole('button', { name: /Switch to light theme/ }).first().click();
check('light theme applied', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light');
await page.reload();
check('theme persisted', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light');
await page.getByRole('button', { name: /Reduce animations/ }).first().click();
check('animations setting applied', (await page.evaluate(() => document.documentElement.dataset.motion)) === 'off');
await page.goto(BASE + '/visualizer');
await page.getByRole('button', { name: /Switch to dark theme/ }).first().click();
await page.getByRole('button', { name: /Enable animations/ }).first().click();

// ---------- responsive ----------
for (const [w, h, name] of [[390, 844, 'mobile'], [768, 1024, 'tablet']]) {
  await page.setViewportSize({ width: w, height: h });
  for (const p of ['/', '/learn', '/learn/height-balance-factor', '/visualizer', '/rotations', '/algorithms', '/c', '/cpp', '/complexity', '/practice', '/about']) {
    await page.goto(BASE + p);
    await page.waitForTimeout(500);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${name} ${w}px: no horizontal overflow on ${p}`, over <= 1, 'overflow ' + over);
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE + '/');
await page.getByRole('button', { name: 'Open navigation menu' }).click();
check('mobile: nav drawer opens', await page.getByRole('dialog', { name: 'Navigation menu' }).isVisible());
await page.getByRole('dialog').getByRole('link', { name: /Interactive Visualizer/ }).click();
await page.waitForTimeout(400);
check('mobile: drawer navigates and closes', page.url().endsWith('/visualizer') && !(await page.getByRole('dialog', { name: 'Navigation menu' }).isVisible().catch(() => false)));
await page.waitForTimeout(500);

console.log('\nconsole/page errors:', JSON.stringify(errors, null, 1));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length || errors.length ? 1 : 0);
