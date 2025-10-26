import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Simple Supabase connection test
export async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase is not configured. Please set VITE_SUPABASE_ANON_KEY environment variable.');
      return false;
    }
    
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Sample category data:', data);
    
    // Test 2: Check if our categories exist with correct UUIDs
    const { data: allCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .order('sort_order');
    
    if (categoriesError) {
      console.error('❌ Failed to fetch categories:', categoriesError.message);
      return false;
    }
    
    console.log('📋 All categories in database:');
    allCategories?.forEach(cat => {
      console.log(`   ${cat.name}: ${cat.id}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
}

// Test authentication capabilities
export async function testSupabaseAuth() {
  try {
    console.log('🔄 Testing Supabase auth...');
    
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase is not configured for auth testing.');
      return false;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ User is authenticated:', session.user.email);
    } else {
      console.log('ℹ️ No active session (user not logged in)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
}