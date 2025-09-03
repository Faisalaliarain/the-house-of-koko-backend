# Plan Configuration System

This document describes the professional plan configuration system implemented for the KOKO backend application.

## Overview

The plan configuration system provides a centralized, environment-based approach to managing subscription plans with Stripe integration. It uses TypeScript enums and interfaces to ensure type safety and maintainability. The system is built with Mongoose for MongoDB integration and follows NestJS best practices.

## Features

- ✅ Environment-based Stripe product and price IDs
- ✅ Type-safe plan configuration with TypeScript enums
- ✅ Automatic plan seeding on application startup
- ✅ Validation of environment variables
- ✅ Professional logging and error handling
- ✅ Fallback to default values if environment variables are missing

## Usage

### Basic Usage

```typescript
import { PLANS, PlanType, PlanConfigKey } from './utils/enums/plans.enum';

// Access plan configuration
const digitalMemberConfig = PLANS[PlanType.DIGITAL_MEMBER];
const stripeProductId = digitalMemberConfig[PlanConfigKey.STRIPE_PRODUCT_ID];
const stripePriceId = digitalMemberConfig[PlanConfigKey.STRIPE_PRICE_ID];
const price = digitalMemberConfig[PlanConfigKey.PRICE];
const currency = digitalMemberConfig[PlanConfigKey.CURRENCY];
```

### Using the Plan Config Service

```typescript
import { PlanConfigService } from './utils/services/plan-config.service';

const planConfigService = new PlanConfigService();

// Get configuration for a specific plan
const config = planConfigService.getPlanConfig(PlanType.VIP_MEMBER);

// Get all plan seed data
const allPlans = planConfigService.getAllPlanSeedData();

// Validate configuration
const isValid = planConfigService.validatePlanConfig();
```

### Using the Plan Service (Database Operations)

```typescript
import { PlanService } from './shared/plan/plan.service';

// In a service or controller
constructor(private readonly planService: PlanService) {}

// Find a plan by name
const plan = await this.planService.findByName('VIP Member');

// Get all active plans
const allPlans = await this.planService.findAll();

// Create a new plan
const newPlan = await this.planService.create(planData);
```

## Environment Variables

The system expects the following environment variables:

### Digital Member Plan
```env
DIGITAL_MEMBER_STRIPE_PRODUCT_ID=prod_your_digital_member_product_id
DIGITAL_MEMBER_STRIPE_PRICE_ID=price_your_digital_member_price_id
DIGITAL_MEMBER_PRICE=522.25
DIGITAL_MEMBER_CURRENCY=GBP
```

### Physical Member Plan
```env
PHYSICAL_MEMBER_STRIPE_PRODUCT_ID=prod_your_physical_member_product_id
PHYSICAL_MEMBER_STRIPE_PRICE_ID=price_your_physical_member_price_id
PHYSICAL_MEMBER_PRICE=745.32
PHYSICAL_MEMBER_CURRENCY=GBP
```

### VIP Member Plan
```env
VIP_MEMBER_STRIPE_PRODUCT_ID=prod_your_vip_member_product_id
VIP_MEMBER_STRIPE_PRICE_ID=price_your_vip_member_price_id
VIP_MEMBER_PRICE=895.28
VIP_MEMBER_CURRENCY=GBP
```

## Plan Types

The system supports three plan types:

1. **DIGITAL_MEMBER** - Access to digital streams, online events, and exclusive content
2. **PHYSICAL_MEMBER** - Hybrid membership with access to select physical events and content
3. **VIP_MEMBER** - All-access membership with premium perks and exclusive offers

## Automatic Seeding

Plans are automatically seeded on application startup if they don't exist in the database. The seeding process:

1. Checks if any plans exist in the database
2. If no plans exist, seeds all plans from the enum configuration
3. If plans exist, skips seeding
4. Logs the seeding process for monitoring

## File Structure

```
src/
├── entities/
│   └── plan.entity.ts             # Mongoose Plan schema
├── shared/
│   └── plan/
│       ├── plan.service.ts        # Plan service for database operations
│       └── plan.module.ts         # Plan module
├── utils/
│   ├── enums/
│   │   └── plans.enum.ts          # Plan enums and configuration
│   ├── interfaces/
│   │   └── plan-config.interface.ts # Plan configuration interfaces
│   └── services/
│       └── plan-config.service.ts   # Plan configuration service
├── seed/
│   └── seed-plans.ts              # Plan seeding functions
├── scripts/
│   └── seed-plans-manual.ts       # Manual plan seeding script
└── main.ts                        # Application startup with seeding
```

## Error Handling

The system includes comprehensive error handling:

- Missing environment variables are logged as warnings
- Default values are used if environment variables are missing
- Seeding failures don't prevent application startup
- All operations are logged for debugging

## Best Practices

1. **Environment Variables**: Always set the required environment variables in production
2. **Default Values**: The system provides sensible defaults for development
3. **Validation**: Use the validation methods to check configuration
4. **Logging**: Monitor logs for configuration warnings
5. **Type Safety**: Use the provided enums and interfaces for type safety

## Development vs Production

### Development
- Uses default Stripe IDs from the enum configuration
- Logs warnings about missing environment variables
- Allows application to start even with missing configuration

### Production
- Requires all environment variables to be set
- Validates configuration on startup
- Uses production Stripe product and price IDs

## Adding New Plans

To add a new plan:

1. Add the plan type to `PlanType` enum
2. Add configuration to `PLANS` object
3. Add metadata to `PLAN_METADATA` object
4. Add environment variables to `.env.example`
5. Update this documentation

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Check logs for warnings about missing variables
2. **Seeding Failures**: Check database connection and plan entity configuration
3. **Type Errors**: Ensure you're using the correct enum values and interfaces

### Logs to Monitor

- `PlanSeeder` logs for seeding operations
- `PlanConfigService` logs for configuration validation
- `Bootstrap` logs for startup process
