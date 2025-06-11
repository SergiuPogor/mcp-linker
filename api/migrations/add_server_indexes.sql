-- 添加服务器表的性能索引
-- 这些索引将显著提升查询和排序性能

-- 单字段索引（用于排序）
CREATE INDEX IF NOT EXISTS idx_servers_github_stars ON servers(github_stars DESC);
CREATE INDEX IF NOT EXISTS idx_servers_views ON servers(views DESC);
CREATE INDEX IF NOT EXISTS idx_servers_downloads ON servers(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_servers_created_at ON servers(created_at DESC);

-- 外键索引（用于过滤）
CREATE INDEX IF NOT EXISTS idx_servers_category_id ON servers(category_id);
CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);

-- 用于开发者过滤的索引
CREATE INDEX IF NOT EXISTS idx_servers_developer ON servers(developer);

-- 用于搜索的索引（如果使用PostgreSQL）
CREATE INDEX IF NOT EXISTS idx_servers_search_gin ON servers USING gin(to_tsvector('english', name || ' ' || description || ' ' || developer));
