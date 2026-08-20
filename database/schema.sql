-- ProofStay Database Schema for PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    landlord_name VARCHAR(255) NOT NULL,
    move_in_date DATE NOT NULL,
    move_out_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    checklist TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Table
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('move_in', 'move_out', 'maintenance')),
    file_url TEXT NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    condition_tags TEXT[] DEFAULT '{}',
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Events Table
CREATE TABLE IF NOT EXISTS maintenance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('reported', 'in_progress', 'resolved')),
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Damage Analyses Table
CREATE TABLE IF NOT EXISTS damage_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    issue VARCHAR(255) NOT NULL,
    change_detected VARCHAR(50) NOT NULL,
    classification VARCHAR(50) NOT NULL,
    confidence VARCHAR(50) NOT NULL,
    evidence_strength VARCHAR(50) NOT NULL,
    reasoning TEXT[] DEFAULT '{}',
    evidence_ids TEXT[] DEFAULT '{}',
    move_in_photo_url TEXT,
    move_out_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    summary JSONB,
    report_url TEXT
);

-- Row Level Security (RLS) Policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
