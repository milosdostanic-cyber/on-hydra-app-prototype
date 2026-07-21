/**
 * Submittal Manager domain types (Hydra reframe of the Content ZIP submittal-manager module).
 *
 * The ZIP modeled construction "projects" with submittal packages; in Hydra the construction
 * project is owned by the shell/top bar (`useActiveProject()`), so the importable entity is the
 * submittal package, scoped by construction `projectId`.
 */

export type SubmittalPackagePart = {
  /** Stable row id within the package. */
  id: string;
  /** Catalog part key (links to `/search/parts/:partKey`). */
  partKey: string;
  displayName: string;
  figureNumber: string;
};

export type SubmittalPackage = {
  id: string;
  /** Construction project this package belongs to (matches `useActiveProject().projectId`). */
  projectId: string;
  name: string;
  /** ISO timestamp of last edit. */
  updatedAt: string;
  parts: SubmittalPackagePart[];
};

/** One part queued into a package during a part-search session (floating cart). */
export type SubmittalCartItem = {
  partKey: string;
  packageId: string;
};
