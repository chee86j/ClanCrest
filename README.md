# ClanCrest - Family Tree Application

A modern family tree visualization application with a React-based frontend and Express.js backend with PostgreSQL database integration.

## Project Structure

```
ClanCrest/
├── frontend/                 # Family chart visualization library
│   ├── dist/                # Built library files
│   ├── examples/            # Example implementations
│   │   └── clancrest-integration/  # Backend integration example
│   └── src/                 # Source code for the family chart library
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utility functions
│   └── prisma/              # Database schema and migrations
└── assets/                  # Static assets
```

## Features

### Frontend (Family Chart Library)

- **Interactive Family Tree Visualization**: D3.js-based family tree charts
- **Multiple Card Types**: SVG and HTML card implementations
- **Customizable Styling**: Extensive CSS customization options
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Dynamic tree updates and animations

### Backend (Express.js API)

- **RESTful API**: Complete CRUD operations for persons and relationships
- **PostgreSQL Database**: Prisma ORM with PostgreSQL
- **Authentication**: Google OAuth integration
- **Kinship Analysis**: AI-powered relationship analysis
- **Family Tree Data**: Specialized endpoints for frontend integration

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Install dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the backend directory:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/clancrest"
   JWT_SECRET="your-jwt-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   OPENAI_API_KEY="your-openai-api-key"
   ALLOWED_ORIGINS="http://localhost:5173,http://localhost:8080"
   ```

3. **Set up the database**:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Build the library**:

   ```bash
   npm run build
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## API Endpoints

### Family Tree Data

- `GET /api/family-tree` - Get family tree data for visualization
- `POST /api/family-tree` - Save family tree data from frontend
- `GET /api/family-tree/stats` - Get family tree statistics

### Persons

- `GET /api/persons` - Get all persons
- `POST /api/persons` - Create a new person
- `GET /api/persons/:id` - Get a specific person
- `PATCH /api/persons/:id` - Update a person
- `DELETE /api/persons/:id` - Delete a person

### Relationships

- `GET /api/relationships` - Get all relationships
- `POST /api/relationships` - Create a new relationship
- `GET /api/relationships/:id` - Get a specific relationship
- `PATCH /api/relationships/:id` - Update a relationship
- `DELETE /api/relationships/:id` - Delete a relationship

### Kinship Analysis

- `POST /api/kinship/find` - Find relationship between two persons
- `POST /api/kinship/ask` - Ask AI about kinship relationships

### Authentication

- `POST /api/auth/google` - Authenticate with Google OAuth
- `GET /api/auth/me` - Get current user (requires authentication)

## Frontend Integration

The frontend family chart library can be integrated with the backend API. Here's a basic example:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="frontend/dist/styles/family-chart.css" />
  </head>
  <body>
    <div id="chart"></div>

    <script src="frontend/dist/family-chart.js"></script>
    <script>
      // Initialize the chart
      const chart = f3.createChart("#chart", []);
      chart.setCard(f3.CardSvg);

      // Load data from backend
      async function loadFamilyTree() {
        const response = await fetch("http://localhost:3000/api/family-tree");
        const data = await response.json();
        chart.updateData(data);
      }

      // Save data to backend
      async function saveFamilyTree() {
        const data = chart.store.getData();
        await fetch("http://localhost:3000/api/family-tree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ familyData: data }),
        });
      }

      // Load initial data
      loadFamilyTree();
    </script>
  </body>
</html>
```

## Database Schema

The application uses PostgreSQL with the following main tables:

### Person

- `id` (String, Primary Key)
- `firstName` (String)
- `lastName` (String)
- `chineseName` (String, Optional)
- `birthDate` (DateTime, Optional)
- `gender` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Relationship

- `id` (String, Primary Key)
- `fromId` (String, Foreign Key to Person)
- `toId` (String, Foreign Key to Person)
- `type` (String: 'parent', 'child', 'spouse', 'sibling')
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### User

- `id` (String, Primary Key)
- `email` (String, Unique)
- `name` (String, Optional)
- `googleId` (String, Unique)
- `avatar` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Development

### Backend Development

- The backend uses Express.js with Prisma ORM
- API routes are organized by feature (persons, relationships, etc.)
- Middleware handles authentication and CORS
- Controllers contain business logic
- Utils contain helper functions like kinship analysis

### Frontend Development

- The frontend is a D3.js-based family tree visualization library
- Built with modern JavaScript (ES6+)
- Supports both SVG and HTML card types
- Highly customizable with CSS and JavaScript
- Includes comprehensive examples and documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions:

- Check the examples in the `frontend/examples` directory
- Review the API documentation at `http://localhost:3000/api/docs`
- Open an issue on GitHub
