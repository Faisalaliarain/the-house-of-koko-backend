import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PlanService } from './shared/plan/plan.service';
import { CategoryService } from './shared/category/category.service';
import { EventService } from './shared/event/event.service';
import { CATEGORY_SEED_DATA } from './utils/constants/category.seed';
import { EVENT_SEED_DATA } from './utils/constants/event.seed';
import { PlanConfigService } from './utils/services/plan-config.service';
import * as express from 'express';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  try {
    const title = 'The project-name Api Documentation';
    const description = 'The PWA API documentation';
    const app = await NestFactory.create(AppModule);
    
    // Configure raw body for webhooks
    app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }));
    
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.enableCors();
    app.setGlobalPrefix('api');
    
    const config = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion('1.0')
      .addBearerAuth()
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    // Seed plans on application startup if they don't exist
    await seedPlansOnStartup(app);
    // Seed categories on application startup if they don't exist
    await seedCategoriesOnStartup(app);
    // Seed events on application startup if they don't exist
    await seedEventsOnStartup(app);

    const port = process.env.PORT || 5000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error('Failed to start application:', error.message);
    process.exit(1);
  }
}

/**
 * Seed plans on application startup if they don't exist
 */
async function seedPlansOnStartup(app: any): Promise<void> {
  try {
    logger.log('Checking if plans need to be seeded...');
    
    const planService = app.get(PlanService);
    const planConfigService = new PlanConfigService();
    
    const plansExist = await planService.hasPlans();
    
    if (!plansExist) {
      logger.log('No plans found in database. Starting plan seeding...');
      
      // Validate configuration
      planConfigService.validatePlanConfig();
      
      // Get all plan data from enum configuration
      const plans = planConfigService.getAllPlanSeedData();
      
      let seededCount = 0;
      
      for (const plan of plans) {
        try {
          // Check if plan already exists by name
          const existingPlan = await planService.findByName(plan.name);
          
          if (!existingPlan) {
            // Create new plan
            await planService.create(plan);
            logger.log(`Successfully seeded plan: "${plan.name}"`);
            seededCount++;
          }
        } catch (error) {
          logger.error(`Failed to seed plan "${plan.name}":`, error.message);
        }
      }
      
      logger.log(`Plan seeding completed. Seeded: ${seededCount} plans`);
    } else {
      logger.log('Plans already exist in database. Skipping seeding.');
    }
  } catch (error) {
    logger.error('Failed to seed plans on startup:', error.message);
  }
}

/**
 * Seed categories on application startup if they don't exist
 */
async function seedCategoriesOnStartup(app: any): Promise<void> {
  try {
    logger.log('Checking if categories need to be seeded...');
    const categoryService = app.get(CategoryService);
    const has = await categoryService.hasCategories();
    if (!has) {
      logger.log('No categories found. Seeding defaults...');
      let seeded = 0;
      for (const cat of CATEGORY_SEED_DATA) {
        try {
          const existing = await categoryService.findByTitle(cat.title);
          if (!existing) {
            await categoryService.create(cat);
            seeded++;
          }
        } catch (e) {
          logger.error(`Failed to seed category "${cat.title}": ${e?.message}`);
        }
      }
      logger.log(`Category seeding completed. Seeded: ${seeded}`);
    } else {
      logger.log('Categories already exist. Skipping seeding.');
    }
  } catch (error) {
    logger.error('Failed to seed categories on startup:', error.message);
  }
}

/**
 * Seed events on application startup if they don't exist
 */
async function seedEventsOnStartup(app: any): Promise<void> {
  try {
    logger.log('Checking if events need to be seeded...');
    const eventService = app.get(EventService);
    const categoryService = app.get(CategoryService);
    const has = await eventService.hasEvents();
    if (!has) {
      logger.log('No events found. Seeding defaults...');
      let seeded = 0;
      for (const e of EVENT_SEED_DATA) {
        try {
          const cat = await categoryService.findBySlug(e.categorySlug);
          if (!cat) {
            logger.error(`Skipping event "${e.title}" — missing category slug: ${e.categorySlug}`);
            continue;
          }
          const exists = await eventService.findByTitle(e.title);
          if (!exists) {
            await eventService.create({ ...(e as any), category: cat._id });
            seeded++;
          }
        } catch (err: any) {
          logger.error(`Failed to seed event "${e.title}": ${err?.message}`);
        }
      }
      logger.log(`Event seeding completed. Seeded: ${seeded}`);
    } else {
      logger.log('Events already exist. Skipping event seeding.');
    }
  } catch (error: any) {
    logger.error('Failed to seed events on startup:', error.message);
  }
}

bootstrap();
