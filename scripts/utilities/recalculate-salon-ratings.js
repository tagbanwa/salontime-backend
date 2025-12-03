/**
 * Script to recalculate salon ratings based on actual reviews
 * 
 * This fixes any discrepancy between the cached rating_average/rating_count
 * in the salons table and the actual reviews in the reviews table.
 * 
 * Run with: node scripts/utilities/recalculate-salon-ratings.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recalculateSalonRatings() {
  console.log('🔄 Starting salon ratings recalculation...\n');

  try {
    // Get all salons
    const { data: salons, error: salonsError } = await supabase
      .from('salons')
      .select('id, business_name, rating_average, rating_count');

    if (salonsError) {
      throw new Error(`Failed to fetch salons: ${salonsError.message}`);
    }

    console.log(`📋 Found ${salons.length} salons to process\n`);

    let updated = 0;
    let unchanged = 0;

    for (const salon of salons) {
      // Get all visible reviews for this salon
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('salon_id', salon.id)
        .eq('is_visible', true);

      if (reviewsError) {
        console.error(`❌ Error fetching reviews for ${salon.business_name}: ${reviewsError.message}`);
        continue;
      }

      // Calculate new rating
      let newRatingAverage = 0;
      let newRatingCount = reviews?.length || 0;

      if (newRatingCount > 0) {
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        newRatingAverage = parseFloat((sum / newRatingCount).toFixed(2));
      }

      // Check if update is needed
      const currentAvg = parseFloat(salon.rating_average || 0);
      const currentCount = parseInt(salon.rating_count || 0);

      if (currentAvg !== newRatingAverage || currentCount !== newRatingCount) {
        // Update salon
        const { error: updateError } = await supabase
          .from('salons')
          .update({
            rating_average: newRatingAverage,
            rating_count: newRatingCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', salon.id);

        if (updateError) {
          console.error(`❌ Error updating ${salon.business_name}: ${updateError.message}`);
        } else {
          console.log(`✅ ${salon.business_name}: ${currentAvg} (${currentCount}) → ${newRatingAverage} (${newRatingCount})`);
          updated++;
        }
      } else {
        unchanged++;
      }
    }

    console.log('\n========================================');
    console.log(`✅ Updated: ${updated} salons`);
    console.log(`⏭️  Unchanged: ${unchanged} salons`);
    console.log('========================================\n');
    console.log('🎉 Salon ratings recalculation complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

recalculateSalonRatings();

