-- Football Intel Database Schema

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100),
    league VARCHAR(100),
    instagram_handle VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    post_type VARCHAR(50) NOT NULL,
    caption TEXT,
    post_url VARCHAR(500) UNIQUE,
    post_date DATE NOT NULL,
    source_filename VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    comment_id VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    username VARCHAR(255),
    user_id VARCHAR(255),
    profile_pic_url TEXT,
    comment_created_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, comment_id)
);

-- Admin users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ingestion jobs table
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_files INTEGER DEFAULT 0,
    total_rows INTEGER DEFAULT 0,
    inserted_rows INTEGER DEFAULT 0,
    duplicate_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_club_id ON posts(club_id);
CREATE INDEX IF NOT EXISTS idx_posts_post_date ON posts(post_date);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_username ON comments(username);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_created_at ON ingestion_jobs(created_at);

-- Initial admin user (username: admin, password: admin123)
-- Hash generated with bcrypt: bcrypt.hashpw(b'admin123', bcrypt.gensalt())
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$12$BWu6DNQ3PErPOehimYFKeuSuEqkeH8BswFnvECAaDmwhBVqBJT2iG', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Sample clubs
INSERT INTO clubs (name, country, league, instagram_handle) VALUES 
('Manchester United', 'England', 'Premier League', '@manutd'),
('Liverpool FC', 'England', 'Premier League', '@liverpoolfc'),
('Real Madrid', 'Spain', 'La Liga', '@realmadrid'),
('Barcelona', 'Spain', 'La Liga', '@fcbarcelona'),
('Bayern Munich', 'Germany', 'Bundesliga', '@fcbayern')
ON CONFLICT (name) DO NOTHING;