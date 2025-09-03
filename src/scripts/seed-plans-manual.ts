#!/usr/bin/env ts-node

/**
 * Manual Plan Seeding Script
 * 
 * This script can be run manually to seed plans into the database.
 * It's useful for development, testing, or when you need to reset plan data.
 * 
 * Usage:
 *   npm run seed:plans
 *   or
 *   ts-node src/scripts/seed-plans-manual.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PlanService } from '../shared/plan/plan.service';
import { PlanConfigService } from '../utils/services/plan-config.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('ManualPlanSeeder');

async function main() {
  try {
    logger.log('🚀 Starting manual plan seeding...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const planService = app.get(PlanService);
    const planConfigService = new PlanConfigService();
    
    // Check if plans already exist
    const plansExist = await planService.hasPlans();
    
    if (plansExist) {
      logger.warn('⚠️  Plans already exist in the database.');
      logger.warn('This script will skip existing plans and only add new ones.');
      logger.warn('If you want to reset all plans, please clear the database first.');
    }
    
    // Validate configuration
    planConfigService.validatePlanConfig();
    
    // Get all plan data from enum configuration
    const plans = planConfigService.getAllPlanSeedData();
    
    logger.log(`Starting plan seeding process for ${plans.length} plans...`);
    
    let seededCount = 0;
    let skippedCount = 0;
    
    for (const plan of plans) {
      try {
        // Check if plan already exists by name
        const existingPlan = await planService.findByName(plan.name);
        
        if (existingPlan) {
          logger.log(`Plan "${plan.name}" already exists, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Create new plan
        await planService.create(plan);
        
        logger.log(`Successfully seeded plan: "${plan.name}"`);
        seededCount++;
        
      } catch (error) {
        logger.error(`Failed to seed plan "${plan.name}":`, error.message);
        throw error;
      }
    }
    
    logger.log(`Plan seeding completed. Seeded: ${seededCount}, Skipped: ${skippedCount}`);
    
    await app.close();
    logger.log('✅ Manual plan seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Manual plan seeding failed:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the main function
main();
