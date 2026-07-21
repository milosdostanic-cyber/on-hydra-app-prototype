import { Link } from 'react-router-dom';

import { bomItemById, bomProjectTitleById } from '../bom/data/mockData';
import { buildProductCatalogBreadcrumbSegments } from '../catalog/productCatalogNavigation';
import type { BreadcrumbProps } from '../ui/antd';

import { projectTitleById } from './projectSeed';
import { UMBRELLA_COMPANY_LABEL } from './umbrellaCompany';

type BreadcrumbSeg = { label: string; to?: string };

type BuildArgs = {
  pathname: string;
  projectId?: string;
  constructionProjectId?: string;
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

  const dashFlat = pathname === '/dashboard' || pathname === '/dashboard/';
  if (dashFlat) {
    return toItems([{ label: UMBRELLA_COMPANY_LABEL, to: '/dashboard' }, { label: 'Home' }]);
  }

  if (pathname.startsWith('/projects/reframing-proposal')) {
    return toItems([
      { label: UMBRELLA_COMPANY_LABEL, to: '/dashboard' },
      { label: 'Project Reframing Proposal' },
    ]);
  }

  if (pathname.startsWith('/search')) {
    if (pathname.includes('/parts/') && partId) {
      return toItems([
        { label: 'Part Search', to: '/search/results?q=all' },
        { label: `Part ${decodeURIComponent(partId)}` },
      ]);
    }
    return toItems([{ label: 'Part Search' }]);
  }

  if (pathname.startsWith('/catalog')) {
    const segs: BreadcrumbSeg[] = [
      { label: 'Part Search', to: '/catalog' },
      { label: 'Home', to: pathname !== '/catalog' ? '/catalog' : undefined },
    ];
    if (pathname.includes('/results')) {
      segs.push({ label: 'Results' });
      return toItems(segs);
    }
    if (pathname.includes('/parts/') && partId) {
      segs.push({ label: `Part ${decodeURIComponent(partId)}` });
      return toItems(segs);
    }
    if (pathname === '/catalog' || pathname === '/catalog/') {
      return toItems([{ label: 'Part Search' }, { label: 'Home' }]);
    }
    return toItems(segs);
  }

  if (pathname.startsWith('/projects') && projectId) {
    const catalogCrumbs = buildProductCatalogBreadcrumbSegments(pathname, projectId);
    if (catalogCrumbs) {
      return toItems(catalogCrumbs);
    }

    const pTitle = projectTitleById(projectId) ?? 'Project';
    const contentPath = `/projects/${projectId}/content`;
    const specPath = `/projects/${projectId}/sales-brace`;
    const submittalPath = `/projects/${projectId}/submittal`;

    if (pathname === contentPath || pathname === `${contentPath}/`) {
      return toItems([
        { label: 'Content', to: contentPath },
        { label: pTitle },
        { label: 'Download center' },
      ]);
    }

    if (pathname.includes('/sales-brace')) {
      return toItems([
        { label: 'Spec', to: specPath },
        { label: pTitle },
      ]);
    }

    if (pathname.includes('/submittal')) {
      return toItems([
        { label: 'Submittal Manager', to: submittalPath },
        { label: pTitle },
      ]);
    }

    if (pathname.includes('/seis-brace')) {
      return toItems([
        { label: 'SeisBrace', to: '/seisbrace' },
        { label: pTitle },
      ]);
    }

    if (pathname === `/projects/${projectId}` || pathname === `/projects/${projectId}/`) {
      return toItems([
        { label: UMBRELLA_COMPANY_LABEL, to: '/dashboard' },
        { label: 'Home', to: '/dashboard' },
        { label: pTitle },
      ]);
    }
  }

  if (pathname === '/projects' || pathname === '/projects/') {
    return toItems([{ label: UMBRELLA_COMPANY_LABEL, to: '/dashboard' }, { label: 'Home' }]);
  }

  if (pathname.startsWith('/bom')) {
    const segs: BreadcrumbSeg[] = [];
    const siteMatch = /^\/bom\/site\/([^/]+)/.exec(pathname);
    const resolvedSiteId = siteMatch?.[1] ?? a.constructionProjectId;
    const bomHub = resolvedSiteId ? `/bom/site/${resolvedSiteId}` : '/bom';
    const onBomHub = pathname === bomHub || pathname === '/bom';

    segs.push({ label: 'BOM', to: onBomHub ? undefined : bomHub });

    if (pathname === '/bom/search') {
      segs.push({ label: 'Search' });
      return toItems(segs);
    }

    if (siteMatch || (pathname === '/bom' && resolvedSiteId)) {
      const siteTitle = projectTitleById(resolvedSiteId ?? '') ?? 'Construction project';
      segs.push({ label: siteTitle, to: siteMatch && !onBomHub ? bomHub : undefined });
      if (onBomHub || siteMatch) segs.push({ label: 'BOM Projects' });
      return toItems(segs);
    }

    const bomProjectMatch = /^\/bom\/projects\/([^/]+)/.exec(pathname);
    if (bomProjectMatch) {
      const pid = bomProjectMatch[1];
      const ws = `/bom/projects/${pid}/workspace`;
      const onFieldMapping = pathname.includes('/field-mapping');
      const onWorkspace = pathname.includes('/workspace');
      if (onFieldMapping) {
        segs.push({ label: 'New BOM Project' });
      } else {
        const pTitle = bomProjectTitleById(pid) ?? 'BOM project';
        segs.push({ label: pTitle, to: onWorkspace ? undefined : ws });
      }

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
      } else if (pathname.includes('/export')) segs.push({ label: 'Export' });
      else if (pathname.includes('/service-request')) segs.push({ label: 'Service request' });
    }
    return toItems(segs);
  }

  if (pathname.startsWith('/seisbrace')) {
    const segs: BreadcrumbSeg[] = [
      { label: 'SeisBrace', to: pathname !== '/seisbrace' ? '/seisbrace' : undefined },
    ];
    if (pathname.includes('/wizard/')) segs.push({ label: 'Design wizard' });
    return toItems(segs);
  }

  if (pathname.startsWith('/revit-plugin')) {
    return toItems([{ label: 'Revit Plug-in' }]);
  }

  if (pathname.startsWith('/knowledge-center')) {
    return toItems([{ label: 'Knowledge Center' }]);
  }

  return toItems([{ label: UMBRELLA_COMPANY_LABEL, to: '/dashboard' }]);
}
