⚡ GigFlow: Smart Leads Dashboard (MERN Stack)

A full-stack, enterprise-grade Lead Management Dashboard built strictly with TypeScript across the MERN stack. This project features role-based access control, real-time advanced search filtering, server-side pagination, and a fully containerized deployment workflow using Docker.

🚀 Core Features Implemented

Secure JWT Authentication: Built with secure password hashing using bcrypt, validation, and client-side route access control mapping.

Role-Based Access Control (RBAC): Defined authorization scopes for Admin and Sales User permissions. Admins possess exclusive rights to manage system user credentials and execute CSV data exports.

Lead Management (CRUD): Fully interactive tracking pipeline handling Lead creation, status updates, and deletions.

Advanced Filtering & Search: Multi-parameter search matching case-insensitive text inputs against database attributes concurrently. Engineered with a high-performance Debounced Search (300ms window) to heavily optimize UI re-renders.

Mandatory Server-Side Pagination: Highly optimized backend query processing using Mongoose cursor operations (.skip() and .limit()), strictly limiting payloads to 10 entries per page with responsive metadata object delivery.

CSV Data Exporter: Protected data serialization interface formatting current lead collections seamlessly into client-side downloads (Restricted to Admins only).

Docker Containerization: Full Docker integration via docker-compose for isolated, single-command cross-platform deployment.

Bonus UI Polish: Fully persistent Dark Mode Support via local storage tracking.

🛠️ Technical Stack Specifications

Frontend: React.js, TypeScript (Strict Typing), Tailwind CSS, Lucide React Icons, Vite

Backend: Node.js, Express.js, TypeScript, JSON Web Tokens (JWT), Bcrypt

Database: MongoDB Cloud Atlas, Mongoose ODM

Orchestration: Docker, Docker Compose

⚙️ Environmental Variables (.env.example)

Before running the project locally, create .env files in both your backend and frontend directories based on these blueprints.

Backend (/backend/.env)

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gigflowDB?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key


Frontend (/frontend/.env)

VITE_API_URL=http://localhost:5000/api


🐳 Deployment & Setup Instructions

Option A: Seamless Docker Deployment (Recommended)

This project is fully containerized. Ensure you have Docker Desktop installed and running.

Clone the repository and navigate to the root folder.

Ensure your docker-compose.yml has your valid MONGO_URI.

Run the deployment sequence:

docker compose up --build


Access the application:

Frontend UI: http://localhost:5173

Backend API: http://localhost:5000

Option B: Standard Manual Setup

If you prefer running the Node environments natively:

1. Initialize Backend

cd backend
npm install
npm run dev


2. Initialize Frontend

cd frontend
npm install
npm run dev


📡 API Documentation Synopsis

All endpoints map to the base URL: http://localhost:5000/api
Protected endpoints require the Authorization: Bearer <token> header.

Authentication Routes

POST /auth/register - Register a new system user (Requires username, email, password, role).

POST /auth/login - Authenticate and receive JWT token.

GET /auth/ - [Admin Only] Retrieve all system users.

DELETE /auth/:id - [Admin Only] Revoke a user's access.

Leads Routes

GET /leads - Retrieve leads with mandatory backend pagination (?page=1&limit=10) and dynamic filters (status, source, search, sort).

POST /leads - Create a new pipeline lead.

PUT /leads/:id - Update an existing lead's status or information.

DELETE /leads/:id - [Admin Only] Permanently remove a lead from the database.