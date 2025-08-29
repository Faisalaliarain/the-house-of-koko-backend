#!/bin/bash

# The project-name Backend - Docker Management Scripts

echo "The project-name Backend - Docker Management"
echo "===================================="

# Function to start production environment
start_prod() {
    echo "Starting production environment..."
    docker-compose up -d
    echo "Production environment started!"
    echo "Backend: http://localhost:5000"
    echo "MongoDB: localhost:27017"
}

# Function to start development environment
start_dev() {
    echo "Starting development environment..."
    docker-compose --profile dev up -d
    echo "Development environment started!"
    echo "Backend Dev: http://localhost:5001"
    echo "MongoDB: localhost:27017"
}

# Function to stop all services
stop_all() {
    echo "Stopping all services..."
    docker-compose --profile dev down
    echo "All services stopped!"
}

# Function to view logs
view_logs() {
    if [ "$1" = "backend" ]; then
        docker-compose logs -f backend
    elif [ "$1" = "mongodb" ]; then
        docker-compose logs -f mongodb
    elif [ "$1" = "dev" ]; then
        docker-compose logs -f backend-dev
    else
        docker-compose logs -f
    fi
}

# Function to rebuild and restart
rebuild() {
    echo "Rebuilding and restarting..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo "Rebuild complete!"
}

# Function to reset everything (including volumes)
reset() {
    echo "Resetting everything (this will delete all data)..."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose --profile dev down -v
        docker system prune -f
        echo "Reset complete!"
    else
        echo "Reset cancelled."
    fi
}

# Main script logic
case "$1" in
    "prod")
        start_prod
        ;;
    "dev")
        start_dev
        ;;
    "stop")
        stop_all
        ;;
    "logs")
        view_logs $2
        ;;
    "rebuild")
        rebuild
        ;;
    "reset")
        reset
        ;;
    *)
        echo "Usage: $0 {prod|dev|stop|logs [service]|rebuild|reset}"
        echo ""
        echo "Commands:"
        echo "  prod     - Start production environment"
        echo "  dev      - Start development environment with hot reload"
        echo "  stop     - Stop all services"
        echo "  logs     - View logs (optionally specify: backend, mongodb, dev)"
        echo "  rebuild  - Rebuild and restart containers"
        echo "  reset    - Reset everything (WARNING: deletes all data)"
        exit 1
        ;;
esac
