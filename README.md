# Workflow Management Backend


 comprehensive workflow management platform for SEO link-building and content publishing, supporting 5 user roles with a complete state-machine-driven workflow.
## Features

- 🔐 **JWT Authentication** with role-based access control (RBAC)
- 👥 **5 User Roles**: Admin, Manager, Team/Researcher, Writer, Blogger
- 🔄 **State Machine Workflow**: 11-stage workflow from topic discovery to payment
- 💰 **Wallet System**: Automatic blogger payments and withdrawal management
- 📊 **Analytics**: Role-specific dashboards and statistics
- 🗄️ **PostgreSQL Database**: Complete schema with transactions and migrations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcryptjs
- **File Upload**: Multer (CSV bulk uploads)

## Project Structure

```
workflowbackend/
├── server.js                 # Main application entry
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # JWT authentication & RBAC
│   └── errorHandler.js      # Centralized error handling
├── models/
│   ├── User.js              # User model
│   ├── Website.js           # Website inventory model
│   ├── Task.js              # Core workflow entity
│   └── Transaction.js       # Withdrawal/payment model
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── adminController.js   # Admin panel logic
│   ├── teamController.js    # Team panel logic
│   ├── managerController.js # Manager panel logic
│   ├── writerController.js  # Writer panel logic
│   └── bloggerController.js # Blogger panel logic
├── routes/
│   ├── auth.js              # Auth routes
│   ├── admin.js             # Admin routes
│   ├── team.js              # Team routes
│   ├── manager.js           # Manager routes
│   ├── writer.js            # Writer routes
│   └── blogger.js           # Blogger routes
├── utils/
│   ├── statusTransitions.js # Workflow state machine
│   └── walletService.js     # Wallet operations
├── migrations/
│   ├── 001_create_tables.sql # Database schema
│   └── migrate.js           # Migration runner
└── package.json
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Steps

1. **Clone or navigate to the project**:
   ```bash
   cd workflowbackend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - Database credentials (PostgreSQL)
   - JWT secret
   - Port and other settings

4. **Create PostgreSQL database**:
   ```bash
   psql -U postgres
   CREATE DATABASE workflow_management;
   \q
   ```

5. **Run migrations**:
   ```bash
   npm run migrate
   ```

   This creates all tables, indexes, and a default admin user:
   - Email: `admin@workflow.com`
   - Password: `admin123`
   - ⚠️ **Change this password immediately in production!**

6. **Start the server**:

   **Development mode** (with auto-reload):
   ```bash
   npm run dev
   ```

   **Production mode**:
   ```bash
   npm start
   ```

7. **Verify the server is running**:
   ```bash
   curl http://localhost:5000/health
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@workflow.com",
  "password": "admin123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@workflow.com",
    "role": "Admin",
    "wallet_balance": 0.00
  }
}
```

### Admin Panel

- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/websites` - Get all websites
- `POST /api/admin/websites` - Create website
- `POST /api/admin/websites/upload` - Bulk upload (CSV)
- `PUT /api/admin/websites/:id` - Update website
- `DELETE /api/admin/websites/:id` - Delete website
- `GET /api/admin/stats` - Dashboard statistics

### Team Panel

- `GET /api/team/tasks` - Get my submitted tasks
- `POST /api/team/tasks` - Create new task
- `GET /api/team/tasks/:id` - Get task details

### Manager Panel

- `GET /api/manager/tasks` - Get all tasks (filterable)
- `GET /api/manager/tasks/:id` - Get task details
- `PATCH /api/manager/tasks/:id/assign` - Assign to writer (Approval 1)
- `PATCH /api/manager/tasks/:id/approve-content` - Assign to blogger (Approval 2)
- `PATCH /api/manager/tasks/:id/return-to-writer` - Return for revisions
- `PATCH /api/manager/tasks/:id/finalize` - Finalize and credit (Approval 3)
- `PATCH /api/manager/tasks/:id/reject` - Reject task
- `GET /api/manager/withdrawals` - Get withdrawal requests
- `PATCH /api/manager/withdrawals/:id/approve` - Approve withdrawal
- `PATCH /api/manager/withdrawals/:id/reject` - Reject withdrawal

### Writer Panel

- `GET /api/writer/tasks` - Get assigned tasks
- `GET /api/writer/tasks/:id` - Get task details
- `POST /api/writer/tasks/:id/submit-content` - Submit content
- `PATCH /api/writer/tasks/:id/mark-in-progress` - Mark in progress

### Blogger Panel

- `GET /api/blogger/tasks` - Get assigned tasks
- `GET /api/blogger/tasks/:id` - Get task details
- `POST /api/blogger/tasks/:id/submit-link` - Submit live URL
- `GET /api/blogger/wallet` - Get wallet info
- `POST /api/blogger/withdrawals/request` - Request withdrawal
- `GET /api/blogger/withdrawals` - Get withdrawal history
- `GET /api/blogger/stats` - Get statistics

## Workflow State Machine

The system uses an 11-stage state machine:

1. **DRAFT** → Team creates task
2. **PENDING_MANAGER_APPROVAL_1** → Manager reviews topic
3. **ASSIGNED_TO_WRITER** → Writer receives task
4. **WRITING_IN_PROGRESS** → Writer working on content
5. **PENDING_MANAGER_APPROVAL_2** → Manager reviews content
6. **ASSIGNED_TO_BLOGGER** → Blogger receives content
7. **PUBLISHED_PENDING_VERIFICATION** → Blogger publishes
8. **PENDING_FINAL_CHECK** → Manager verifies link
9. **COMPLETED** → Task complete
10. **CREDITED** → Payment sent to blogger (final state)
11. **REJECTED** → Task rejected (final state)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | workflow_management |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing key | - |
| `JWT_EXPIRES_IN` | Token expiry | 24h |
| `CORS_ORIGIN` | CORS origin | http://localhost:3000 |

## Database Schema

### Tables

- **users**: System users with role-based access
- **websites**: Website inventory for posting
- **tasks**: Core workflow entity
- **transactions**: Withdrawal requests and payments
- **system_config**: System-wide configuration

See `migrations/001_create_tables.sql` for complete schema.

## Development

### Running Tests
```bash
# TODO: Add tests
npm test
```

### Code Style
- Use ES6+ features
- Async/await for asynchronous operations
- Consistent error handling

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure database with SSL
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Configure proper CORS origins
7. Set up logging and monitoring
8. Regular database backups

## License

ISC

## Support

For issues or questions, please contact the development team.
