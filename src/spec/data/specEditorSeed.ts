import { isoDaysAgo } from './specSeedHelpers';
import type {
  SpecAiProposal,
  SpecCommentThread,
  SpecSavedVersion,
  SpecTrackedChange,
  SpecWorkingCopy,
} from './types';

/** Editor fixtures for one document (working copy, changes, proposals, comments). */
export type SpecEditorFixtures = {
  workingCopies: SpecWorkingCopy[];
  changes: SpecTrackedChange[];
  proposals: SpecAiProposal[];
  commentThreads: SpecCommentThread[];
  savedVersions: SpecSavedVersion[];
};

export const emptyEditorFixtures: SpecEditorFixtures = {
  workingCopies: [],
  changes: [],
  proposals: [],
  commentThreads: [],
  savedVersions: [],
};

/** Working-copy bag for Clean Division 22 — pending manual + AI proposals + comments. */
export function buildClean22EditorFixtures(): SpecEditorFixtures {
  const documentId = 'spec-clean-22';
  const workingCopyId = 'wc-clean-22';
  const blockId = 'blk-clean-p2';
  const sectionId = 'sec-221116';

  const workingCopy: SpecWorkingCopy = {
    id: workingCopyId,
    documentId,
    label: 'Working copy',
    basedOnVersionLabel: 'v1',
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(0),
    blockOverrides: {
      'blk-clean-p3':
        'Join copper with soldered or press-connect fittings; join PEX with manufacturer-approved crimp rings.',
    },
  };

  const changes: SpecTrackedChange[] = [
    {
      id: 'chg-clean-1',
      documentId,
      workingCopyId,
      blockId,
      sectionId,
      originalText: 'Piping shall be rated for a minimum working pressure of 160 psi at 73°F.',
      proposedText:
        'Piping shall be rated for a minimum working pressure of 160 psi at 73°F continuous, and tested to 240 psi.',
      status: 'pending',
      method: 'manual',
      author: 'Alex Rivera',
      rationale: 'Align with project mechanical schedule note.',
      createdAt: isoDaysAgo(0),
    },
    {
      id: 'chg-clean-2',
      documentId,
      workingCopyId,
      blockId: 'blk-clean-p3',
      sectionId,
      originalText: 'Join copper with soldered fittings; join PEX with manufacturer-approved crimp rings.',
      proposedText:
        'Join copper with soldered or press-connect fittings; join PEX with manufacturer-approved crimp rings.',
      status: 'accepted',
      method: 'manual',
      author: 'Alex Rivera',
      rationale: 'Allow press-connect where approved.',
      createdAt: isoDaysAgo(1),
      resolvedAt: isoDaysAgo(0),
    },
  ];

  const proposals: SpecAiProposal[] = [
    {
      id: 'prop-clean-1',
      documentId,
      workingCopyId,
      blockId: 'blk-clean-p1',
      sectionId,
      originalText:
        'Copper tubing shall be Type L, hard drawn, conforming to ASTM B88. PEX tubing shall conform to ASTM F876.',
      proposedText:
        'Copper tubing shall be Type L, hard drawn, conforming to ASTM B88. PEX tubing shall conform to ASTM F876. CPVC conforming to ASTM D2846 may be used where permitted by local code.',
      rationale: 'Clarify acceptable alternates already common in office masters.',
      confidence: 'medium',
      confidencePercent: 72,
      citationIds: ['cit-clean-1'],
      commerciallyMotivated: false,
      status: 'pending',
      createdAt: isoDaysAgo(0),
    },
    {
      id: 'prop-clean-2',
      documentId,
      workingCopyId,
      blockId: 'blk-clean-p3',
      sectionId,
      originalText: 'Join copper with soldered fittings; join PEX with manufacturer-approved crimp rings.',
      proposedText:
        'Join copper with soldered fittings; join PEX with manufacturer-approved crimp rings. Where ASC press fittings are listed, they may be used as an equal.',
      rationale: 'Suggest listing ASC press fittings as an equal joining method.',
      confidence: 'medium',
      confidencePercent: 68,
      citationIds: ['cit-clean-3'],
      commerciallyMotivated: true,
      status: 'pending',
      createdAt: isoDaysAgo(0),
    },
  ];

  const commentThreads: SpecCommentThread[] = [
    {
      id: 'thread-clean-1',
      documentId,
      blockId,
      sectionId,
      resolved: false,
      createdAt: isoDaysAgo(1),
      messages: [
        {
          id: 'msg-clean-1',
          author: 'Jordan Lee',
          body: 'Does the mechanical schedule still call for 160 psi here?',
          createdAt: isoDaysAgo(1),
        },
        {
          id: 'msg-clean-2',
          author: 'Alex Rivera',
          body: 'Yes — leave 160 psi and note the test pressure in the change.',
          createdAt: isoDaysAgo(0),
        },
      ],
    },
    {
      id: 'thread-clean-2',
      documentId,
      blockId: 'blk-clean-p1',
      sectionId,
      resolved: true,
      createdAt: isoDaysAgo(2),
      messages: [
        {
          id: 'msg-clean-3',
          author: 'Sam Chen',
          body: 'Confirm ASTM F876 revision year with the office master.',
          createdAt: isoDaysAgo(2),
        },
      ],
    },
  ];

  const savedVersions: SpecSavedVersion[] = [];

  return { workingCopies: [workingCopy], changes, proposals, commentThreads, savedVersions };
}

