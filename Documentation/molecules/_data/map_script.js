const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const out = [];
const arch = /archive|old|wip|exploration|deprecated/i;
function walk(n, path, depth) {
  for (const c of n.children || []) {
    if (c.type === 'SECTION' || (c.type==='GROUP')) {
      const flag = (!c.visible ? 'HIDDEN ' : '') + (arch.test(c.name) ? 'ARCH ' : '');
      out.push(['S', depth, c.id, c.name, Math.round(c.width), Math.round(c.height), flag]);
      if (depth < 4) walk(c, path + '/' + c.name, depth + 1);
    } else if ((c.type === 'FRAME' || c.type==='COMPONENT' || c.type==='COMPONENT_SET' || c.type==='INSTANCE') ) {
      const flag = (!c.visible ? 'HIDDEN ' : '') + (arch.test(c.name) ? 'ARCH ' : '');
      out.push(['F', depth, c.id, c.name.slice(0,70), Math.round(c.width), Math.round(c.height), c.type==='FRAME'?flag:c.type+' '+flag]);
    }
  }
}
walk(page, '', 0);
return {page: page.name, n: out.length, rows: out.slice(0, 900).map(r => r.join('|'))};
