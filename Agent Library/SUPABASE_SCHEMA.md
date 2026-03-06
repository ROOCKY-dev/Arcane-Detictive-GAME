# Supabase Database Schema

## Tables

### profiles
```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    avatar_url TEXT,
    class_id UUID REFERENCES classes(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view profiles in their class" ON profiles
    FOR SELECT USING (
        class_id IN (
            SELECT id FROM classes WHERE teacher_id = auth.uid()
        )
    );
```

### classes
```sql
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    teacher_id UUID REFERENCES profiles(id) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their own classes" ON classes
    FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their enrolled class" ON classes
    FOR SELECT USING (
        id IN (SELECT class_id FROM profiles WHERE id = auth.uid())
    );
```

### quest_progress
```sql
CREATE TABLE quest_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    quest_id TEXT NOT NULL,
    location_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    hints_used INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    time_seconds INTEGER,
    submitted_query TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, quest_id)
);

-- RLS Policies
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress" ON quest_progress
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Teachers can view student progress in their class" ON quest_progress
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE class_id IN (
                SELECT id FROM classes WHERE teacher_id = auth.uid()
            )
        )
    );
```

### achievements
```sql
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- RLS Policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and earn their own achievements" ON user_achievements
    FOR ALL USING (user_id = auth.uid());
```

### custom_cases (Teacher-created)
```sql
CREATE TABLE custom_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES profiles(id) NOT NULL,
    class_id UUID REFERENCES classes(id),
    title TEXT NOT NULL,
    narrative TEXT NOT NULL,
    npc_dialogue TEXT,
    hints JSONB DEFAULT '[]',
    expected_result JSONB NOT NULL,
    sample_solution TEXT,
    database_url TEXT NOT NULL,  -- URL to custom .sqlite file
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE custom_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their own cases" ON custom_cases
    FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can view published cases for their class" ON custom_cases
    FOR SELECT USING (
        published = TRUE AND class_id IN (
            SELECT class_id FROM profiles WHERE id = auth.uid()
        )
    );
```