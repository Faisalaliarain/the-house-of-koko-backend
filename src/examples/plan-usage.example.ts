/**
 * Example usage of the Plan Configuration System
 * This file demonstrates how to use the new enum-based plan configuration
 */

import { PLANS, PlanType, PlanConfigKey, PLAN_METADATA } from '../utils/enums/plans.enum';
import { PlanConfigService } from '../utils/services/plan-config.service';

// Example 1: Direct enum usage
export function exampleDirectEnumUsage() {
  console.log('=== Direct Enum Usage ===');
  
  // Access VIP Member configuration
  const vipConfig = PLANS[PlanType.VIP_MEMBER];
  console.log('VIP Member Stripe Product ID:', vipConfig[PlanConfigKey.STRIPE_PRODUCT_ID]);
  console.log('VIP Member Stripe Price ID:', vipConfig[PlanConfigKey.STRIPE_PRICE_ID]);
  console.log('VIP Member Price:', vipConfig[PlanConfigKey.PRICE]);
  console.log('VIP Member Currency:', vipConfig[PlanConfigKey.CURRENCY]);
  
  // Access Digital Member configuration
  const digitalConfig = PLANS[PlanType.DIGITAL_MEMBER];
  console.log('Digital Member Price:', digitalConfig[PlanConfigKey.PRICE]);
}

// Example 2: Using the Plan Config Service
export function exampleServiceUsage() {
  console.log('=== Service Usage ===');
  
  const planConfigService = new PlanConfigService();
  
  // Get configuration for a specific plan
  const physicalConfig = planConfigService.getPlanConfig(PlanType.PHYSICAL_MEMBER);
  console.log('Physical Member Config:', physicalConfig);
  
  // Get metadata for a plan
  const vipMetadata = planConfigService.getPlanMetadata(PlanType.VIP_MEMBER);
  console.log('VIP Member Metadata:', vipMetadata);
  
  // Get all plan seed data
  const allPlans = planConfigService.getAllPlanSeedData();
  console.log('All Plans for Seeding:', allPlans);
  
  // Validate configuration
  const isValid = planConfigService.validatePlanConfig();
  console.log('Configuration is valid:', isValid);
}

// Example 3: Environment variable usage
export function exampleEnvironmentUsage() {
  console.log('=== Environment Variable Usage ===');
  
  // The system automatically reads from environment variables
  // DIGITAL_MEMBER_STRIPE_PRODUCT_ID, DIGITAL_MEMBER_STRIPE_PRICE_ID, etc.
  
  const digitalConfig = PLANS[PlanType.DIGITAL_MEMBER];
  
  // Check if using default values (indicates missing env vars)
  const isUsingDefaults = digitalConfig[PlanConfigKey.STRIPE_PRODUCT_ID].startsWith('prod_SzD');
  
  if (isUsingDefaults) {
    console.log('⚠️  Using default Stripe IDs. Please set environment variables:');
    console.log('   DIGITAL_MEMBER_STRIPE_PRODUCT_ID');
    console.log('   DIGITAL_MEMBER_STRIPE_PRICE_ID');
    console.log('   DIGITAL_MEMBER_PRICE');
    console.log('   DIGITAL_MEMBER_CURRENCY');
  } else {
    console.log('✅ Using environment-based Stripe IDs');
  }
}

// Example 4: Type-safe plan iteration
export function exampleTypeSafeIteration() {
  console.log('=== Type-Safe Iteration ===');
  
  // Iterate through all plan types
  Object.values(PlanType).forEach(planType => {
    const config = PLANS[planType];
    const metadata = PLAN_METADATA[planType];
    
    console.log(`\n${planType}:`);
    console.log(`  Name: ${metadata.name}`);
    console.log(`  Price: ${config[PlanConfigKey.PRICE]} ${config[PlanConfigKey.CURRENCY]}`);
    console.log(`  Stripe Product ID: ${config[PlanConfigKey.STRIPE_PRODUCT_ID]}`);
    console.log(`  Features: ${metadata.features.join(', ')}`);
  });
}

// Example 5: Integration with existing code
export function exampleIntegration() {
  console.log('=== Integration Example ===');
  
  // This is how you would use it in a service or controller
  const planConfigService = new PlanConfigService();
  
  // Get plan for processing a payment
  function processPayment(planType: PlanType, amount: number) {
    const config = planConfigService.getPlanConfig(planType);
    const metadata = planConfigService.getPlanMetadata(planType);
    
    console.log(`Processing payment for ${metadata.name}:`);
    console.log(`  Amount: ${amount}`);
    console.log(`  Expected Price: ${config[PlanConfigKey.PRICE]} ${config[PlanConfigKey.CURRENCY]}`);
    console.log(`  Stripe Product ID: ${config[PlanConfigKey.STRIPE_PRODUCT_ID]}`);
    console.log(`  Stripe Price ID: ${config[PlanConfigKey.STRIPE_PRICE_ID]}`);
    
    // Validate amount matches expected price
    if (amount !== config[PlanConfigKey.PRICE]) {
      throw new Error(`Amount mismatch. Expected ${config[PlanConfigKey.PRICE]}, got ${amount}`);
    }
    
    return {
      success: true,
      planType,
      stripeProductId: config[PlanConfigKey.STRIPE_PRODUCT_ID],
      stripePriceId: config[PlanConfigKey.STRIPE_PRICE_ID],
    };
  }
  
  // Example usage
  try {
    const result = processPayment(PlanType.VIP_MEMBER, 895.28);
    console.log('Payment processed:', result);
  } catch (error) {
    console.error('Payment failed:', error.message);
  }
}

// Run all examples
if (require.main === module) {
  exampleDirectEnumUsage();
  exampleServiceUsage();
  exampleEnvironmentUsage();
  exampleTypeSafeIteration();
  exampleIntegration();
}
