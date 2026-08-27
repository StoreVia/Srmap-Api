# Srmapi Next

Srmapi Next is a web application built for SRM AP students. It provides a modern interface for checking attendance, schedules, exam results, vacant classrooms, and student utilities.

## Getting Started

### Prerequisites

- Node.js 22 or higher
- MongoDB instance

### Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   MONGO_URI="mongodb://127.0.0.1:27017"
   FORUMS_MONGO_URI="mongodb://127.0.0.1:27018"
   ACCESS_SECRET="your-secret-key"
   ACCESS_EXPIRE=365
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Open http://localhost:3000 in your browser to view the application.

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint checks

## Full Documentation

For detailed technical architecture, backend API references, database schemas, security models, and system workflows, please refer to [workflow.md](workflow.md).