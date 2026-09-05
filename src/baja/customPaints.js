/**
 * Persistence for user-mixed paints.
 *
 * These are stored in a real cookie rather than localStorage. Cookies are capped
 * near 4KB per domain and ride along with every request to the site, so each
 * design is kept deliberately small (short keys, no whitespace) and the list is
 * capped — see MAX_DESIGNS.
 */

const COOKIE_NAME = 'baja_custom_paints';
const MAX_AGE_DAYS = 365;
export const MAX_DESIGNS = 12;

function readRawCookie(name) {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

function writeRawCookie(name, value) {
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
}

/** stored shape is intentionally terse: {i:id, n:name, b:body, c:clad, f:finish} */
function toStored(design) {
  return { i: design.id, n: design.name, b: design.bodyHex, c: design.claddingHex, f: design.finish };
}

function fromStored(row) {
  return {
    id: row.i,
    name: row.n,
    bodyHex: row.b,
    claddingHex: row.c,
    finish: row.f,
    custom: true,
  };
}

export function loadCustomPaints() {
  const raw = readRawCookie(COOKIE_NAME);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed.map(fromStored) : [];
  } catch {
    // a malformed cookie should never take the page down with it
    return [];
  }
}

export function saveCustomPaints(designs) {
  const trimmed = designs.slice(0, MAX_DESIGNS).map(toStored);
  writeRawCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(trimmed)));
  return trimmed.length;
}

export function makeDesignId() {
  return `c${Date.now().toString(36)}`;
}

/** #abc and #aabbcc both accepted; returns a normalised #aabbcc or null */
export function normaliseHex(input) {
  const value = String(input || '').trim().replace(/^#?/, '');
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    const [r, g, b] = value.split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) return `#${value.toLowerCase()}`;
  return null;
}
