import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase';

export function DiagnosticPanel() {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  useEffect(() => {
    const results: string[] = [];
    
    // Check environment variables
    results.push('🔍 Environment Variable Check:');
    results.push(`VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL || 'Not set'}`);
    results.push(`VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`);
    results.push(`SUPABASE_KEY: ${import.meta.env.SUPABASE_KEY ? 'Set' : 'Not set'}`);
    results.push(`Supabase Configured: ${isSupabaseConfigured() ? '✅ Yes' : '❌ No'}`);
    
    // Check localStorage
    results.push('');
    results.push('📦 LocalStorage Check:');
    try {
      const user = localStorage.getItem('user');
      results.push(`User in localStorage: ${user ? '✅ Found' : '❌ Not found'}`);
      if (user) {
        const userData = JSON.parse(user);
        results.push(`User ID: ${userData.id || 'No ID'}`);
        results.push(`User Email: ${userData.email || 'No email'}`);
        results.push(`User Role: ${userData.role || 'No role'}`);
      }
    } catch (error) {
      results.push(`❌ Error reading localStorage: ${error}`);
    }
    
    // Check payment status
    results.push('');
    results.push('💳 Payment Status Check:');
    try {
      const paymentStatus = localStorage.getItem('paymentStatus');
      results.push(`Payment status in localStorage: ${paymentStatus ? '✅ Found' : '❌ Not found'}`);
      if (paymentStatus) {
        const status = JSON.parse(paymentStatus);
        results.push(`Has paid access: ${status.hasPaidAccess ? '✅ Yes' : '❌ No'}`);
      }
    } catch (error) {
      results.push(`❌ Error reading payment status: ${error}`);
    }
    
    // Check for common issues
    results.push('');
    results.push('🚨 Common Issues:');
    
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.SUPABASE_KEY) {
      results.push('❌ Missing Supabase environment variables');
    }
    
    results.push('✅ Diagnostic complete');
    
    setDiagnostics(results);
  }, []);

  const handleResetLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🩺 Application Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="space-y-1 text-sm font-mono">
            {diagnostics.map((result, index) => (
              <div 
                key={index} 
                className={
                  result.includes('❌') 
                    ? 'text-red-600 dark:text-red-400' 
                    : result.includes('✅') 
                      ? 'text-green-600 dark:text-green-400'
                      : result.includes('🔍') || result.includes('📦') || result.includes('💳') || result.includes('🚨')
                        ? 'font-bold text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300'
                }
              >
                {result}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload Page
          </Button>
          <Button onClick={handleResetLocalStorage} variant="destructive">
            Reset All Data & Reload
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>If you see a blank page:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Check browser console for JavaScript errors</li>
            <li>Ensure Supabase environment variables are set in production</li>
            <li>Try resetting localStorage data</li>
            <li>Check network requests in browser dev tools</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}