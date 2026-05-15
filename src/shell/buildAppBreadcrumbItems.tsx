import { Link } from 'react-router-dom';

import { buildProductCatalogBreadcrumbSegments } from '../catalog/productCatalogNavigation';
import { bomItemById, bomProjectTitleById } from '../bom/data/mockData';
import type { BreadcrumbProps } from '../ui/antd';

import { projectTitleById } from './projectSeed';

type BreadcrumbSeg = { label: string; to?: string };

type BuildArgs = {
  pathname: string;
  projectId?: string;
  partId?: string;
  itemId?: string;
  swapRowId?: string;
  swapPartNumber?: string;
};

function toItems(segments: BreadcrumbSeg[]): BreadcrumbProps['items'] {
  return segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    const title =
      isLast || !seg.to ? seg.label : <Link to={seg.to}>{seg.label}</Link>;
    return { title };
  });
}

export function buildAppBreadcrumbItems(a: BuildArgs): BreadcrumbProps['items'] {
  const { pathname, projectId, partId, itemId, swapRowId, swapPartNumber } = a;
  const segs: BreadcrumbSeg[] = [{ label: 'App', to: '/projects' }];

  if (pathname.startsWith('/catalog')) {
    segs.push({ label: 'Catalog', to: pathname !== '/catalog' ? '/catalog' : undefined });
    if (pathname.includes('/results')) {
      segs.push({ label: 'Results' });
      return toItems(segs);
    }
    if (pathname.includes('/parts/') && partId) {
      segs.push({ label: `Part ${decodeURIComponent(partId)}` });
      return toItems(segs);
    }
    return toItems(segs);
  }

  if (pathname.startsWith('/projects')) {
    if (pathname === '/projects') {
      segs.push({ label: 'Projects' });
      return toItems(segs);
    }
    if (pathname.startsWith('/projects/reframing-proposal')) {
      segs.push({ label: 'Project Reframing Proposal' });
      return toItems(segs);
    }
    segs.push({ label: 'Projects', to: '/projects' });
    if (!projectId) {
      return toItems(segs);
    }
    const pTitle = projectTitleById(projectId) ?? 'Project';
    const hub = `/projects/${projectId}/content`;
    const catalogSegs = buildProductCatalogBreadcrumbSegments(pathname, projectId);
    if (catalogSegs && (pathname === hub || pathname.startsWith(`${hub}/`))) {
      return toItems(catalogSegs);
    }
    segs.push({ label: pTitle, to: hub });
    if (pathname.includes('/seis-brace')) segs.push({ label: 'SeisBrace' });
    else if (pathname.includes('/sales-brace')) segs.push({ label: 'Spec' });
    else if (pathname.includes('/submittal')) segs.push({ label: 'Submittal' });
    return toItems(segs);
  }

  if (pathname.startsWith('/dashboard')) {
    segs.push({ label: 'Homepage' });
    return toItems(segs);
  }

  if (pathname.startsWith('/bom')) {
    segs.push({ label: 'BOM', to: pathname !== '/bom' ? '/bom' : undefined });
    if (pathname === '/bom') return toItems(segs);
    if (pathname === '/bom/search') {
      segs.push({ label: 'Search' });
      return toItems(segs);
    }

    const bomProjectMatch = /^\/bom\/projects\/([^/]+)/.exec(pathname);
    if (bomProjectMatch) {
      const pid = bomProjectMatch[1];
      const ws = `/bom/projects/${pid}/workspace`;
      const pTitle = bomProjectTitleById(pid) ?? 'BOM project';
      const onWorkspace = pathname.includes('/workspace');
      segs.push({ label: pTitle, to: onWorkspace ? undefined : ws });

      const resolvedItemId = itemId ?? /\/items\/([^/]+)/.exec(pathname)?.[1];
      if (resolvedItemId) {
        const row = bomItemById(resolvedItemId);
        const lineLabel = row ? `Line ${row.rowNumber}` : `Line ${resolvedItemId}`;
        let lineTo: string | undefined;
        if (pathname.includes('/narrow')) {
          lineTo = `/bom/projects/${pid}/items/${resolvedItemId}/recommend`;
        } else if (pathname.includes('/recommend')) {
          lineTo = `/bom/projects/${pid}/items/${resolvedItemId}/narrow`;
        }
        segs.push({ label: lineLabel, to: lineTo });
      }

      if (pathname.includes('/parsing-review')) segs.push({ label: 'Parsing review' });
      else if (pathname.includes('/matching')) segs.push({ label: 'Matching results' });
      else if (pathname.includes('/narrow')) segs.push({ label: 'Guided narrowing' });
      else if (pathname.includes('/recommend')) segs.push({ label: 'Recommended result' });
      else if (pathname.includes('/workspace')) segs.push({ label: 'Workspace' });
      else if (pathname.includes('/asc-products')) {
        segs.push({ label: 'ASC products' });
        if (swapRowId) {
          segs.push({ label: swapPartNumber ? `Manual swap · ${swapPartNumber}` : 'Manual swap' });
        }
      }
      else if (pathname.includes('/export')) segs.push({ label: 'Export' });
      else if (pathname.includes('/service-request')) segs.push({ label: 'Service request' });
    }
    return toItems(segs);
  }

  return toItems(segs);
}
