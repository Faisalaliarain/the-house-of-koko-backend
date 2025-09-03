import { Injectable, Logger } from '@nestjs/common';
import { PlanType, PlanConfigKey, PLANS, PLAN_METADATA } from '../enums/plans.enum';
import { PlanConfig, PlanMetadata, PlanSeedData, PlanConfigService as IPlanConfigService } from '../interfaces/plan-config.interface';

@Injectable()
export class PlanConfigService implements IPlanConfigService {
  private readonly logger = new Logger(PlanConfigService.name);

  /**
   * Get configuration for a specific plan type
   */
  getPlanConfig(planType: PlanType): PlanConfig {
    const config = PLANS[planType];
    if (!config) {
      throw new Error(`Plan configuration not found for type: ${planType}`);
    }
    return config;
  }

  /**
   * Get metadata for a specific plan type
   */
  getPlanMetadata(planType: PlanType): any {
    const metadata = PLAN_METADATA[planType];
    if (!metadata) {
      throw new Error(`Plan metadata not found for type: ${planType}`);
    }
    return metadata;
  }

  /**
   * Get all plan seed data for database seeding
   */
  getAllPlanSeedData(): PlanSeedData[] {
    return Object.values(PlanType).map(planType => {
      const config = this.getPlanConfig(planType);
      const metadata = this.getPlanMetadata(planType);
      
      return {
        name: metadata.name,
        description: metadata.description,
        features: metadata.features,
        price: config[PlanConfigKey.PRICE],
        currency: config[PlanConfigKey.CURRENCY],
        stripeProductId: config[PlanConfigKey.STRIPE_PRODUCT_ID],
        stripePriceId: config[PlanConfigKey.STRIPE_PRICE_ID],
        isActive: true,
      };
    });
  }

  /**
   * Validate that all required environment variables are set
   */
  validatePlanConfig(): boolean {
    const requiredEnvVars = [
      'DIGITAL_MEMBER_STRIPE_PRODUCT_ID',
      'DIGITAL_MEMBER_STRIPE_PRICE_ID',
      'PHYSICAL_MEMBER_STRIPE_PRODUCT_ID',
      'PHYSICAL_MEMBER_STRIPE_PRICE_ID',
      'VIP_MEMBER_STRIPE_PRODUCT_ID',
      'VIP_MEMBER_STRIPE_PRICE_ID',
    ];

    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingVars.length > 0) {
      this.logger.warn(`Missing environment variables for plan configuration: ${missingVars.join(', ')}`);
      this.logger.warn('Using default values from enum configuration');
      return false;
    }

    this.logger.log('All plan configuration environment variables are set');
    return true;
  }

  /**
   * Get plan configuration for a specific plan type with validation
   */
  getValidatedPlanConfig(planType: PlanType): PlanConfig {
    const config = this.getPlanConfig(planType);
    
    // Validate that Stripe IDs are not using default values
    const isUsingDefaults = config[PlanConfigKey.STRIPE_PRODUCT_ID].startsWith('prod_SzD') ||
                           config[PlanConfigKey.STRIPE_PRICE_ID].startsWith('price_1S3E');
    
    if (isUsingDefaults) {
      this.logger.warn(`Using default Stripe IDs for ${planType}. Please set environment variables.`);
    }

    return config;
  }
}
