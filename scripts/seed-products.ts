import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  console.log('Creating Premium Penguin Plan product...');
  
  const stripe = await getUncachableStripeClient();

  // Check if product already exists
  const existingProducts = await stripe.products.search({ 
    query: "name:'Premium Penguin Plan'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('Premium Penguin Plan already exists:', existingProducts.data[0].id);
    return;
  }

  // Create the Premium Penguin Plan product
  const product = await stripe.products.create({
    name: 'Premium Penguin Plan',
    description: 'Unlock exclusive Pipo themes, unlimited cloud storage for journals, priority support, and advanced AI features.',
    metadata: {
      category: 'subscription',
      tier: 'premium',
    },
  });

  console.log('Created product:', product.id);

  // Create monthly price
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 499, // $4.99
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'monthly',
    },
  });

  console.log('Created monthly price:', monthlyPrice.id, '- $4.99/month');

  // Create yearly price (with discount)
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 3999, // $39.99/year (save ~33%)
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: {
      plan_type: 'yearly',
      savings: '33%',
    },
  });

  console.log('Created yearly price:', yearlyPrice.id, '- $39.99/year');

  console.log('\nProducts and prices created successfully!');
  console.log('The webhook will sync them to the database automatically.');
}

createProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error creating products:', error);
    process.exit(1);
  });
