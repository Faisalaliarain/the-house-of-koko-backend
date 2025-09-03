import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PlanService } from '../shared/plan/plan.service';
import { PlanConfigService } from '../utils/services/plan-config.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const planService = app.get(PlanService);
  const planConfigService = new PlanConfigService();

  console.log('🚀 Starting comprehensive plan seeding...\n');

  // Validate configuration
  planConfigService.validatePlanConfig();
  
  // Get all plan data from enum configuration
  const plans = planConfigService.getAllPlanSeedData();
  
  console.log(`Starting plan seeding process for ${plans.length} plans...\n`);
  
  let seededCount = 0;
  let skippedCount = 0;
  
  for (const plan of plans) {
    try {
      // Check if plan already exists by name
      const existingPlan = await planService.findByName(plan.name);
      
      if (existingPlan) {
        console.log(`ℹ️ Plan "${plan.name}" already exists, skipping...`);
        skippedCount++;
        continue;
      }
      
      // Create new plan
      await planService.create(plan);
      
      console.log(`✅ Plan created: "${plan.name}"`);
      seededCount++;
      
    } catch (error) {
      console.error(`❌ Failed to seed plan "${plan.name}":`, error.message);
      throw error;
    }
  }
  
  console.log(`\n🎉 Plan seeding completed!`);
  console.log(`📊 Summary: Seeded: ${seededCount}, Skipped: ${skippedCount}`);
  
  console.log('\n📋 Plan Details:');
  plans.forEach(plan => {
    console.log(`• ${plan.name}: ${plan.price} ${plan.currency}`);
    console.log(`  Features: ${plan.features.join(', ')}`);
    console.log(`  Stripe Product ID: ${plan.stripeProductId}`);
    console.log(`  Stripe Price ID: ${plan.stripePriceId}\n`);
  });

  await app.close();
}

bootstrap().catch(error => {
  console.error('❌ Error seeding plans:', error);
  process.exit(1);
});
