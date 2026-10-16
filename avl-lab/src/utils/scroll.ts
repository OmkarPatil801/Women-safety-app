/** Scroll `container` just enough to show `el`, without moving the page (unlike Element.scrollIntoView). */
export function revealInContainer(container: HTMLElement | null, el: HTMLElement | null, center = false): void {
  if (!container || !el) return;
  const c = container.getBoundingClientRect();
  const e = el.getBoundingClientRect();
  if (center) {
    container.scrollTop += e.top - c.top - (c.height - e.height) / 2;
  } else if (e.top < c.top) {
    container.scrollTop += e.top - c.top - 4;
  } else if (e.bottom > c.bottom) {
    container.scrollTop += e.bottom - c.bottom + 4;
  }
}
