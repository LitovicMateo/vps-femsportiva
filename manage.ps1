# WordPress Headless CMS - PowerShell Management Script
# Usage: .\manage.ps1 <command>

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Arg1,
    
    [Parameter(Position=2)]
    [string]$Arg2
)

function Show-Help {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "WordPress Headless CMS - Docker Commands" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Environment Management:" -ForegroundColor Yellow
    Write-Host "  .\manage.ps1 dev              - Start development environment"
    Write-Host "  .\manage.ps1 staging          - Start staging environment"
    Write-Host "  .\manage.ps1 prod             - Start production environment"
    Write-Host ""
    Write-Host "Build Commands:" -ForegroundColor Yellow
    Write-Host "  .\manage.ps1 dev-build        - Build and start development"
    Write-Host "  .\manage.ps1 staging-build    - Build and start staging"
    Write-Host "  .\manage.ps1 prod-build       - Build and start production"
    Write-Host ""
    Write-Host "Utility Commands:" -ForegroundColor Yellow
    Write-Host "  .\manage.ps1 logs             - Show logs (all services)"
    Write-Host "  .\manage.ps1 logs-wp          - Show WordPress logs"
    Write-Host "  .\manage.ps1 logs-frontend    - Show frontend logs"
    Write-Host "  .\manage.ps1 logs-nginx       - Show Nginx logs"
    Write-Host "  .\manage.ps1 down             - Stop all services"
    Write-Host "  .\manage.ps1 clean            - Stop and remove volumes"
    Write-Host ""
    Write-Host "Database Management:" -ForegroundColor Yellow
    Write-Host "  .\manage.ps1 backup-db dev    - Backup database"
    Write-Host "  .\manage.ps1 restore-db staging <file> - Restore database"
    Write-Host ""
    Write-Host "Shell Access:" -ForegroundColor Yellow
    Write-Host "  .\manage.ps1 shell-wp         - WordPress shell"
    Write-Host "  .\manage.ps1 shell-db         - Database shell"
    Write-Host "  .\manage.ps1 shell-frontend   - Frontend shell"
    Write-Host ""
}

switch ($Command.ToLower()) {
    "dev" {
        Write-Host "Starting development environment..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up
    }
    "dev-build" {
        Write-Host "Building and starting development environment..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up --build
    }
    "staging" {
        Write-Host "Starting staging environment..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d
    }
    "staging-build" {
        Write-Host "Building and starting staging environment..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d --build
    }
    "prod" {
        Write-Host "Starting production environment..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
    }
    "prod-build" {
        Write-Host "Building and starting production environment..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build
    }
    "logs" {
        docker-compose logs -f
    }
    "logs-wp" {
        docker-compose logs -f wordpress
    }
    "logs-frontend" {
        docker-compose logs -f frontend
    }
    "logs-nginx" {
        docker-compose logs -f nginx
    }
    "down" {
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        docker-compose down
    }
    "clean" {
        Write-Host "WARNING: This will delete all data in Docker volumes!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            docker-compose down -v
            Write-Host "✓ Cleaned up" -ForegroundColor Green
        } else {
            Write-Host "Cancelled" -ForegroundColor Yellow
        }
    }
    "backup-db" {
        if (-not $Arg1) {
            Write-Host "Error: ENV parameter required. Usage: .\manage.ps1 backup-db dev" -ForegroundColor Red
            exit 1
        }
        Write-Host "Note: For database backup on Windows, use WSL or Git Bash to run:" -ForegroundColor Yellow
        Write-Host "  bash scripts/backup-db.sh $Arg1" -ForegroundColor Cyan
    }
    "restore-db" {
        if (-not $Arg1 -or -not $Arg2) {
            Write-Host "Error: ENV and FILE parameters required." -ForegroundColor Red
            Write-Host "Usage: .\manage.ps1 restore-db staging .\backups\backup.sql.gz" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "Note: For database restore on Windows, use WSL or Git Bash to run:" -ForegroundColor Yellow
        Write-Host "  bash scripts/restore-db.sh $Arg1 $Arg2" -ForegroundColor Cyan
    }
    "shell-wp" {
        docker-compose exec wordpress bash
    }
    "shell-db" {
        docker-compose exec database bash
    }
    "shell-frontend" {
        docker-compose exec frontend sh
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}
