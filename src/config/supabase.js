const { createClient } = require("@supabase/supabase-js");

function createSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );
}

module.exports = createSupabase;
