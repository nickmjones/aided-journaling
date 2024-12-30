# Aided Journal 📓

A simple journaling app that provides random prompts to help you reflect on your day. Built with React, Vite, and Tailwind CSS.

## Features

- Three random reflection prompts per session
- Ability to lock/re-roll individual prompts
- Optional title for each entry
- Auto-save draft entries to localStorage
- Export entries as Markdown files compatible with Obsidian
- Warning before closing with unsaved changes

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd aided-journal
```

2. Install dependencies:
```bash
npm install
```

3. Install required UI components:
```bash
# Install dependencies for shadcn/ui components
npm install @radix-ui/react-alert-dialog class-variance-authority clsx tailwind-merge lucide-react
```

## Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

1. Create a production build:
```bash
npm run build
```

2. Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
  ├── App.jsx                 # Main app component
  ├── components/
  │   ├── JournalApp.jsx     # Main journal component
  │   └── ui/
  │       └── alert-dialog.jsx # ShadCN UI component
  └── lib/
      └── utils.js           # Utility functions for UI components
```

## Technologies Used

- React
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide React Icons

## Local Storage

The app uses localStorage to automatically save drafts. The following data is stored:
- Title
- Prompts
- Answers
- Lock states for prompts

Data is cleared from localStorage when an entry is successfully exported.

## File Naming Convention

Exported Markdown files follow this format:
`[optional-title]-DD-MMM-YYYY.md`

Example:
- With title: `morning-reflection-29-dec-2024.md`
- Without title: `29-dec-2024.md`