#!/usr/bin/env node

// Helper script to list your Stripe products and prices
import 'dotenv/config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

async function listProductsAndPrices() {
  try {
    console.log('🔍 Fetching your Stripe products and prices...\n');
    
    // Get products
    const products = await stripe.products.list({
      limit: 10,
      active: true,
    });

    for (const product of products.data) {
      console.log(`📦 Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Description: ${product.description || 'No description'}`);
      
      // Get prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      if (prices.data.length > 0) {
        console.log('   💰 Prices:');
        for (const price of prices.data) {
          const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
          const currency = price.currency.toUpperCase();
          const interval = price.recurring ? `/${price.recurring.interval}` : ' (one-time)';
          
          console.log(`      • ${currency} $${amount}${interval}`);
          console.log(`        Price ID: ${price.id} ← Use this in your code!`);
        }
      } else {
        console.log('   ⚠️  No prices found for this product');
      }
      console.log('');
    }

    console.log('✅ Copy the Price ID (starts with price_) and update your stripe.ts file!');
    
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    console.log('\n💡 Make sure your STRIPE_SECRET_KEY is set correctly in your .env file');
  }
}

listProductsAndPrices();