# The project-name Backend - Docker Setup Guide

## Prerequisites Check

Before running the Docker setup, ensure you have:

1. **Docker Desktop installed and running**
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker Desktop is started

2. **Check Docker is running:**
   ```bash
   docker --version
   docker-compose --version
   ```

## Setup Instructions

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your system.

### 2. Build and Start Services

**Option A: Quick Start (Recommended)**
```bash
# Windows
docker.bat prod

# Linux/Mac
./docker.sh prod
```

**Option B: Manual Commands**
```bash
# Build the containers
docker-compose build

# Start the services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Verify Setup

Once containers are running, verify:

- **Backend Health**: http://localhost:5000/health
- **MongoDB**: Connect using MongoDB Compass to `mongodb://admin:password123@localhost:27017`

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just MongoDB
docker-compose logs -f mongodb
```

## Development Setup

For development with hot reload:

```bash
# Windows
docker.bat dev

# Linux/Mac
./docker.sh dev
```

This will:
- Start MongoDB on port 27017
- Start backend with hot reload on port 5001
- Mount source code for live editing

## Troubleshooting

### Docker Desktop Not Running
```
Error: Cannot connect to the Docker daemon
```
**Solution**: Start Docker Desktop application

### Port Already in Use
```
Error: Port 5000 is already allocated
```
**Solution**: Stop other services using the port or modify `docker-compose.yml`

### MongoDB Connection Issues
```
Error: MongoNetworkError
```
**Solution**: Wait for MongoDB to fully start (check logs with `docker-compose logs mongodb`)

## Next Steps

1. The backend will be available at http://localhost:5000
2. MongoDB will be available at localhost:27017
3. Check the main README.md for API documentation
4. Use Postman or similar tools to test the API endpoints

## Environment Variables

Key environment variables are configured in `config/docker.env`:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: Application port

Modify these as needed for your environment.
