-- Create user_favorite_servers table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.user_favorite_servers (
    user_id TEXT NOT NULL,
    server_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, server_id),
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorite_servers_user_id ON public.user_favorite_servers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_servers_server_id ON public.user_favorite_servers(server_id);
