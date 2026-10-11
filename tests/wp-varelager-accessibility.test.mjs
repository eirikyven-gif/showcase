import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('vibe/wp-varelager/index.html');
const js = read('vibe/wp-varelager/app.js');
const css = read('vibe/wp-varelager/style.css');

function contrast(foreground, background) {
  const luminance = (color) => {
    const channels = color.match(/[\da-f]{2}/gi).map((value) => parseInt(value, 16) / 255);
    const [r, g, b] = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('portal tabs implement the single-stop, labelled tab and panel pattern', () => {
  assert.match(html, /id="tab-varer"[^>]*role="tab"[^>]*aria-controls="view"[^>]*aria-selected="true"[^>]*tabindex="0"/);
  assert.equal([...html.matchAll(/role="tab"/g)].length, 6);
  assert.match(html, /id="view" role="tabpanel" aria-labelledby="tab-varer" tabindex="0"/);
  assert.match(js, /event\.key==='ArrowRight'/);
  assert.match(js, /event\.key==='ArrowLeft'/);
  assert.match(js, /event\.key==='Home'/);
  assert.match(js, /event\.key==='End'/);
  assert.match(js, /tab\.tabIndex=selected\?0:-1/);
  assert.match(js, /setAttribute\('aria-labelledby',`tab-\$\{currentTab\}`\)/);
});

test('dynamic rerenders and native modal close restore keyboard focus', () => {
  assert.match(js, /function focusInfo\(/);
  assert.match(js, /function restoreFocus\(/);
  assert.match(js, /addEventListener\('close',\(\)=>\{const focus=dialogReturnFocus;dialogReturnFocus=null;revokeAttachmentPreview\(\);attachmentDraftFile=null;restoreFocus\(focus\)\}\)/);
  assert.match(js, /addEventListener\('cancel',event=>\{event\.preventDefault\(\);closeEditor\(\)\}\)/);
  assert.match(js, /data-admin-return[\s\S]*?\[data-admin-view=/);
  assert.match(html, /<dialog id="editor-dialog" aria-labelledby="editor-title">/);
  assert.match(js, /d\.showModal\(\)/);
  assert.match(js, /event\.key!=='Tab'[\s\S]*?event\.preventDefault\(\);last\.focus\(\)/);
  assert.match(js, /event\.preventDefault\(\);first\.focus\(\)/);
});

test('normal text and focus indicators meet the tested contrast thresholds', () => {
  const ink = css.match(/--ink:(#[\da-f]{6})/i)[1];
  const muted = css.match(/--muted:(#[\da-f]{6})/i)[1];
  const wash = css.match(/--wash:(#[\da-f]{6})/i)[1];
  const paper = '#ffffff';
  assert.ok(contrast(ink, paper) >= 4.5);
  assert.ok(contrast(muted, wash) >= 4.5);
  assert.ok(contrast(muted, paper) >= 4.5);
  assert.match(css, /:focus-visible\{outline:3px solid #005fcc/);
  assert.ok(contrast('#005fcc', paper) >= 3);
  assert.ok(contrast('#005fcc', wash) >= 3);
});

test('settings actions expose item-specific accessible names', () => {
  assert.match(js, /aria-label="Rediger \$\{esc\(title\.toLocaleLowerCase\('nb'\)\)\}: \$\{esc\(v\)\}"/);
  assert.match(js, /aria-label="Slett \$\{esc\(title\.toLocaleLowerCase\('nb'\)\)\}: \$\{esc\(v\)\}"/);
  assert.match(js, /aria-label="Rediger egendefinert felt \$\{esc\(m\.label\)\}"/);
  assert.match(js, /aria-label="Slett egendefinert felt \$\{esc\(m\.label\)\}"/);
  assert.match(js, /aria-label="Vis \$\{esc\(x\.name\)\}"/);
});
