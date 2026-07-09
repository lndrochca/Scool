# scool

scool is a React + TypeScript study dashboard for organizing classes, notes, grades, deadlines, flashcards, and learning materials in one place.

## features

- dashboard overview with active subjects, upcoming deadlines, and quick actions
- note creation and recent-note tracking
- grade tracking and grade calculations
- library and bookshelf views for study files and resources
- flashcard support and subject workspaces
- profile and settings pages

## tech stack

- react 19
- typescript
- vite
- css modules and custom component styles

## getting started

1. install dependencies
   ```bash
   npm install
   ```
2. start the dev server
   ```bash
   npm run dev
   ```
3. build for production
   ```bash
   npm run build
   ```

## available scripts

- `npm run dev` starts the local development server
- `npm run build` compiles the app for production
- `npm run preview` serves the production build locally
- `npm run lint` runs the project linter

## project structure

- `src/components` reusable UI components
- `src/pages` main app pages
- `src/context` shared app state
- `src/data` mock data and generators
- `src/types.ts` shared type definitions

## notes

The app uses mock data and local in-memory state for demonstration purposes, so changes are reflected during the current session.
