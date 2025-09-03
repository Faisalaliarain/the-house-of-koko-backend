import { PlanType, PlanConfigKey } from '../enums/plans.enum';

export interface PlanConfig {
  [PlanConfigKey.STRIPE_PRODUCT_ID]: string;
  [PlanConfigKey.STRIPE_PRICE_ID]: string;
  [PlanConfigKey.PRICE]: number;
  [PlanConfigKey.CURRENCY]: string;
}

export interface PlanMetadata {
  name: string;
  description: string;
  features: string[];
}

export interface PlanSeedData {
  name: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
}

export interface PlanConfigService {
  getPlanConfig(planType: PlanType): PlanConfig;
  getPlanMetadata(planType: PlanType): PlanMetadata;
  getAllPlanSeedData(): PlanSeedData[];
  validatePlanConfig(): boolean;
}
