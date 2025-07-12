###🏰 ClanCrest
A visual family tree builder that helps you map your family's lineage using a clean drag-and-drop interface. Supports defining relationships, multilingual metadata (including Chinese names), and an interactive "Who Am I to You?" feature that displays kinship terms in English and Mandarin.

##Tech Stack
Frontend: React + Vite + Tailwind CSS + React Flow
Backend: Node.js + Express
ORM: Prisma
Database: SQLite (local development) / PostgreSQL (production)
Auth: Google OAuth 2.0 (via Clerk or @react-oauth/google, optional)
Hosting: Vercel (frontend), Railway (backend + DB)

##Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Database setup:
   - Local development uses SQLite (no setup required)
   - Production will use PostgreSQL (configuration via DATABASE_URL)
   ```bash
   cd backend
   npx prisma migrate dev
   ```

##Features
✅ Build a family tree with draggable nodes
✅ Define directional relationships (parent, sibling, spouse, child)
✅ Add multilingual metadata (e.g., Chinese names)
✅ Display kinship path and terms in both English and Mandarin
✅ Save and load trees (with persistent backend storage)
✅ Interactive speech bubbles showing kinship between selected nodes
✅ Optional: AI chatbot assistant (future feature — for helping users build their tree or explain kinship)

##Future Features
✅ Add more kinship terms and languages
✅ Add more relationship types (e.g., grandparent, aunt/uncle, cousin)
✅ Add more metadata fields (e.g., birth date, death date, occupation)
✅ Add more relationship types (e.g., grandparent, aunt/uncle, cousin)

##Monorepo Structure

```
clancrest/
├── backend/
│   ├── .env                       # Backend env variables
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma DB schema
│   │   ├── dev.db                 # SQLite database (local development)
│   │   └── migrations/            # Database migrations
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
│   │   ├── main.jsx                 # Vite React entry point
│   │   └── index.css                # Tailwind CSS entry
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── package.json                 # Dependencies
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── package-lock.json
```

##Kinship Logic
The app uses a graph traversal algorithm (DFS or BFS) to compute the shortest path between two nodes.

Maps relationship paths to English kinship terms.

Maps English terms to Mandarin using a static lookup (based on TheBeijinger kinship guide).

Speech bubble display

Renders interactive speech bubbles next to the nodes showing:

```
You are my [English kinship term]
你是我的 [Mandarin kinship term]
```

## Addendum 
Goals Inherited from 23andMe:

🧩 Smart Node Expansion: Click a person to add a parent, sibling, spouse, or child in context

🔗 Auto-Linked Relationships: Relationships are inferred and visualized automatically

🧭 Clear Tree Layout: Horizontal generational layout with intuitive snap-to placement

📱 Mobile Optimization: Drag, zoom, and pan on mobile and tablet interfaces

🔄 Undo/Redo Support: Maintain confidence while experimenting with your family structure


Enhancements Unique to ClanCrest:

🌍 Multilingual Kinship Terms: English, Mandarin, and planned support for other systems (e.g., Korean, Indian)

🤖 AI-Powered Chatbot: Ask in plain language: “How is Alice related to John?” and receive a visual + bilingual explanation

🧠 Cultural Templates: Support for Eastern and Western family norms (e.g., hierarchical generational roles, honorifics)

🖼️ Rich Metadata Support: Names, birth/death dates, occupations, photos, notes

🏷️ Relationship Path Highlighting: Visually trace the shortest path between any two members

📤 Export & Share Trees: Planned features include image export and shared public links