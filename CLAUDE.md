# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (note: ESLint is configured to ignore errors during builds)

## Architecture Overview

This is a Next.js 15 personal website (ivgtr.me) using the App Router with React 19. The site features a personal portfolio with integrated tools and content aggregation.

### Key Architecture Patterns

**App Structure**: Uses Next.js App Router with co-located components in `(components)` folders alongside page files. Each major section (tools, articles) has its own route group.

**Database Integration**: Uses Neon serverless PostgreSQL for simple counters. Database operations are handled through API routes (`/api/counter`).

**Content Aggregation**: The `/api/articles` endpoint aggregates content from multiple external sources (Scrapbox, Hatena Blog, Qiita) using RSS/API feeds with XML parsing.

**Tool Pages**: Interactive client-side tools for image manipulation (crop-icon, glitch-image, pixel-image, image-to-base64) and text processing (tategaki). Each tool follows the pattern of having Form/Preview/Main component separation.

### Styling and UI

- **CSS Framework**: Tailwind CSS with SCSS globals
- **Custom Font**: Uses local MaruMonica pixel font loaded via Next.js font optimization
- **Icons**: FontAwesome React components with tree-shaking configured
- **Component Library**: Shared components in `/src/components/` with consistent Button component using clsx for conditional classes

### TypeScript Configuration

- Path aliases configured with `@/*` mapping to `src/*`
- Strict TypeScript with ES2017 target
- Custom types defined in `/src/types/` (e.g., articles.ts for content aggregation)

## Environment Setup

Requires `DB_URL` environment variable for Neon database connection used by the counter API.