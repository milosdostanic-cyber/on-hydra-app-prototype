// Read-only scan. Replace PAGE_ID and ROOTS before running.

await figma.setCurrentPageAsync(page);
const arch = /archive|\bold\b|wip|exploration|deprecated/i;
const roots = ROOTS.length ? await Promise.all(ROOTS.map(id => figma.getNodeByIdAsync(id))) : [page];
const HYDRA = /^(OptionCard|Stat Tile|Empty State Block|RecommendationCard|FeatureCard|ExportCard|Sidebar|Topbar)$/;
const hydraInst = {}; const localComps = []; const groups = {}; const textHits = {};
const TXT = /^(No .* (yet|found)|These .* will be added|Selected file|Uploaded file|Overall assessment|Drag|Drop|Choose file|Coming soon|Select all|of \d+ selected|Adding|From your file|Your part)/i;
function screenOf(n) { let p = n; while (p.parent && p.parent.type !== 'SECTION' && p.parent.type !== 'PAGE') p = p.parent; return p; }
function setName(inst) { const m = inst.mainComponent; if (!m) return 'DETACHED?'; return (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent.name : m.name; }
function sig(n) {
  const kids = (n.children || []).filter(c => c.visible).slice(0, 6).map(c => {
    if (c.type === 'INSTANCE') return 'I:' + setName(c).slice(0, 18);
    if (c.type === 'TEXT') return 'T';
    if ('children' in c) return (c.layoutMode === 'HORIZONTAL' ? 'H' : c.layoutMode === 'VERTICAL' ? 'V' : 'F') + '(' + c.children.filter(k=>k.visible).slice(0,5).map(k => k.type === 'TEXT' ? 'T' : k.type === 'INSTANCE' ? 'I' : 'F').join('') + ')';
    return c.type[0];
  });
  return (n.layoutMode === 'HORIZONTAL' ? 'H' : n.layoutMode === 'VERTICAL' ? 'V' : 'F') + '[' + kids.join('|') + ']';
}
for (const root of roots) {
  if (!root) continue;
  const all = root.findAllWithCriteria({ types: ['FRAME', 'INSTANCE', 'COMPONENT', 'COMPONENT_SET', 'TEXT'] });
  for (const n of all) {
    const scr = screenOf(n);
    if (!scr.visible || arch.test(scr.name)) continue;
    if (n.type === 'INSTANCE') {
      const s = setName(n);
      if (HYDRA.test(s)) { const k = s + (n.mainComponent && n.mainComponent.remote ? ' (lib)' : ' (local)'); (hydraInst[k] = hydraInst[k] || new Set()).add(scr.id + '|' + scr.name.slice(0, 50)); }
      continue;
    }
    if (n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent.type !== 'COMPONENT_SET')) { localComps.push(n.id + '|' + n.name.slice(0, 60) + '|' + Math.round(n.width) + 'x' + Math.round(n.height)); continue; }
    if (n.type === 'TEXT') { const c = n.characters.trim(); if (c.length < 80 && TXT.test(c)) { (textHits[c.slice(0, 50)] = textHits[c.slice(0, 50)] || []).push(n.id + '@' + scr.id); } continue; }
    if (n === scr || n.type !== 'FRAME' || !n.visible) continue;
    const w = n.width, h = n.height;
    if (w < 140 || w > 1000 || h < 36 || h > 700) continue;
    const sw = n.strokeWeight; const hasStroke = (n.strokes || []).some(s => s.visible !== false) && (typeof sw !== 'number' || sw > 0);
    const hasFill = Array.isArray(n.fills) && n.fills.some(f => f.visible !== false && f.opacity !== 0);
    const r = typeof n.cornerRadius === 'number' ? n.cornerRadius : 1;
    if (!(hasStroke || (hasFill && r > 0))) continue;
    if (!n.children || n.children.length < 2) continue;
    const texts = n.findAllWithCriteria({ types: ['TEXT'] }).filter(t => t.visible);
    if (texts.length < 1 || texts.length > 14) continue;
    const key = sig(n) + (hasStroke ? 's' : '') + (hasFill ? 'f' : '');
    const g = groups[key] = groups[key] || { n: 0, screens: new Set(), ex: [] };
    g.n++; g.screens.add(scr.id);
    if (g.ex.length < 3) g.ex.push(n.id + ' ' + Math.round(w) + 'x' + Math.round(h) + ' "' + texts.slice(0, 2).map(t => t.characters.slice(0, 28).replace(/\n/g, ' ')).join(' / ') + '"');
  }
}
const G = Object.entries(groups).filter(([k, g]) => g.screens.size >= 1).sort((a, b) => b[1].screens.size - a[1].screens.size).slice(0, 70).map(([k, g]) => k + ' ×' + g.n + ' scr' + g.screens.size + ' :: ' + g.ex.join(' ; '));
return { hydra: Object.fromEntries(Object.entries(hydraInst).map(([k, v]) => [k, [...v].length + ' screens: ' + [...v].slice(0, 12).join(', ')])), localComps: localComps.slice(0, 40), textHits: Object.fromEntries(Object.entries(textHits).slice(0, 40).map(([k, v]) => [k, v.length + ' ' + v.slice(0, 3).join(',')])), groups: G };
