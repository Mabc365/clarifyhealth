// Frontend client for the self-hosted Supabase project (auth, database, storage).
// URL + anon key are public values safe to ship in the browser bundle.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = 'https://tdpoayxdmwjwoooybpxn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcG9heXhkbXdqd29vb3licHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDY5MzYsImV4cCI6MjA5NDYyMjkzNn0.wi1bfhQn4z9tmsgehpBdTRqOBeWD00e-jGEIG-1yMBE';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
