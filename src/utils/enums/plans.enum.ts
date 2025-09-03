export enum PlanType {
  DIGITAL_MEMBER = 'DIGITAL_MEMBER',
  PHYSICAL_MEMBER = 'PHYSICAL_MEMBER',
  VIP_MEMBER = 'VIP_MEMBER',
}

export enum PlanConfigKey {
  STRIPE_PRODUCT_ID = 'STRIPE_PRODUCT_ID',
  STRIPE_PRICE_ID = 'STRIPE_PRICE_ID',
  PRICE = 'PRICE',
  CURRENCY = 'CURRENCY',
}

/**
 * Professional plan configuration with environment-based Stripe IDs
 * Usage: PLANS.DIGITAL_MEMBER.STRIPE_PRODUCT_ID
 */
export const PLANS = {
  [PlanType.DIGITAL_MEMBER]: {
    [PlanConfigKey.STRIPE_PRODUCT_ID]: process.env.DIGITAL_MEMBER_STRIPE_PRODUCT_ID || 'prod_SzD5OsVdalKnyu',
    [PlanConfigKey.STRIPE_PRICE_ID]: process.env.DIGITAL_MEMBER_STRIPE_PRICE_ID || 'price_1S3EfcEKIaH1izzGZYiN0pBS',
    [PlanConfigKey.PRICE]: parseFloat(process.env.DIGITAL_MEMBER_PRICE || '522.25'),
    [PlanConfigKey.CURRENCY]: process.env.DIGITAL_MEMBER_CURRENCY || 'GBP',
  },
  [PlanType.PHYSICAL_MEMBER]: {
    [PlanConfigKey.STRIPE_PRODUCT_ID]: process.env.PHYSICAL_MEMBER_STRIPE_PRODUCT_ID || 'prod_SzD4NuV0bRJXGJ',
    [PlanConfigKey.STRIPE_PRICE_ID]: process.env.PHYSICAL_MEMBER_STRIPE_PRICE_ID || 'price_1S3EedEKIaH1izzGbrWBghLU',
    [PlanConfigKey.PRICE]: parseFloat(process.env.PHYSICAL_MEMBER_PRICE || '745.32'),
    [PlanConfigKey.CURRENCY]: process.env.PHYSICAL_MEMBER_CURRENCY || 'GBP',
  },
  [PlanType.VIP_MEMBER]: {
    [PlanConfigKey.STRIPE_PRODUCT_ID]: process.env.VIP_MEMBER_STRIPE_PRODUCT_ID || 'prod_SzD48Td9LR0Cpm',
    [PlanConfigKey.STRIPE_PRICE_ID]: process.env.VIP_MEMBER_STRIPE_PRICE_ID || 'price_1S3EdvEKIaH1izzGcbtH7NdZ',
    [PlanConfigKey.PRICE]: parseFloat(process.env.VIP_MEMBER_PRICE || '895.28'),
    [PlanConfigKey.CURRENCY]: process.env.VIP_MEMBER_CURRENCY || 'GBP',
  },
} as const;

/**
 * Plan metadata configuration
 */
export const PLAN_METADATA = {
  [PlanType.DIGITAL_MEMBER]: {
    name: 'Digital Member',
    description: 'Access to digital streams, online events, and exclusive content.',
    features: [
      'Digital event access',
      'Livestreams',
      'Online concerts',
    ],
  },
  [PlanType.PHYSICAL_MEMBER]: {
    name: 'Physical Member',
    description: 'Hybrid membership with access to select physical events and content.',
    features: [
      'Physical event access (general entry)',
      'Digital event access',
      'Livestreams',
    ],
  },
  [PlanType.VIP_MEMBER]: {
    name: 'VIP Member',
    description: 'All-access membership with premium perks and exclusive offers.',
    features: [
      'All physical event access',
      'Table bookings',
      'Exclusive offers',
      'Digital event access',
      'Livestreams',
    ],
  },
} as const;
