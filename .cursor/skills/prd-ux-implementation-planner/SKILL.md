---
name: prd-ux-implementation-planner
description: >-
  Creates a scoped UX-aware implementation plan before code — from PRD or Figma delta.
  Maps requirements to routes, components, and phases. Use when implementing a feature,
  syncing changed Figma screens to repo, or when the user asks for a plan, scope, or gap
  analysis. Does not implement until explicitly asked.
---

# PRD UX Implementation Planner

## Purpose

Use this skill when implementing a feature from a PRD into an existing product flow.

The goal is to create a scoped, UX-aware implementation plan before writing code.

The agent must compare:
- PRD requirements
- Current repository implementation
- Existing screens and user flow
- Existing components and design patterns

The output must explain what should change, where, why, and how, without touching unrelated parts of the app.

## Core Rules

1. Do not implement immediately.
2. First inspect only the relevant files.
3. Do not scan the entire repository unless required.
4. Do not modify unrelated files.
5. Do not refactor unrelated components.
6. Prefer existing components and patterns.
7. Preserve current architecture unless the PRD requires a change.
8. Optimize for a non-technical human user.
9. Reduce cognitive load.
10. Use clear CTAs and progressive disclosure.
11. Avoid spreadsheet-like editing unless explicitly required.
12. Keep token usage low by reading only targeted files.

## Required Workflow

### Step 1 — Identify Scope

Find only the files related to the requested feature.

Return:
- routes
- pages
- components
- state/data files
- API hooks
- existing related tests if any

Do not edit anything.

### Step 2 — Current Flow Audit

Describe the current user flow screen by screen.

For each screen, include:
- current purpose
- current user action
- current data shown
- current UX issue
- related file/component

### Step 3 — PRD Requirement Mapping

Create a table:

| PRD Requirement | Current Support | Gap | UX Risk | Implementation Area |

### Step 4 — UX Review

Evaluate the current and proposed flow using:
- clarity
- cognitive load
- action visibility
- error prevention
- progressive disclosure
- accessibility
- non-technical user comprehension

### Step 5 — Implementation Plan

Create a phased implementation plan.

Each phase must include:
- goal
- affected files
- UI changes
- state/data changes
- acceptance criteria
- risks
- what must not be changed

### Step 6 — Guardrails

Before implementation, list:
- files allowed to change
- files not allowed to change
- assumptions
- open questions
- required confirmation points

### Step 7 — Final Checklist

Verify:
- PRD requirements are covered
- UX flow is clear
- non-technical user can understand each step
- unrelated areas are untouched
- token usage was minimized
- implementation can be done in small slices

## Output Format

Always respond with:

1. Scope Summary
2. Current Flow Audit
3. PRD vs Current Gap Table
4. Proposed UX Flow
5. Implementation Plan by Phase
6. File Change Plan
7. Risks & Open Questions
8. Acceptance Criteria Checklist

## Token Discipline

- Do not read broad directories unless necessary.
- Ask for specific files when context is missing.
- Summarize findings instead of pasting large code blocks.
- Prefer file paths and short explanations.
- Never duplicate the entire PRD in the response.