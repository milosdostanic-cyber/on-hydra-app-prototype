import { isoDaysAgo } from './specSeedHelpers';
import type { SpecAskThread, SpecDeliverable } from './types';

export type SpecCollaborationFixtures = {
  askThreads: SpecAskThread[];
  deliverables: SpecDeliverable[];
};

export const emptyCollaborationFixtures: SpecCollaborationFixtures = {
  askThreads: [],
  deliverables: [],
};

/** Clean Division 22 — one answered Ask thread + a delivered package ready to accept. */
export function buildClean22CollaborationFixtures(): SpecCollaborationFixtures {
  const documentId = 'spec-clean-22';
  const sectionId = 'sec-221116';
  const blockId = 'blk-clean-p2';

  const askThreads: SpecAskThread[] = [
    {
      id: 'ask-clean-1',
      documentId,
      subject: 'Confirm 160 psi continuous rating language',
      question:
        'Does ASC recommend keeping the 160 psi working-pressure clause, or should we tighten test pressure wording?',
      requestType: 'Requirement clarification',
      urgency: 'normal',
      status: 'answered',
      context: {
        documentId,
        documentTitle: 'Division 22 — Plumbing',
        versionLabel: 'v1',
        sectionId,
        sectionLabel: '22 11 16 — Domestic Water Piping',
        findingId: 'req-clean-1',
        findingTitle: 'Minimum working pressure 160 psi',
        citationId: 'cit-clean-1',
        citationExcerpt: 'Piping shall be rated for a minimum working pressure of 160 psi at 73°F.',
      },
      messages: [
        {
          id: 'askmsg-clean-1',
          author: 'Alex Rivera',
          role: 'requester',
          body: 'Please confirm whether we should keep the continuous rating or add a field-test pressure.',
          createdAt: isoDaysAgo(2),
        },
        {
          id: 'askmsg-clean-2',
          author: 'ASC Engineer',
          role: 'engineer',
          body: 'Keep the continuous rating and add an explicit field-test pressure so the clause is defensible.',
          createdAt: isoDaysAgo(1),
          proposedWording: {
            blockId,
            sectionId,
            originalText: 'Piping shall be rated for a minimum working pressure of 160 psi at 73°F.',
            proposedText:
              'Piping shall be rated for a minimum working pressure of 160 psi at 73°F continuous, and tested to 240 psi.',
            rationale: 'Engineer answer — clarify continuous rating and field test.',
          },
        },
      ],
      createdAt: isoDaysAgo(2),
      updatedAt: isoDaysAgo(1),
    },
  ];

  const deliverables: SpecDeliverable[] = [
    {
      id: 'deliv-clean-1',
      documentId,
      title: 'Division 22 — engineering review package',
      owner: 'Alex Rivera',
      recipientOrg: 'Owner / GC review team',
      status: 'delivered',
      currentVersionId: 'deliv-ver-2',
      versions: [
        {
          id: 'deliv-ver-1',
          label: 'v1 — Request draft',
          summary: 'Initial request with context attachments.',
          createdAt: isoDaysAgo(4),
          accepted: false,
        },
        {
          id: 'deliv-ver-2',
          label: 'v2 — Engineering response',
          summary: 'ASC markups and suggested wording for pressure and joining methods.',
          createdAt: isoDaysAgo(1),
          accepted: false,
        },
      ],
      activity: [
        {
          id: 'act-clean-1',
          at: isoDaysAgo(4),
          actor: 'Alex Rivera',
          action: 'Requested',
          detail: 'Deliver-Back opened for Division 22 review.',
        },
        {
          id: 'act-clean-2',
          at: isoDaysAgo(3),
          actor: 'ASC Engineer',
          action: 'In progress',
          detail: 'Engineering review started.',
        },
        {
          id: 'act-clean-3',
          at: isoDaysAgo(1),
          actor: 'ASC Engineer',
          action: 'Delivered',
          detail: 'v2 package shared for acceptance.',
        },
      ],
      notifications: [
        {
          id: 'notif-clean-1',
          at: isoDaysAgo(1),
          title: 'Deliverable ready for review',
          body: 'v2 — Engineering response is available. Approve or request a revision.',
        },
      ],
      comments: [
        {
          id: 'dcom-clean-1',
          author: 'Jordan Lee',
          body: 'Please confirm the field-test pressure before we accept.',
          createdAt: isoDaysAgo(1),
        },
      ],
      redlines: [
        {
          id: 'rl-clean-1',
          summary: 'Add continuous rating + 240 psi field test',
          status: 'open',
        },
      ],
      previewText:
        'Engineering package covering domestic water piping pressure ratings, joining methods, and submittal notes. Source document remains immutable until you accept proposed changes in Edit.',
    },
  ];

  return { askThreads, deliverables };
}

