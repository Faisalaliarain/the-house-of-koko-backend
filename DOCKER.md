# Docker Setup for The project-name Backend

This document explains how to run The project-name Backend using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Production Environment

```bash
# Start production environment
docker-compose up -d

# Or use the helper script
./docker.sh prod       # Linux/Mac
docker.bat prod         # Windows
```

### Development Environment

```bash
# Start development environment with hot reload
docker-compose --profile dev up -d

# Or use the helper script
./docker.sh dev         # Linux/Mac
docker.bat dev          # Windows
```

## Services

### MongoDB
- **Port**: 27017
- **Database**: the_project-name
- **Username**: admin
- **Password**: password123

### Backend (Production)
- **Port**: 5000
- **Health Check**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/api (if Swagger is configured)

### Backend (Development)
- **Port**: 5001
- **Hot Reload**: Enabled
- **Source Mapping**: Enabled

## Docker Commands

### Basic Commands

```bash
# Start all services
docker-compose up -d

# Start with logs
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Development Commands

```bash
# Start development environment
docker-compose --profile dev up -d

# Rebuild containers
docker-compose build --no-cache

# Reset everything (WARNING: deletes all data)
docker-compose --profile dev down -v
```

### Helper Scripts

Use the provided helper scripts for easier management:

**Linux/Mac:**
```bash
./docker.sh prod      # Start production
./docker.sh dev       # Start development
./docker.sh stop      # Stop all services
./docker.sh logs      # View all logs
./docker.sh logs backend  # View backend logs
./docker.sh rebuild   # Rebuild and restart
./docker.sh reset     # Reset everything
```

**Windows:**
```cmd
docker.bat prod       # Start production
docker.bat dev        # Start development
docker.bat stop       # Stop all services
docker.bat logs       # View all logs
docker.bat logs backend   # View backend logs
docker.bat rebuild    # Rebuild and restart
docker.bat reset      # Reset everything
```

## Configuration

### Environment Variables

The application uses environment variables from `./config/docker.env`:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Application port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### MongoDB Initialization

The MongoDB container automatically runs the initialization script `mongo-init.js` which:
- Creates the `the_project-name` database
- Sets up the `users` collection with validation
- Creates necessary indexes

### Volumes

- `mongodb_data`: Persistent MongoDB data
- `./uploads`: File uploads directory
- `./config`: Configuration files (read-only)

## Troubleshooting

### Container won't start

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]
```

### Database connection issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB container
docker exec -it the-project-name-mongodb mongosh
```

### Performance issues

```bash
# Check resource usage
docker stats

# Clean up unused resources
docker system prune -f
```

### Reset everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose --profile dev down -v

# Remove all unused Docker resources
docker system prune -a
```

## Health Checks

Both services include health checks:

- **MongoDB**: Uses `mongosh` to ping the database
- **Backend**: Uses wget to check the `/health` endpoint

Check health status:
```bash
docker-compose ps
```

## Development Tips

1. **Hot Reload**: Use the development profile for automatic code reloading
2. **Debugging**: Attach your IDE's debugger to the development container
3. **Database GUI**: Use MongoDB Compass to connect to `mongodb://admin:password123@localhost:27017`
4. **Logs**: Use `docker-compose logs -f` to monitor real-time logs

## Production Deployment

For production deployment:

1. Update environment variables in `docker.env`
2. Use proper secrets management
3. Set up reverse proxy (nginx/traefik)
4. Configure SSL certificates
5. Set up monitoring and logging
6. Configure backup strategies for MongoDB
