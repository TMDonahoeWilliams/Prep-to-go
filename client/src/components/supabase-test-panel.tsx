import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testSupabaseConnection, testSupabaseAuth } from '@/lib/supabase-test';

export function SupabaseTestPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const results: string[] = [];
    
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      results.push(args.join(' '));
      originalLog(...args);
    };
    
    console.error = (...args) => {
      results.push(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };
    
    try {
      await testSupabaseConnection();
      await testSupabaseAuth();
    } catch (error) {
      results.push(`UNEXPECTED ERROR: ${error}`);
    }
    
    // Restore console
    console.log = originalLog;
    console.error = originalError;
    
    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing Connection...' : 'Test Supabase Connection'}
        </Button>
        
        {testResults.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Test Results:</h3>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={
                    result.includes('ERROR') 
                      ? 'text-red-600 dark:text-red-400' 
                      : result.includes('✅') 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-300'
                  }
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Verifies connection to your Supabase database</li>
            <li>Checks if categories table exists and has data</li>
            <li>Lists all category UUIDs from the database</li>
            <li>Tests authentication status</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}