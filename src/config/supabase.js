const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "WARNING: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env file"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