/** Editor fixtures for addendum-review scenario (document has a working copy ready). */
export function buildAddendumEditorFixtures(): SpecEditorFixtures {
  const documentId = 'spec-addendum-22';
  const workingCopyId = 'wc-addendum-22';
  const sectionId = 'sec-add-221116';

  return {
    workingCopies: [
      {
        id: workingCopyId,
        documentId,
        label: 'Working copy',
        basedOnVersionLabel: 'Addendum A',
        createdAt: isoDaysAgo(0),
        updatedAt: isoDaysAgo(0),
        blockOverrides: {},
      },
    ],
    changes: [
      {
        id: 'chg-add-1',
        documentId,
        workingCopyId,
        blockId: 'blk-add-p1',
        sectionId,
        originalText: 'Copper Type L ASTM B88; PEX ASTM F876.',
        proposedText: 'Copper Type L ASTM B88; PEX ASTM F876; CPVC ASTM D2846 where permitted.',
        status: 'pending',
        method: 'ai',
        author: 'AI assistant',
        rationale: 'Created from addendum delta review.',
        createdAt: isoDaysAgo(0),
        proposalId: 'prop-add-1',
      },
    ],
    proposals: [
      {
        id: 'prop-add-1',
        documentId,
        workingCopyId,
        blockId: 'blk-add-p1',
        sectionId,
        originalText: 'Copper Type L ASTM B88; PEX ASTM F876.',
        proposedText: 'Copper Type L ASTM B88; PEX ASTM F876; CPVC ASTM D2846 where permitted.',
        rationale: 'Addendum A introduces CPVC as an allowed material.',
        confidence: 'high',
        confidencePercent: 90,
        citationIds: ['cit-add-1'],
        commerciallyMotivated: false,
        status: 'pending',
        createdAt: isoDaysAgo(0),
      },
    ],
    commentThreads: [
      {
        id: 'thread-add-1',
        documentId,
        blockId: 'blk-add-p2',
        sectionId,
        resolved: false,
        createdAt: isoDaysAgo(0),
        messages: [
          {
            id: 'msg-add-1',
            author: 'Alex Rivera',
            body: 'Confirm pressure change with the engineer of record before accepting.',
            createdAt: isoDaysAgo(0),
          },
        ],
      },
    ],
    savedVersions: [],
  };
}
