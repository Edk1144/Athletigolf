# AthletiGolf Project Documentation

AthletiGolf is a React + TypeScript + Vite application designed for mobile-first fitness and golf tracking, leveraging Capacitor for Android deployment and Tailwind CSS for styling.

## Core Mandates & Conventions

- **Design Philosophy:** Polished, mobile-first, fitness-focused UI/UX.
- **Technology Stack:**
  - Framework: React (TypeScript)
  - Bundler: Vite
  - Styling: Tailwind CSS
  - Mobile: Capacitor (Android)
  - Backend: Supabase

## Development Rules

1.  **Architecture:** Do not make large architectural changes without explicit explanation and discussion.
2.  **Consistency:** Preserve existing functionality and patterns. Before creating new components or utilities, check for existing ones to avoid duplication.
3.  **Clean Code:** Prefer reusable components and shared utilities. Keep the code idiomatic.
4.  **Design Language:** Maintain the current design system/language in all new UI components.
5.  **Quality Assurance:** Test changes mentally for both desktop and mobile responsiveness.
6.  **Feature Integrity:** Do not remove features unless explicitly requested.

## Pre-Edit Checklist

1.  **Inspect:** Before modifying, inspect relevant existing files/components to ensure pattern alignment.
2.  **Explain:** Briefly explain the proposed change and rationale.
3.  **Risk Assessment:** Identify potential risks (e.g., impact on existing data flows, mobile responsiveness).

## Bug Fixes

- **Root Cause Analysis:** Focus on finding the underlying cause, not just symptoms.
- **Holistic Review:** Check related components and database usage/schemas when addressing issues.

## Operations

- **Build/Typechecking:** Use `npm run typecheck` for validation.
- **Mobile Workflow:** Use `npm run app:sync` and `npm run app:android` for Android-specific tasks.
