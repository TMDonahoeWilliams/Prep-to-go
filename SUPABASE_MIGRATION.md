# Supabase Migration Guide

This guide explains how to migrate your College Prep app from the current localStorage + Vercel serverless setup to Supabase.

## Phase 1: Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Environment Variables
Create `.env.local` file:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Database Schema
Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create all tables and policies.

## Phase 2: Gradual Migration Strategy

### Option A: Complete Migration
Replace all localStorage/API calls with Supabase:

```typescript
// Old way (current)
import { useTasks } from "@/hooks/useTasks";

// New way (with Supabase)
import { useTasksSupabase } from "@/hooks/useTasksSupabase";
```

### Option B: Hybrid Approach
Keep current system as fallback, add Supabase as option:

```typescript
// In your components
const useTasksHook = process.env.VITE_USE_SUPABASE ? useTasksSupabase : useTasks;
const { data: tasks } = useTasksHook();
```

## Phase 3: Authentication Migration

### Current System vs Supabase Auth

**Current (localStorage):**
```typescript
const { user, isAuthenticated } = useAuth();
```

**Supabase:**
```typescript
const { user, isAuthenticated } = useSupabaseAuth();
```

### Migration Steps:

1. **Keep existing auth as fallback**
2. **Add Supabase auth for new users**  
3. **Provide migration path for existing users**

## Phase 4: Data Migration

### For Existing Users
Create a migration endpoint that:

1. Reads localStorage data
2. Creates Supabase account
3. Imports tasks/data to Supabase
4. Clears localStorage
5. Switches to Supabase mode

```typescript
const migrateToSupabase = async () => {
  // 1. Get localStorage data
  const localTasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // 2. Create Supabase account
  const { data: authData } = await supabase.auth.signUp({
    email: localUser.email,
    password: 'temporary-password', // User should reset
  });
  
  // 3. Import tasks
  await supabase.from('tasks').insert(
    localTasks.map(task => ({ ...task, user_id: authData.user.id }))
  );
  
  // 4. Clear localStorage
  localStorage.clear();
  
  // 5. Set migration flag
  localStorage.setItem('migratedToSupabase', 'true');
};
```

## Phase 5: Benefits After Migration

### Real Database
- ✅ **Persistent data** across devices
- ✅ **Real-time sync** between parent/student
- ✅ **Backup and recovery**
- ✅ **Data integrity** with foreign keys

### Built-in Authentication
- ✅ **Email verification**
- ✅ **Password reset** 
- ✅ **OAuth providers** (Google, GitHub, etc.)
- ✅ **Row Level Security**

### Advanced Features
- ✅ **Real-time subscriptions** for live updates
- ✅ **File storage** for documents
- ✅ **Edge functions** for complex logic
- ✅ **Built-in admin panel**

## Phase 6: Deployment Updates

### Vercel Configuration
Update `vercel.json`:
```json
{
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Environment Variables in Vercel
Add these in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Files Created for Migration

1. **`client/src/lib/supabase.ts`** - Supabase client setup
2. **`client/src/hooks/useSupabaseAuth.ts`** - Supabase authentication
3. **`client/src/hooks/useTasksSupabase.ts`** - Supabase task operations
4. **`supabase-schema.sql`** - Database schema
5. **This migration guide**

## Migration Timeline

- **Week 1**: Set up Supabase project, test with development data
- **Week 2**: Implement hybrid system (Supabase + localStorage fallback)
- **Week 3**: Create migration UI for existing users
- **Week 4**: Full migration, remove localStorage dependencies

## Rollback Plan

Keep the current system intact during migration:
- Feature flags to switch between systems
- Ability to export Supabase data back to localStorage
- Gradual user migration (not all at once)

## Cost Considerations

**Supabase Pricing:**
- **Free tier**: 500MB database, 2GB bandwidth
- **Pro tier**: $25/month for production apps
- **Enterprise**: Custom pricing

**Current Costs:**
- Vercel serverless functions
- Neon PostgreSQL database

**Recommendation**: Start with Supabase free tier for testing, upgrade to Pro for production.