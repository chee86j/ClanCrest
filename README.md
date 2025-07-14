# ClanCrest - Family Tree Visualization

ClanCrest is a comprehensive family tree visualization application that allows users to create, manage, and explore family relationships with multilingual kinship intelligence.

## Features

- **Interactive Family Tree**: Visualize family connections using react-d3-tree with elbow connectors
- **Person Management**: Create, edit, and delete family members
- **Relationship Management**: Define various relationship types (parent, child, spouse, sibling)
- **Kinship Intelligence**: Find relationships between any two family members
- **Multilingual Support**: View kinship terms in English and Mandarin Chinese
- **AI Chatbot**: Ask questions about family relationships (requires OpenAI API key)
- **Export Functionality**: Save your family tree as PDF

## Tech Stack

### Frontend

- React.js
- Tailwind CSS
- react-d3-tree
- Axios for API communication
- HTML-to-Image & jsPDF for exports

### Backend

- Node.js
- Express.js
- Prisma ORM
- SQLite (development) / PostgreSQL (production)
- OpenAI API integration (optional)

## Project Structure

```
clancrest/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.jsx
├── .env
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- SQLite (for development)
- PostgreSQL (for production)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/clancrest.git
   cd clancrest
   ```

2. Install backend dependencies:

   ```
   cd backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with:

   ```
   NODE_ENV=development
   PORT=3001
   DATABASE_URL="file:./dev.db"
   # Optional: OPENAI_API_KEY="your-api-key"
   ```

4. Initialize the database:

   ```
   npx prisma migrate dev --name init
   ```

5. Install frontend dependencies:

   ```
   cd ../frontend
   npm install
   ```

6. Create a `.env` file in the frontend directory with:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

### Running the Application

1. Start the backend server:

   ```
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend:

   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Creating a Family Tree**:

   - Start by adding a person using the "Add New Person" button
   - Add more family members and establish relationships between them

2. **Finding Relationships**:

   - Use the Kinship Finder to discover how two family members are related
   - Toggle between English and Mandarin Chinese for relationship terms

3. **Using the AI Chatbot**:

   - Click "Show Chatbot" to access the AI assistant
   - Ask questions like "What is John's relationship to Emma?"

4. **Exporting Your Tree**:
   - Click "Export Tree" to save your family tree as a PDF

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [react-d3-tree](https://github.com/bkrem/react-d3-tree) for the tree visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [OpenAI](https://openai.com/) for the AI chatbot capabilities
