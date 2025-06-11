# MCP-Linker API

MCP-Linker Backend API with Supabase Authentication integration.

## Setup Instructions

1. Clone the repository
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up Supabase:
   - Create a new project on [Supabase](https://supabase.com/)
   - Copy your Supabase URL and anon key
   - Set up a JWT secret
   - Create an `.env` file based on `.env.example` and add your Supabase credentials

5. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Routes

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `POST /api/v1/auth/logout` - Logout (requires authentication)
- `GET /api/v1/auth/me` - Get current user information (requires authentication)

### Servers

- `GET /api/v1/servers` - Get all servers (public)
- `GET /api/v1/servers/{id}` - Get server by ID (public)
- `POST /api/v1/servers` - Create a new server (requires authentication)
- `PUT /api/v1/servers/{id}` - Update a server (requires admin)
- `DELETE /api/v1/servers/{id}` - Delete a server (requires admin)

## Authentication Flow

1. Users register or login using Supabase authentication
2. The backend receives and validates JWT tokens
3. Protected routes check for valid tokens and user roles
4. Admin routes require admin role

## Environment Variables

- `PROJECT_NAME` - API project name
- `API_VERSION` - API version
- `CORS_ORIGINS` - List of allowed origins for CORS
- `DATABASE_URL` - Database connection URL
- `SUPABASE_JWT_SECRET` - JWT secret for token validation

## Documentation

API documentation is available at:
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`
