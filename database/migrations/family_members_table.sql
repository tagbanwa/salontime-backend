CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relation TEXT, -- e.g., 'child', 'spouse', 'parent', 'other'
    date_of_birth DATE,
    gender TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own family members"
    ON public.family_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family members"
    ON public.family_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members"
    ON public.family_members FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members"
    ON public.family_members FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_family_members_updated_at ON public.family_members;
CREATE TRIGGER update_family_members_updated_at
    BEFORE UPDATE ON public.family_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

