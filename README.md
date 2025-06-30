###🏰 ClanCrest
A visual family tree builder that helps you map your family’s lineage using a clean drag-and-drop interface. Supports defining relationships, multilingual metadata (including Chinese names), and an interactive "Who Am I to You?" feature that displays kinship terms in English and Mandarin.

##Tech Stack
Frontend: React + Vite + Tailwind CSS + React Flow
Backend: Node.js + Express
ORM: Prisma
Database: Prisma with PostgreSQL
Auth: Google OAuth 2.0 (via Clerk or @react-oauth/google, optional)
Hosting: Vercel (frontend), Railway (backend + DB)

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
