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
    post_url VARCHAR(500),
    post_date DATE NOT NULL,
    source_filename VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    comment_id VARCHAR(255) NOT NULL UNIQUE,
    text TEXT NOT NULL,
    username VARCHAR(255),
    user_id VARCHAR(255),
    profile_pic_url TEXT,
    comment_created_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
-- Roles: 'administrator', 'datacollector'
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'datacollector',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (role IN ('administrator', 'datacollector'))
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
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$12$BWu6DNQ3PErPOehimYFKeuSuEqkeH8BswFnvECAaDmwhBVqBJT2iG', 'administrator')
ON CONFLICT (username) DO NOTHING;

-- Sample DataCollector user (username: collector1, password: collector123)
INSERT INTO users (username, password_hash, role) 
VALUES ('collector1', '$2b$12$rKGmgDZe7/2v9ljufaLw7OskGYc.N5as2vgt3tXJWhU1KdBVG6PWe', 'datacollector')
ON CONFLICT (username) DO NOTHING;

-- Sample clubs (international - reference)
-- INSERT INTO clubs (name, country, league, instagram_handle) VALUES 
-- ('Manchester United', 'England', 'Premier League', '@manutd'),
-- ('Liverpool FC', 'England', 'Premier League', '@liverpoolfc'),
-- ('Real Madrid', 'Spain', 'La Liga', '@realmadrid'),
-- ('Barcelona', 'Spain', 'La Liga', '@fcbarcelona'),
-- ('Bayern Munich', 'Germany', 'Bundesliga', '@fcbayern')
-- ON CONFLICT (name) DO NOTHING;

-- Liga 1 Indonesia 2024/2025
INSERT INTO clubs (name, country, league, instagram_handle) VALUES
('Bali United FC', 'Indonesia', 'Liga 1', '@baboroshop.baliutd'),
('Arema FC', 'Indonesia', 'Liga 1', '@araboroshop.aremafcofficial'),
('Persija Jakarta', 'Indonesia', 'Liga 1', '@persija'),
('Persib Bandung', 'Indonesia', 'Liga 1', '@persib'),
('PSM Makassar', 'Indonesia', 'Liga 1', '@psm_makassar'),
('Borneo FC Samarinda', 'Indonesia', 'Liga 1', '@borneofc.id'),
('Persis Solo', 'Indonesia', 'Liga 1', '@persissolo'),
('PSIS Semarang', 'Indonesia', 'Liga 1', '@psisofficial'),
('Barito Putera', 'Indonesia', 'Liga 1', '@baritoputeraofficial'),
('Dewa United', 'Indonesia', 'Liga 1', '@dewaunited.fc'),
('Madura United', 'Indonesia', 'Liga 1', '@maduraunited.fc'),
('Persebaya Surabaya', 'Indonesia', 'Liga 1', '@officialpersebaya'),
('Persik Kediri', 'Indonesia', 'Liga 1', '@persikfckediri'),
('Persita Tangerang', 'Indonesia', 'Liga 1', '@persitaofficial'),
('RANS Nusantara FC', 'Indonesia', 'Liga 1', '@ransnusantarafc'),
('PSS Sleman', 'Indonesia', 'Liga 1', '@pss_sleman'),
('Semen Padang FC', 'Indonesia', 'Liga 1', '@semenpadangfcofficial'),
('Malut United FC', 'Indonesia', 'Liga 1', '@malutunitedfc')
ON CONFLICT (name) DO NOTHING;

-- Liga 2 Indonesia 2024/2025
INSERT INTO clubs (name, country, league, instagram_handle) VALUES
('PSPS Riau', 'Indonesia', 'Liga 2', NULL),
('FC Bekasi City', 'Indonesia', 'Liga 2', NULL),
('Persikabo 1973', 'Indonesia', 'Liga 2', NULL),
('Persiraja Banda Aceh', 'Indonesia', 'Liga 2', NULL),
('Sriwijaya FC', 'Indonesia', 'Liga 2', NULL),
('Persela Lamongan', 'Indonesia', 'Liga 2', NULL),
('PSIM Yogyakarta', 'Indonesia', 'Liga 2', NULL),
('Persijap Jepara', 'Indonesia', 'Liga 2', NULL),
('Persipa Pati', 'Indonesia', 'Liga 2', NULL),
('Persekat Tegal', 'Indonesia', 'Liga 2', NULL),
('Perserang Serang', 'Indonesia', 'Liga 2', NULL),
('Persipura Jayapura', 'Indonesia', 'Liga 2', NULL),
('Deltras FC', 'Indonesia', 'Liga 2', NULL),
('Gresik United', 'Indonesia', 'Liga 2', NULL),
('Nusantara United', 'Indonesia', 'Liga 2', NULL),
('Persiba Balikpapan', 'Indonesia', 'Liga 2', NULL),
('PSKC Cimahi', 'Indonesia', 'Liga 2', NULL),
('Persikas Subang', 'Indonesia', 'Liga 2', NULL),
('Persipal Palu', 'Indonesia', 'Liga 2', NULL),
('Adhyaksa Farmel', 'Indonesia', 'Liga 2', NULL),
('Sada Sumut FC', 'Indonesia', 'Liga 2', NULL),
('PSDS Deli Serdang', 'Indonesia', 'Liga 2', NULL),
('PSGC Ciamis', 'Indonesia', 'Liga 2', NULL),
('Persikab Bandung', 'Indonesia', 'Liga 2', NULL)
ON CONFLICT (name) DO NOTHING;