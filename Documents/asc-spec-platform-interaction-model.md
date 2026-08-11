# ASC Spec Platform — Interaction Model

> Complete content capture of the ASC Spec Platform product interaction model.
>
> Source: [ASC Spec Platform — Interaction Model](https://animated-heliotrope-d55722.netlify.app/)  
> Captured: July 20, 2026

## Product story

### Turn a specification into clear project decisions

The Spec Platform reads a project specification, explains what matters, shows the evidence, and helps the user turn requirements into:

- Submittals
- Substitutions
- Product decisions
- Expert conversations

In the simplest possible terms:

1. **Upload the spec once.**
2. **Understand it.**
3. **Do the work.**

**Upload → Understand → Act → Deliver**

### What the platform does

#### 1. It reads

Finds sections, requirements, risks, submittal obligations, named products, and important clauses.

#### 2. It explains

Turns dense spec language into summaries, checklists, comparisons, and traceable evidence.

#### 3. It helps act

Connects findings to product options, submittals, substitutions, and ASC engineering support.

## Interaction model

### Follow the project object from intake to reusable knowledge

The same uploaded specification is progressively understood, verified, transformed into work, and retained inside ConnectED.

The project object evolves through the workflow:

**Raw project specification → Structured specification → Prioritized project map → Interpreted requirements → Verified project evidence → Actionable project work → Shared decision context → Reusable project knowledge**

## User journey

### Stage 1 — Receive project

**User question:** “What am I dealing with?”

The user starts from an existing ConnectED project and brings in the project specification or manual.

**Project object:** Raw project specification  
**Object description:** A document enters the project context.

#### User tasks

1. **Upload the specification**  
   Add a PDF, Word file, full manual, or new addendum.
2. **Confirm project context**  
   Reuse existing project name, owner, location, and team.
3. **Identify the document**  
   Mark whether this is the base spec, revision, addendum, or comparison baseline.

#### User outcome

The document belongs to the correct project and is ready to process.

#### System responds with

- Project metadata
- Upload validation
- Version detection

#### Business objective

- G1 · Earn the upload

### Stage 2 — Process document

**User question:** “Did the system understand it?”

The platform reads the file, applies OCR when necessary, detects CSI sections, and extracts structured requirements.

**Project object:** Structured specification  
**Object description:** The raw file becomes a section map and requirement dataset.

#### User tasks

1. **Track processing**  
   See OCR, segmentation, extraction, and matching progress.
2. **Review warnings**  
   Understand unreadable pages, uncertain sections, and duplicate versions.
3. **Recover from errors**  
   Retry failed pages or continue with a partial result.

#### User outcome

The user knows what was processed successfully and what may need attention.

#### System responds with

- OCR
- Section detection
- Confidence scores
- Error recovery

#### Business objective

- G1 · Earn the upload

### Stage 3 — Orient

**User question:** “What deserves my attention?”

The platform summarizes the project and prioritizes important findings before the user enters individual sections.

**Project object:** Prioritized project map  
**Object description:** Requirements are ranked by consequence and review need.

#### User tasks

1. **Scan the overview**  
   See divisions, high-risk findings, obligations, and low-confidence items.
2. **Filter the project**  
   Focus on relevant divisions, severity, or assigned responsibilities.
3. **Choose where to begin**  
   Open the most important section or flagged issue.

#### User outcome

The user is oriented without reading hundreds of pages.

#### System responds with

- Overview
- Priority model
- Filters
- Review status

#### Business objective

- G1 · Earn the upload

### Stage 4 — Understand

**User question:** “What exactly does the spec require?”

The user opens a section and sees summaries, normalized requirements, risks, obligations, and named products.

**Project object:** Interpreted requirements  
**Object description:** Dense language becomes clear, structured project information.

#### User tasks

1. **Read the section summary**  
   Understand the purpose and scope in plain language.
2. **Review requirements**  
   See materials, standards, listings, sizes, and obligations.
3. **Inspect red flags**  
   Understand restrictive clauses, contradictions, and unusual conditions.

#### User outcome

The user understands what matters and why it may affect the project.

#### System responds with

- Plain-language summary
- Requirement checklist
- Red flags

#### Business objective

- G1 · Earn the upload

### Stage 5 — Verify

**User question:** “Can I trust this?”

Every conclusion is linked to the exact page and paragraph, with visible confidence and human review controls.

**Project object:** Verified project evidence  
**Object description:** Findings become trustworthy because the source stays attached.

#### User tasks

1. **Open source evidence**  
   See the exact paragraph and surrounding context.
2. **Confirm or correct**  
   Validate the extraction or provide the right value.
3. **Escalate uncertainty**  
   Assign or send the item for expert review.

#### User outcome

The user can distinguish generated, corrected, and human-confirmed information.

#### System responds with

- Citation viewer
- Confidence
- Correction history
- Audit trail

#### Business objectives

- G1 · Earn the upload
- G3 · Build relationships

### Stage 6 — Take action

**User question:** “What should I do next?”

The user turns a finding into project work: comparison, product evaluation, submittal, substitution, assignment, or question.

**Project object:** Actionable project work  
**Object description:** Verified requirements become tasks, product decisions, and deliverables.

#### User tasks

1. **Choose the right action**  
   Compare, add to a submittal, evaluate a product, or ask for help.
2. **Review fit honestly**  
   See direct match, approval required, partial match, failure, or insufficient information.
3. **Generate a working draft**  
   Create a submittal item or substitution matrix from the evidence.

#### User outcome

The platform reduces the gap between understanding a requirement and completing the work.

#### System responds with

- Product fit
- Submittal builder
- Substitution generator
- Assignments

#### Business objectives

- G2 · Convert
- G3 · Build relationships

### Stage 7 — Collaborate

**User question:** “Can an expert confirm this?”

The user contacts ASC from the exact requirement, product, or artifact. The complete context travels with the question.

**Project object:** Shared decision context  
**Object description:** The project, evidence, product, and artifact stay connected to the conversation.

#### User tasks

1. **Ask from any finding**  
   Start a question without copying project context.
2. **Work in one thread**  
   Discuss the requirement, product, and artifact together.
3. **Track ownership and status**  
   See who is working, what changed, and what remains unresolved.

#### User outcome

ASC engineers can respond faster, and the user receives a defensible answer.

#### System responds with

- Auto-attached context
- Routing
- Threaded discussion
- Handoff states

#### Business objective

- G3 · Build relationships

### Stage 8 — Deliver and reuse

**User question:** “Is this ready, and can we reuse it?”

The final artifact is reviewed, delivered in-platform, recorded in the project, and searchable for future work.

**Project object:** Reusable project knowledge  
**Object description:** The result becomes a versioned project asset instead of a lost email attachment.

#### User tasks

1. **Complete validation**  
   Resolve missing evidence, exceptions, and requested changes.
2. **Deliver the artifact**  
   Publish, download, forward, or accept the final package.
3. **Reuse the outcome**  
   Search previous requirements, decisions, and accepted substitutions.

#### User outcome

The project cycle completes in-platform and strengthens future work.

#### System responds with

- Approvals
- Version history
- Deliver-back
- Spec Library

#### Business objectives

- G1 · Earn the upload
- G2 · Convert
- G3 · Build relationships

## Users

### Different users, one shared project

Each role enters with a different question. The platform stays consistent, but the information priority and definition of success change by role.

### Estimator / Preconstruction

**Focus:** Bid risk and opportunity  
**Core question:** “Help me find the requirements and risks that could affect the bid.”

This user needs rapid orientation. They care most about restrictive clauses, unusual requirements, approval deadlines, and credible alternatives.

#### Needs to do

- Identify high-impact requirements
- Find approval and substitution restrictions
- Compare against a standard or prior project
- Estimate labor, cost, and lead-time impact

#### Success looks like

- Understands bid risk in minutes
- Does not miss a critical condition
- Can defend an alternative product
- Knows when to involve ASC

### Contractor / Project Manager

**Focus:** Submittals and coordination  
**Core question:** “Tell me what must be submitted, by whom, and whether it is complete.”

This user turns specification obligations into coordinated project work and needs ownership, status, and package completeness.

#### Needs to do

- Detect all submittal obligations
- Assign responsible parties
- Match supporting product documents
- Track revisions and open items

#### Success looks like

- Complete register with fewer omissions
- Less manual document assembly
- Clear ownership and status
- Fewer review cycles

### Project / Application Engineer

**Focus:** Technical validation  
**Core question:** “Show me the exact requirement, evidence, and proposed product fit.”

This user validates technical details and needs precise context rather than high-level summaries alone.

#### Needs to do

- Inspect source language
- Validate product fit and equivalence
- Review exceptions and uncertainty
- Approve or correct technical claims

#### Success looks like

- Can answer without rereading the full manual
- Sees every mismatch clearly
- Creates defensible technical decisions
- Maintains an audit trail

### Specifier / Consulting Engineer

**Focus:** Comparison and authoring  
**Core question:** “Show me what changed and help me insert accurate specification language.”

This user works with masters, project variations, and guide specifications. Their mental model is comparison and controlled authoring.

#### Needs to do

- Compare against a master
- Separate meaningful changes from cosmetic edits
- Generate 3-part SectionFormat language
- Preserve numbering and standards

#### Success looks like

- Understands deviations quickly
- Avoids accidental proprietary language
- Updates sections without rework
- Maintains version clarity

### ASC Engineer

**User type:** Internal user  
**Focus:** Contextual expert support  
**Core question:** “Give me enough context to answer correctly the first time.”

This internal user receives questions and shared artifacts. Adoption depends on the workflow being lighter than email.

#### Needs to do

- Receive the exact section and citation
- See project and product context
- Edit or complete shared artifacts
- Deliver the final response in-platform

#### Success looks like

- Less context gathering
- Faster, more accurate answers
- Clear request ownership
- Reusable history for future projects

## Core workspace concept

### Evidence, interpretation, and action live together

The conceptual workspace demonstrates the central design idea:

1. Navigate the specification.
2. Understand the requirement.
3. Verify the source.
4. Take action.

### Example project state

- **Product:** ASC Spec Platform
- **Project:** City Center Hospital
- **Status:** Ready for review

### Section navigation

The example sidebar contains a section search and the following sections:

- 21 01 00 — General Requirements
- 21 02 00 — Product Requirements
- 21 05 00 — Common Work Results
- 21 13 00 — Fire Protection Piping
- 22 10 00 — Plumbing Systems

### Filters

- Critical / High
- Medium
- Needs review

### Workspace views

- Summary
- Requirements
- Red flags
- Submittals
- Changes

### Selected section example

**21 05 00 — Common Work Results**

This section defines coordination, cutting and patching, supports, sleeves, firestopping, and other work related to the fire suppression systems installed under this specification.

#### Key requirements

- **High:** Coordinate all work with other trades.
- **High:** Firestopping required for all penetrations.
- **Medium:** Sleeves required where piping passes through walls and floors.
- **Medium:** Provide supports in accordance with NFPA 13.

#### Red flag

- **High:** Approval of alternative products required at least 10 days before bid.

### Evidence example

**Source:** 21 05 00 · 1.04.B · Page 12

> Approval of alternative products will be required at least 10 days prior to bid. Substitutions will not be accepted after the approval deadline.

**Confidence:** 94% · High

#### Validation actions

- Confirm
- Correct
- Ask engineer
- Not applicable

### ASC product options

#### Direct match

**MegaPress® Grooved Fittings**

- Class 300
- FM Approved
- UL listed
- Action: View fit details

#### Approval required

**ProPress® Copper Fittings**

- Potential fit with approval workflow
- Action: Start substitution

## Business logic

### The user journey earns trust before it sells

The commercial model is progressive. Neutral analysis creates value first; relevant ASC products and expert help appear only when useful.

### G1 — Earn the upload

Provide value even when the user never selects an ASC product.

- Summaries and checklists
- Red flags and citations
- Comparisons and searchable history

### G2 — Convert responsibly

Show ASC options where the requirements indicate a credible fit.

- Transparent fit states
- Cut sheets and evidence
- Submittal and substitution workflows

### G3 — Build relationships

Create a direct, contextual connection to ASC engineers.

- One-click expert questions
- Shared, versioned artifacts
- In-platform deliver-back

## Recommended MVP

### Validate one complete loop, not ten partial features

The strongest first release proves that users can upload, understand, trust, and act on a specification inside a real project.

**Upload → Understand → Verify → Ask or Act**

1. Enter through a ConnectED project.
2. Upload and process a specification.
3. Review detected sections.
4. See summaries, requirements, and red flags.
5. Open exact source citations.
6. Confirm or correct extractions.
7. See clearly separated ASC options.
8. Ask an engineer with attached context.

## Design principles to protect

1. **Evidence before automation**  
   Every conclusion links to its source.
2. **Neutral before commercial**  
   Analysis and ASC recommendations remain distinct.
3. **Progressive disclosure**  
   Project → section → requirement → paragraph.
4. **Human validation**  
   Consequential outputs show who confirmed them.
5. **One project context**  
   Reuse ConnectED metadata, permissions, and activity.
6. **Action from anywhere**  
   Every finding can lead to the next useful step.

---

Designed as a visual companion to the Spec Platform feature intake.