/** No ASC fit — open Ask draft with product no-fit context attached. */
export function buildNoAscFitCollaborationFixtures(): SpecCollaborationFixtures {
  const documentId = 'spec-nofit-22';
  return {
    askThreads: [
      {
        id: 'ask-nofit-1',
        documentId,
        subject: 'No ASC catalog equal — need engineer guidance',
        question:
          'Neutral analysis found proprietary language with no ASC equal. What defensible path should we recommend?',
        requestType: 'Product fit',
        urgency: 'high',
        status: 'submitted',
        context: {
          documentId,
          documentTitle: 'Division 22 — Proprietary material lock',
          versionLabel: 'v1',
          sectionId: 'sec-nofit-221116',
          sectionLabel: '22 11 16 — Domestic Water Piping',
          findingId: 'prod-nofit-1',
          findingTitle: 'No suitable ASC product',
          citationId: 'cit-nofit-1',
          citationExcerpt: 'Provide BrandX proprietary alloy piping only. No substitutions.',
        },
        messages: [
          {
            id: 'askmsg-nofit-1',
            author: 'Alex Rivera',
            role: 'requester',
            body: 'No catalog fit after analysis. Please advise on Ask vs substitution path.',
            createdAt: isoDaysAgo(0),
          },
        ],
        createdAt: isoDaysAgo(0),
        updatedAt: isoDaysAgo(0),
      },
    ],
    deliverables: [],
  };
}

/**
 * Async Deliver-Back exchange — mid-lifecycle package with revision path available.
 * Document reuses Clean Division 22 core via scenario assembly.
 */
export function buildAsyncDeliverBackCollaborationFixtures(): SpecCollaborationFixtures {
  const base = buildClean22CollaborationFixtures();
  const deliverable: SpecDeliverable = {
    ...base.deliverables[0]!,
    id: 'deliv-async-1',
    title: 'Async Deliver-Back — Div 22 review',
    status: 'delivered',
    currentVersionId: 'deliv-async-ver-2',
    versions: [
      {
        id: 'deliv-async-ver-1',
        label: 'v1 — Requested package',
        summary: 'Initial shared package.',
        createdAt: isoDaysAgo(5),
        accepted: false,
      },
      {
        id: 'deliv-async-ver-2',
        label: 'v2 — Engineering delivery',
        summary: 'First delivery awaiting accept or revision request.',
        createdAt: isoDaysAgo(1),
        accepted: false,
      },
    ],
    activity: [
      {
        id: 'act-async-1',
        at: isoDaysAgo(5),
        actor: 'Alex Rivera',
        action: 'Requested',
      },
      {
        id: 'act-async-2',
        at: isoDaysAgo(4),
        actor: 'ASC Engineer',
        action: 'In progress',
      },
      {
        id: 'act-async-3',
        at: isoDaysAgo(1),
        actor: 'ASC Engineer',
        action: 'Delivered',
        detail: 'Ready for accept or revision request.',
      },
    ],
    notifications: [
      {
        id: 'notif-async-1',
        at: isoDaysAgo(1),
        title: 'Deliver-Back delivered',
        body: 'Review the package, then Approve or Request revision.',
      },
    ],
  };

  return {
    askThreads: base.askThreads,
    deliverables: [deliverable],
  };
}

/** Restricted external reviewer — same deliverable, UI gated by comment-only role. */
export function buildRestrictedExternalCollaborationFixtures(): SpecCollaborationFixtures {
  const base = buildAsyncDeliverBackCollaborationFixtures();
  return {
    askThreads: base.askThreads.map((t) => ({
      ...t,
      id: 'ask-restricted-1',
      status: 'in-progress' as const,
    })),
    deliverables: base.deliverables.map((d) => ({
      ...d,
      id: 'deliv-restricted-1',
      recipientOrg: 'External review firm (comment only)',
      comments: [
        ...d.comments,
        {
          id: 'dcom-restricted-1',
          author: 'External Reviewer',
          body: 'I can comment, but I cannot approve from this access level.',
          createdAt: isoDaysAgo(0),
        },
      ],
    })),
  };
}
