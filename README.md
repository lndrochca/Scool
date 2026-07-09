# scool

> a modern study dashboard for staying organized, tracking progress, and managing schoolwork in one place.

---

## 🚀 overview

scool is a React + TypeScript web app designed to help students manage classes, notes, grades, deadlines, flashcards, and study resources from a single dashboard.

---

## ✨ features

### 📊 dashboard

- active subjects and quick navigation
- upcoming deadlines and study reminders
- fast access to notes, grades, and resources

### 📝 notes

- create and organize study notes
- keep recent notes visible for quick review
- structure notes by subject and topic

### 📈 grades

- track coursework and grade categories
- calculate grade progress with built-in logic
- monitor performance across subjects

### 📚 library and study tools

- browse resources in the library and bookshelf views
- explore subject workspaces
- support flashcards for revision

### ⚙️ profile and settings

- personalize your student profile
- adjust app preferences and account details

---

## 🛠 tech stack

- React 19
- TypeScript
- Vite
- CSS-based UI styling
- local app state with context providers

---

## 📁 project structure

```text
scool/
├── src/
│   ├── components/      # reusable ui components
│   ├── pages/           # dashboard, notes, grades, library, settings, and more
│   ├── context/         # shared app data and state
│   ├── data/            # mock data and generators
│   └── types.ts         # shared type definitions
└── public/              # static assets
```

---

## ⚙️ setup

### 1. install dependencies

```bash
npm install
```

### 2. start the app

```bash
npm run dev
```

### 3. build for production

```bash
npm run build
```

---

## 📜 available scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run preview` previews the production build locally
- `npm run lint` runs the linter

---

## 📌 notes

The app currently uses mock data and in-memory state for a polished demo experience, so changes are reflected during the active session.

---

## 📄 license

this project is for personal or educational use.
