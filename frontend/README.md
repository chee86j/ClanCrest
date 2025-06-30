###🏰 ClanCrest
A visual family tree builder that helps you map your family’s lineage using a clean drag-and-drop interface. Supports defining relationships, multilingual metadata (including Chinese names), and an interactive "Who Am I to You?" feature that displays kinship terms in English and Mandarin.

##Tech Stack
Layer Tech
Frontend React + Vite + Tailwind CSS + React Flow
Backend Node.js + Express
ORM Prisma
Database PostgreSQL (or SQLite for local development)
Auth Google OAuth 2.0 (via Clerk or @react-oauth/google, optional)
Hosting Vercel (frontend), Railway (backend + DB)

##Features
✅ Build a family tree with draggable nodes
✅ Define directional relationships (parent, sibling, spouse, child)
✅ Add multilingual metadata (e.g., Chinese names)
✅ Display kinship path and terms in both English and Mandarin
✅ Save and load trees (with persistent backend storage)
✅ Interactive speech bubbles showing kinship between selected nodes

## Monorepo Structure

```
clancrest/
├── backend/
│   ├── .env                       # Backend env variables
│   ├── prisma/
│   │   └── schema.prisma           # Prisma DB schema
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── personController.js
│   │   │   └── relationshipController.js
│   │   ├── routes/
│   │   │   ├── personRoutes.js
│   │   │   └── relationshipRoutes.js
│   │   ├── utils/
│   │   │   └── kinshipResolver.js  # DFS/BFS + kinship mapping logic
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # Server entry point
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── .env                        # Frontend env variables
│   ├── public/
│   │   └── clancrest.svg                # Future logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Header.jsx
│   │   │   ├── tree/
│   │   │   │   ├── NodeForm.jsx
│   │   │   │   ├── RelationshipForm.jsx
│   │   │   │   └── KinshipDisplay.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   └── Auth.jsx
│   │   ├── App.jsx                  # React Router + layout wrapper
│   │   ├── main.jsx                 # Main entry point
│   │   └── index.css                # Tailwind CSS
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── package.json
│   └── vite.config.js (optional)
│
├── .gitignore
├── README.md

```

## Notes

This app is built as a monorepo for simplicity during MVP.

Auth is optional for MVP but supports Google OAuth 2.0.

You can later break into separate frontend/backend repos or add more languages.
