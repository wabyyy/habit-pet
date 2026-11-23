const strokes = {
  cup: '<path d="M8 8h20l-2 25H10Z" fill="#d9e9ec"/><path d="M9 16q10 4 18 0M8 8q10-4 20 0"/>',
  book: '<path d="M20 11C14 7 6 7 3 10v25c6-3 12-3 17 0 5-3 11-3 17 0V10c-6-3-12-3-17 1Z" fill="#fcf0d3"/><path d="M20 11v24M7 14q5-2 9 0m-9 5q5-2 9 0m8-5q5-2 9 0m-9 5q5-2 9 0"/>',
  dumbbell:
    '<path d="M10 18h20v7H10Z" fill="#bcc79c"/><rect x="6" y="10" width="6" height="23" rx="2" fill="#d2d9b4"/><rect x="28" y="10" width="6" height="23" rx="2" fill="#d2d9b4"/><path d="M3 15v13m34-13v13"/>',
  leaf: '<path d="M6 30C0 11 21 4 35 6c0 17-10 30-29 24Z" fill="#c7d69f"/><path d="M5 35 28 13M14 25l-2-9m9 2 9-1"/>',
  pen: '<path d="m8 28-2 9 9-2L35 12l-7-7Z" fill="#e9cfb7"/><path d="m25 9 7 6M8 28l7 7M5 38h24"/>',
  sun: '<circle cx="20" cy="20" r="9" fill="#f4dfa0"/><path d="M20 2v4m0 28v4M2 20h4m28 0h4M7 7l3 3m20 20 3 3M7 33l3-3m20-20 3-3"/>',
  headphones:
    '<path d="M6 24v-5a14 14 0 0 1 28 0v5"/><rect x="4" y="20" width="8" height="15" rx="4" fill="#e8d2ca"/><rect x="28" y="20" width="8" height="15" rx="4" fill="#e8d2ca"/>',
  plant:
    '<path d="M20 25V10m0 10C8 20 5 12 7 8c10-1 14 4 13 12Zm0-8C20 4 30 1 35 3c-1 9-6 13-15 9Z" fill="#c6d2a5"/><path d="M10 25h20l-3 13H13Z" fill="#e7c8af"/>',
  moon: '<path d="M31 29C15 34 7 19 17 6 1 10 1 31 15 35c6 2 13-1 16-6Z" fill="#f4e6b5"/><path d="m29 8 1-4 2 4 4 2-4 1-2 4-1-4-4-1Z" fill="#e3d3a7"/>',
  sunrise:
    '<path d="M5 28h30M10 28a10 10 0 0 1 20 0M20 5v6M5 14l4 4m22 0 4-4M8 34h24" fill="none"/>',
  check: '<path d="m10 20 7 7L31 12" fill="none" stroke-width="3"/>',
  plus: '<path d="M20 9v22M9 20h22" fill="none"/>',
  edit: '<path d="m9 27-1 7 7-1L32 15l-6-6ZM23 12l6 6M9 27l6 6" fill="none"/>',
  close: '<path d="m11 11 18 18M29 11 11 29" fill="none"/>',
  calendar:
    '<rect x="6" y="9" width="28" height="27" rx="4" fill="none"/><path d="M6 18h28M13 5v9m14-9v9M12 24h4m8 0h4m-16 6h4m8 0h4"/>',
  grid: '<rect x="6" y="6" width="11" height="11" rx="3" fill="none"/><rect x="23" y="6" width="11" height="11" rx="3" fill="none"/><rect x="6" y="23" width="11" height="11" rx="3" fill="none"/><rect x="23" y="23" width="11" height="11" rx="3" fill="none"/>',
  arrow: '<path d="m24 10-10 10 10 10" fill="none"/>',
  sprout:
    '<path d="M20 36V16C11 19 4 12 5 7c9-1 15 3 15 9Zm0 7c0-13 8-19 16-17 1 10-5 17-16 17Z" fill="#c6d2a5"/>',
  clock:
    '<circle cx="20" cy="20" r="15" fill="none"/><path d="M20 10v12l8 4"/>',
  list: '<path d="m5 9 3 3 5-6M18 10h17M5 22h7m6 0h17M5 33h7m6 0h17" fill="none"/>',
};
export function illustration(id, className = "") {
  return `<svg class="art-icon ${className}" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${strokes[id] || strokes.leaf}</svg>`;
}
export function sleepyCat() {
  return `<img class="sleepy-cat" src="${new URL("../assets/sleeping-cat.png", import.meta.url).href}" width="1774" height="887" alt="" aria-hidden="true" decoding="async">`;
}
export function vine() {
  return `<svg viewBox="0 0 170 205" class="hanging-vine" aria-hidden="true"><g fill="#d4ddba" stroke="#98a572" stroke-width="2"><path d="M80-10c-9 48 46 39 24 79s-2 58-20 94" fill="none"/><path d="M91 25C65 27 54 8 65 0c18 0 32 11 26 25Zm6 16c-7-24 8-41 23-29 7 20-5 33-23 29ZM98 65C72 65 55 49 66 37c22-3 35 9 32 28Zm5 12c-1-24 19-39 31-23 1 20-13 27-31 23Zm-7 28C75 110 60 96 66 83c16-6 30 3 30 22Zm-3 16c7-23 30-25 32-8-8 19-17 19-32 8Zm-3 21c-19 4-34-9-28-19 17-5 28 3 28 19Zm-6 22c3-22 24-27 30-14-3 16-17 19-30 14Z"/></g></svg>`;
}
