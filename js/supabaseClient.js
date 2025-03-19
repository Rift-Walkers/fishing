const SUPABASE_URL = "https://taszlukbssncvjcvmfgp.supabase.co";
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhc3psdWtic3NuY3ZqY3ZtZmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNjYxMjAsImV4cCI6MjA1Nzk0MjEyMH0.N-PCtWBkYBPsPxpmhcAhXXf3EENkTmWFxddlPn83hjw";

export const supabaseClient = supabase.createClient(
	SUPABASE_URL,
	SUPABASE_ANON_KEY
);
