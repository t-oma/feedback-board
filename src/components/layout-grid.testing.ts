// Where the layout grid's content area starts at the viewport's width. The
// `PageMain` stories check the grid itself; this is for a page or header that
// has to line up with it.
export function contentEdge() {
  const page = document.documentElement.clientWidth;
  return Math.max(page >= 640 ? 40 : 20, (page - 1200) / 2);
}
