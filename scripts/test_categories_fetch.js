require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for testing first

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log('Testing fetch categories with Service Role (Admin)...');
  const { data, error } = await supabase
    .from('service_categories')
    .select('*');

  if (error) {
    console.error('Service Role Error:', error);
  } else {
    console.log(`Service Role Success: Found ${data.length} categories`);
    if (data.length > 0) {
      console.log('Sample:', data[0]);
    }
  }

  // Now try with a public/anon key if available, or just simulate what the controller does
  // The controller uses `supabaseService.supabase` which is usually the admin client OR `getAuthenticatedClient`.
  // In `ServiceController.js`:
  // const { data: categories, error } = await supabaseService.supabase...
  // Let's check what supabaseService.supabase is.
}

testFetch();

