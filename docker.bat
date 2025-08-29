@echo off
REM The project-name Backend - Docker Management Scripts for Windows

echo The project-name Backend - Docker Management
echo ====================================

if "%1"=="prod" goto start_prod
if "%1"=="dev" goto start_dev
if "%1"=="stop" goto stop_all
if "%1"=="logs" goto view_logs
if "%1"=="rebuild" goto rebuild
if "%1"=="reset" goto reset
goto usage

:start_prod
echo Starting production environment...
docker-compose up -d
echo Production environment started!
echo Backend: http://localhost:5000
echo MongoDB: localhost:27017
goto end

:start_dev
echo Starting development environment...
docker-compose --profile dev up -d
echo Development environment started!
echo Backend Dev: http://localhost:5001
echo MongoDB: localhost:27017
goto end

:stop_all
echo Stopping all services...
docker-compose --profile dev down
echo All services stopped!
goto end

:view_logs
if "%2"=="backend" (
    docker-compose logs -f backend
) else if "%2"=="mongodb" (
    docker-compose logs -f mongodb
) else if "%2"=="dev" (
    docker-compose logs -f backend-dev
) else (
    docker-compose logs -f
)
goto end

:rebuild
echo Rebuilding and restarting...
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo Rebuild complete!
goto end

:reset
echo Resetting everything (this will delete all data)...
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    docker-compose --profile dev down -v
    docker system prune -f
    echo Reset complete!
) else (
    echo Reset cancelled.
)
goto end

:usage
echo Usage: %0 {prod^|dev^|stop^|logs [service]^|rebuild^|reset}
echo.
echo Commands:
echo   prod     - Start production environment
echo   dev      - Start development environment with hot reload
echo   stop     - Stop all services
echo   logs     - View logs (optionally specify: backend, mongodb, dev)
echo   rebuild  - Rebuild and restart containers
echo   reset    - Reset everything (WARNING: deletes all data)

:end
