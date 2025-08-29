# Nets Boiler Plate

A NestJS-based backend application with MongoDB integration, AWS S3 support, and user management.

## Features

- **NestJS Framework**: Built with modern TypeScript and dependency injection
- **MongoDB Integration**: Using Mongoose for database operations
- **AWS S3 Support**: File upload and management
- **JWT Authentication**: Secure user authentication system
- **Email Services**: AWS SES integration for email notifications
- **Swagger Documentation**: Auto-generated API documentation
- **Docker Support**: Containerized deployment ready

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or remote)
- AWS Account (for S3 and SES services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/the-project-name-backend.git
cd the-project-name-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Copy `.env` and update the values:
```bash
# Application
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/the_project-name

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
SES_REGION=us-east-1
SES_MAIL=noreply@example.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# S3 Configuration
S3_BUCKET_NAME=your-s3-bucket-name
```

4. Start the development server:
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

## API Documentation

Once the server is running, you can access the Swagger documentation at:
`http://localhost:3000/docs/api`

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Docker

### Development
```bash
npm run docker:dev
```

### Production
```bash
npm run docker:prod
```

## Project Structure

```
src/
├── entities/           # Database entities/schemas
├── shared/            # Shared modules, services, and utilities
│   ├── guards/        # Authentication and authorization guards
│   ├── services/      # Shared services (S3, JWT, etc.)
│   └── user/          # User management module
├── utils/             # Utility functions and helpers
│   ├── enums/         # Application enums
│   ├── mailer/        # Email services
│   └── upload/        # File upload utilities
└── main.ts           # Application entry point
```

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Authentication
- User authentication endpoints (to be implemented)

### File Upload
- S3 file upload functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if necessary
5. Submit a pull request

## License

This project is licensed under the UNLICENSED license. - NestJS Boilerplate

A clean and minimal NestJS boilerplate with TypeScript, Swagger documentation, and basic health checks.

## Features

- ✅ NestJS Framework
- ✅ TypeScript
- ✅ Swagger API Documentation
- ✅ Health Check Endpoints
- ✅ Environment Configuration
- ✅ CORS Enabled
- ✅ Validation Pipes
- ✅ Clean Architecture

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration.

3. **Run Development Server**
   ```bash
   npm run start:dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm run start:prod
   ```

## API Endpoints

- **Health Check**: `GET /api/health`
- **Root**: `GET /api`
- **API Documentation**: `GET /docs/api`

## Project Structure

```
src/
├── app.controller.ts    # Main application controller
├── app.module.ts        # Root application module
├── app.service.ts       # Main application service
└── main.ts             # Application entry point
```

## Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload  
- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint

## Environment Variables

```env
PORT=3000
NODE_ENV=development
```