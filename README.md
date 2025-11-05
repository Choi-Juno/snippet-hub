# 🔷 SnippetHub

A modern, feature-rich code snippet management platform built with Next.js 14, TypeScript, and Supabase.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

## ✨ Features

### 🎯 Core Features
- ✅ **CRUD Operations** - Create, read, update, and delete code snippets
- ✅ **Syntax Highlighting** - Beautiful code display with Monaco Editor & react-syntax-highlighter
- ✅ **Tag System** - Organize snippets with custom tags
- ✅ **Favorites** - Mark important snippets for quick access
- ✅ **Search & Filter** - Powerful search with language and favorite filters
- ✅ **Sorting** - Sort by newest, oldest, title, or language

### 🎨 UI/UX Features
- ✅ **Dark Mode** - Full dark mode support with system detection
- ✅ **Responsive Design** - Works perfectly on all screen sizes
- ✅ **Loading States** - Skeleton UI for better user experience
- ✅ **Toast Notifications** - Beautiful feedback for all actions
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **404 Page** - Custom not found page

### 🔒 Security & Performance
- ✅ **Authentication** - Secure email/password authentication via Supabase
- ✅ **Row Level Security (RLS)** - Database-level security policies
- ✅ **Environment Validation** - Runtime validation of environment variables
- ✅ **TypeScript** - Full type safety
- ✅ **Code Splitting** - Optimized bundle sizes

### 📊 Additional Features
- ✅ **Statistics Dashboard** - View snippet counts and language distribution
- ✅ **Export Functionality** - Backup snippets as JSON
- ✅ **Keyboard Shortcuts** - ⌘K/Ctrl+K for quick search
- ✅ **Copy as Markdown** - Copy snippets in markdown format

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Supabase Account** (free tier available)

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/snippet-hub.git
cd snippet-hub
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to initialize

#### Run Database Migrations

Copy and execute these SQL commands in your Supabase SQL Editor:

**1. Create snippets table:**

\`\`\`sql
create table snippets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  code text not null,
  language text not null,
  is_favorite boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table snippets enable row level security;

-- RLS Policies
create policy "Users can view their own snippets"
  on snippets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own snippets"
  on snippets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own snippets"
  on snippets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own snippets"
  on snippets for delete
  using (auth.uid() = user_id);
\`\`\`

**2. Create tags tables:**

\`\`\`sql
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamp with time zone default now()
);

create table snippet_tags (
  snippet_id uuid references snippets(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (snippet_id, tag_id)
);

-- Enable RLS
alter table tags enable row level security;
alter table snippet_tags enable row level security;

-- RLS Policies for tags
create policy "Anyone can view tags"
  on tags for select
  to authenticated
  using (true);

create policy "Anyone can create tags"
  on tags for insert
  to authenticated
  with check (true);

-- RLS Policies for snippet_tags
create policy "Users can view their snippet tags"
  on snippet_tags for select
  using (
    exists (
      select 1 from snippets
      where snippets.id = snippet_tags.snippet_id
      and snippets.user_id = auth.uid()
    )
  );

create policy "Users can manage their snippet tags"
  on snippet_tags for all
  using (
    exists (
      select 1 from snippets
      where snippets.id = snippet_tags.snippet_id
      and snippets.user_id = auth.uid()
    )
  );
\`\`\`

### 4. Configure Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Then edit \`.env.local\` with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Navigate to: **Settings** > **API**
3. Copy:
   - **Project URL** → \`NEXT_PUBLIC_SUPABASE_URL\`
   - **anon/public key** → \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

\`\`\`
snippet-hub/
├── app/                          # Next.js 14 App Router
│   ├── (app)/                   # Authenticated routes
│   │   ├── dashboard/           # Main dashboard
│   │   │   ├── favorites/       # Favorites page
│   │   │   ├── tags/            # Tags page
│   │   │   ├── settings/        # Settings page
│   │   │   └── snippets/        # Snippet CRUD
│   │   └── layout.tsx           # App layout with sidebar
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/               # Login page
│   │   └── signup/              # Sign up page
│   ├── error.tsx                # Global error boundary
│   ├── global-error.tsx         # Critical error handler
│   ├── not-found.tsx            # 404 page
│   └── layout.tsx               # Root layout
├── src/
│   ├── components/              # Reusable components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── editor/              # Code editor components
│   │   ├── layout/              # Layout components
│   │   ├── providers/           # Context providers
│   │   ├── snippet/             # Snippet components
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/                     # Utility functions
│   │   └── env.ts               # Environment validation
│   ├── stores/                  # Zustand stores
│   │   └── authStore.ts         # Auth state management
│   ├── types/                   # TypeScript types
│   │   └── database.ts          # Database types
│   └── supabase/                # Supabase client
│       └── client.ts            # Supabase initialization
├── .env.example                 # Environment variables template
├── .env.local                   # Your environment variables (gitignored)
└── README.md                    # This file
\`\`\`

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions (ready to use)

### Code Editor & Display
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - VS Code's editor
- **[react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - Syntax highlighting

### State Management & Utils
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[React Query](https://tanstack.com/query)** - Server state management (planned)
- **[date-fns](https://date-fns.org/)** - Date utilities
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark mode

---

## 🎯 Usage

### Creating a Snippet

1. Click **"+ New Snippet"** button
2. Fill in:
   - **Title** (required)
   - **Language** (required)
   - **Code** (required)
   - **Description** (optional)
   - **Tags** (optional)
3. Click **"Create Snippet"**

### Searching & Filtering

- **Search**: Use the search bar (or press ⌘K/Ctrl+K)
- **Filter by Language**: Select from the dropdown
- **Filter by Favorites**: Click the favorites button
- **Sort**: Choose sorting method (newest, oldest, title, language)

### Exporting Snippets

1. Go to **Settings**
2. Click **"Export"** in Data Management section
3. Your snippets will download as JSON

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
5. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build settings:
   - Build command: \`npm run build\`
   - Publish directory: \`.next\`
5. Add environment variables
6. Deploy!

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up with new account
- [ ] Log in
- [ ] Create a snippet
- [ ] Edit a snippet
- [ ] Delete a snippet
- [ ] Add tags
- [ ] Toggle favorite
- [ ] Search snippets
- [ ] Filter by language
- [ ] Export snippets
- [ ] Toggle dark mode
- [ ] Test on mobile
- [ ] Test 404 page
- [ ] Test error boundaries

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test your changes before submitting

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Vercel](https://vercel.com/) for hosting

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Supabase**
