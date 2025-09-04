import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PlanService } from './shared/plan/plan.service';
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

bootstrap();
