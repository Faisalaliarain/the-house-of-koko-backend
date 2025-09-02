import { getRepository } from 'typeorm';
import { Plan } from '../entities/plan.entity';

export async function seedPlans() {
  const planRepo = getRepository(Plan);
  const plans = [
    {
      name: 'Digital',
      description: 'Access to digital streams, online events, and content.',
      features: [
        'Digital event access',
        'Livestreams',
        'Online concerts',
      ],
      price: 10.00,
      currency: 'GBP',
      stripeProductId: 'prod_xxx', // Replace with actual Stripe product ID
      stripePriceId: 'price_xxx', // Replace with actual Stripe price ID
      isActive: true,
    },
    {
      name: 'VIP',
      description: 'All-access hybrid membership and exclusive offers.',
      features: [
        'Physical event access',
        'Table bookings',
        'Exclusive offers',
        'Digital event access',
      ],
      price: 50.00,
      currency: 'GBP',
      stripeProductId: 'prod_yyy', // Replace with actual Stripe product ID
      stripePriceId: 'price_yyy', // Replace with actual Stripe price ID
      isActive: true,
    },
    // Add more plans as needed
  ];

  for (const plan of plans) {
    const exists = await planRepo.findOne({ where: { name: plan.name } });
    if (!exists) {
      await planRepo.save(plan);
    }
  }
}
