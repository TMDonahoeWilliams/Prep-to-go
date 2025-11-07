import type { VercelRequest, VercelResponse } from '@vercel/node';
import { paymentStorage } from '../../server/payments';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }

    // Handle both GET and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Get user email from query params or body
    const userEmail = req.method === 'GET' 
      ? (req.query.email as string)
      : req.body?.email;

    if (!userEmail) {
      console.log('Payment access check requested without email - returning no access');
      return res.status(200).json({
        hasPaidAccess: false,
        subscriptionStatus: 'inactive',
        planType: null,
        expiresAt: null,
        trialEndsAt: null,
        message: 'Email required to check payment status'
      });
    }

    console.log('Payment access check requested for:', userEmail);

    // Look up user by email
    const userResult = await paymentStorage.getUserByEmail(userEmail);
    
    if (!userResult || userResult.length === 0) {
      console.log('User not found:', userEmail);
      return res.status(200).json({
        hasPaidAccess: false,
        subscriptionStatus: 'inactive',
        planType: null,
        expiresAt: null,
        trialEndsAt: null,
        message: 'User not found'
      });
    }

    const user = userResult[0];
    
    // Check for active subscription
    const subscriptionResult = await paymentStorage.getUserSubscription(user.id);
    
    if (!subscriptionResult || subscriptionResult.length === 0) {
      console.log('No active subscription found for user:', userEmail);
      return res.status(200).json({
        hasPaidAccess: false,
        subscriptionStatus: 'inactive',
        planType: null,
        expiresAt: null,
        trialEndsAt: null,
        message: 'No active subscription'
      });
    }

    const subscription = subscriptionResult[0];
    
    // Note: planType is currently hardcoded as 'basic' for all subscriptions.
    // In the future, this should be stored in the subscription record or derived from payment metadata.
    const paymentStatus = {
      hasPaidAccess: true,
      subscriptionStatus: subscription.status,
      planType: 'basic',
      expiresAt: subscription.currentPeriodEnd,
      trialEndsAt: null,
      message: 'Active subscription found'
    };

    console.log('Returning payment status:', paymentStatus);

    return res.status(200).json(paymentStatus);

  } catch (error: any) {
    console.error('Payment check error:', error);
    
    // Ensure we always return JSON
    try {
      return res.status(500).json({ 
        message: error.message || 'Failed to check payment status',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } catch (jsonError) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('Internal server error');
    }
  }
}