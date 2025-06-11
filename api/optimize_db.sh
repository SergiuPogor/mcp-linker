#!/bin/bash

# Database performance optimization script
# This script applies database indexes to improve query performance

echo "🔧 Applying database performance optimizations..."

# Get database connection info (adjust these variables according to your setup)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-mcp-linker}"
DB_USER="${DB_USER:-postgres}"

# Apply server indexes
echo "📊 Adding server performance indexes..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/add_server_indexes.sql

# Apply server config indexes
echo "📊 Adding server config performance indexes..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/add_server_config_indexes.sql

echo "✅ Database optimization complete!"

# Optional: Analyze table statistics for better query planning
echo "📈 Updating table statistics..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE servers;"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE ServerConfigs;"

echo "🚀 All optimizations applied successfully!"
