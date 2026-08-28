/**
 * Spec path builders — mirrors catalog/productCatalogNavigation.ts.
 *
 * V2 canonical URLs (Phase 0 decision record, decision 1): the Project SPEC list
 * and document workspace live under `/projects/:projectId/spec`. `/spec` and
 * `/spec/:specId/...` remain reachable as redirects into that project-owned tree
 * (see `SpecLayout` and `SpecLegacyIndexRedirect`).
 */
import { deriveSpecWorkflowStatus } from './constants/specWorkflowStatus';
import { getDocumentFromStore } from './data/specMockStore';
import type { SpecDocument } from './data/types';

export const SPEC_WORKSPACE_LEAVES = [
  'processing',
  'analyze',
  'edit',
  'export',
  'review',
  'baseline-comparison',
  'products',
  'submittals',
  'substitution',
  'ask',
  'deliver-back',
] as const;

export type SpecWorkspaceLeaf = (typeof SPEC_WORKSPACE_LEAVES)[number];

const WORKSPACE_LEAF_SET = new Set<string>(SPEC_WORKSPACE_LEAVES);

/** True for the Spec module — list, documents, guide specs, and legacy `/spec` deep links. */
export function isSpecModulePath(pathname: string): boolean {
  return pathname.startsWith('/spec') || /\/projects\/[^/]+\/spec(\/|$)/.test(pathname);
}

export function specHomePath(projectId?: string | null): string {
  return specListPathForProject(projectId);
}

/** Canonical V2 Project SPEC list — Phase 0 decision record, decision 1. */
export function specProjectListPath(projectId: string): string {
  return `/projects/${projectId}/spec`;
}

/** Project SPEC list when known; legacy `/spec` redirect otherwise. */
export function specListPathForProject(projectId?: string | null): string {
  return projectId ? specProjectListPath(projectId) : '/spec';
}

function resolveSpecProjectId(specId: string, projectId?: string | null): string | undefined {
  return projectId || getDocumentFromStore(specId)?.projectId || undefined;
}

/** Canonical document workspace base; falls back to `/spec/:specId` until the project is known. */
export function specDocumentWorkspaceBase(specId: string, projectId?: string | null): string {
  const resolved = resolveSpecProjectId(specId, projectId);
  return resolved ? `${specProjectListPath(resolved)}/${specId}` : `/spec/${specId}`;
}

export function specAnalyzePath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/analyze`;
}

export function specProcessingPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/processing`;
}

export function specEditPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/edit`;
}

export function specReviewPath(specId: string, projectId?: string | null): string {
  return specBaselineComparisonPath(specId, projectId);
}

export function specBaselineComparisonPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/baseline-comparison`;
}

export function specProductsPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/products`;
}

export function specSubmittalsPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/submittals`;
}

export function specSubstitutionPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/substitution`;
}

export function specAskPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/ask`;
}

export function specDeliverBackPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/deliver-back`;
}

export function specExportPath(specId: string, projectId?: string | null): string {
  return `${specDocumentWorkspaceBase(specId, projectId)}/export`;
}

export function specGuideSpecsPath(): string {
  return '/spec/guide-specs';
}

export function matchSpecListPath(pathname: string): { projectId: string } | null {
  const match = pathname.match(/^\/projects\/([^/]+)\/spec\/?$/);
  return match ? { projectId: match[1] } : null;
}

export function matchSpecWorkspacePath(pathname: string): {
  projectId?: string;
  specId: string;
  leaf: SpecWorkspaceLeaf;
} | null {
  const projectScoped = pathname.match(
    /^\/projects\/([^/]+)\/spec\/([^/]+)\/([^/]+)\/?$/,
  );
  if (projectScoped && WORKSPACE_LEAF_SET.has(projectScoped[3])) {
    return {
      projectId: projectScoped[1],
      specId: decodeURIComponent(projectScoped[2]),
      leaf: projectScoped[3] as SpecWorkspaceLeaf,
    };
  }
  const legacy = pathname.match(/^\/spec\/([^/]+)\/([^/]+)\/?$/);
  if (legacy && WORKSPACE_LEAF_SET.has(legacy[2])) {
    return {
      specId: decodeURIComponent(legacy[1]),
      leaf: legacy[2] as SpecWorkspaceLeaf,
    };
  }
  return null;
}

/** Rewrite a legacy `/spec/:specId/...` URL onto the project-owned tree when the document is known. */
export function specCanonicalPathFromLegacy(
  pathname: string,
  search = '',
): string | null {
  if (pathname === '/spec' || pathname === '/spec/') return null;
  if (pathname === '/spec/guide-specs' || pathname === '/spec/guide-specs/') return null;
  if (pathname.startsWith('/spec/projects/')) return null;
  if (pathname === '/spec/new' || pathname === '/spec/new/') return null;

  const workspace = matchSpecWorkspacePath(pathname);
  if (!workspace || workspace.projectId) return null;
  const projectId = getDocumentFromStore(workspace.specId)?.projectId;
  if (!projectId) return null;
  const leaf = workspace.leaf === 'review' ? 'baseline-comparison' : workspace.leaf;
  return `${specProjectListPath(projectId)}/${workspace.specId}/${leaf}${search}`;
}

/** Returns each document to the workflow screen implied by its current status. */
export function specDocumentPrimaryPath(document: SpecDocument): string {
  const status = deriveSpecWorkflowStatus(document);
  const specId = document.id;
  const projectId = document.projectId;
  if (status === 'processing' || status === 'uploading' || status === 'analysis-failed') {
    return specAnalyzePath(specId, projectId);
  }
  if (status === 'reanalysis-required') {
    return specEditPath(specId, projectId);
  }
  if (status === 'reanalyzing') {
    return specAnalyzePath(specId, projectId);
  }
  if (status === 'ready-to-review') {
    return specAnalyzePath(specId, projectId);
  }
  if (status === 'in-review') {
    return specEditPath(specId, projectId);
  }
  if (
    status === 'ready-to-export' ||
    status === 'exporting' ||
    status === 'export-failed' ||
    status === 'exported'
  ) {
    return specExportPath(specId, projectId);
  }
  return specAnalyzePath(specId, projectId);
}
