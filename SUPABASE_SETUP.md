# Supabase Setup Guide

This guide will help you set up Supabase for the SnippetHub application.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the database to be provisioned

## 2. Create the Database Schema

Go to the SQL Editor in your Supabase dashboard and run the following SQL:

```sql
-- Create snippets table
CREATE TABLE IF NOT EXISTS snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'javascript',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS snippets_user_id_idx ON snippets(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS snippets_created_at_idx ON snippets(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own snippets
CREATE POLICY "Users can view their own snippets"
    ON snippets
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own snippets
CREATE POLICY "Users can insert their own snippets"
    ON snippets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own snippets
CREATE POLICY "Users can update their own snippets"
    ON snippets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own snippets
CREATE POLICY "Users can delete their own snippets"
    ON snippets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_snippets_updated_at
    BEFORE UPDATE ON snippets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase dashboard:
- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → Project API keys → `anon` `public`

## 4. Enable Email Auth (Optional)

1. Go to Authentication → Providers in your Supabase dashboard
2. Enable Email provider
3. Configure email templates if needed

## 5. Test Your Setup

1. Restart your Next.js development server: `npm run dev`
2. Navigate to the signup page and create an account
3. Create a test snippet
4. Verify that you can view, edit, and delete the snippet

## Troubleshooting

### "Snippet not found" error
- Check that the snippets table exists in your database
- Verify RLS policies are set up correctly
- Make sure you're logged in and the snippet belongs to your user
- Check browser console for detailed error messages

### Authentication issues
- Verify your environment variables are correct
- Make sure `.env.local` is in the root directory
- Restart the dev server after changing environment variables

### Database connection issues
- Check your Supabase project is active
- Verify the project URL and anon key are correct
- Check your internet connection

## Sample Data (Optional)

To insert some test data, run this SQL (replace `YOUR_USER_ID` with your actual user ID from `auth.users`):

```sql
INSERT INTO snippets (user_id, title, description, code, language)
VALUES 
(
    'YOUR_USER_ID',
    'React useState Hook',
    'Basic example of React useState hook',
    'import { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}',
    'javascript'
);
```

You can find your user ID by running:
```sql
SELECT id, email FROM auth.users;
```

