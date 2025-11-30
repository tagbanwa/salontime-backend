require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { name: 'Hair Salon', description: 'Hair cutting, styling, and coloring services', icon: 'scissors', color: '#FF5733' },
  { name: 'Barber', description: "Men's grooming and shaving services", icon: 'user', color: '#33FF57' },
  { name: 'Nails', description: 'Manicure and pedicure services', icon: 'hand', color: '#3357FF' },
  { name: 'Massage', description: 'Therapeutic and relaxing massage services', icon: 'heart', color: '#FF33A1' },
  { name: 'Skincare', description: 'Facials and skin treatments', icon: 'sparkles', color: '#33FFF5' }
];

async function seedCategories() {
  console.log('Seeding categories...');

  for (const cat of categories) {
    // Check if exists by name
    const { data: existing, error } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', cat.name)
      .maybeSingle();

    if (error) {
       console.error('Error checking category:', error);
       continue;
    }

    if (existing) {
      console.log(`Category ${cat.name} exists, updating...`);
      const { error: updateError } = await supabase
        .from('service_categories')
        .update(cat)
        .eq('id', existing.id);
      
      if (updateError) console.error(`Failed to update ${cat.name}:`, updateError);
    } else {
      console.log(`Creating category ${cat.name}...`);
      const { error: insertError } = await supabase
        .from('service_categories')
        .insert(cat);
      
      if (insertError) console.error(`Failed to insert ${cat.name}:`, insertError);
    }
  }
  console.log('Categories seeded.');
}

seedCategories();

