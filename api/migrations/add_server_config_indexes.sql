-- Add performance indexes for ServerConfig table
-- These indexes will significantly improve query performance

-- Index for server_id lookups (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_server_configs_server_id ON ServerConfigs(server_id);
