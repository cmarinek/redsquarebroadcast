import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  message: string;
}

export const BuildSystemTest = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runSystemTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    try {
      // Test 1: Database schema
      testResults.push({ name: "Database Schema", status: 'pending', message: "Checking app_builds table..." });
      setResults([...testResults]);
      
      try {
        const { data, error } = await supabase.from('app_builds').select('id').limit(1);
        if (error) throw error;
        testResults[0] = { name: "Database Schema", status: 'pass', message: "app_builds table exists and accessible" };
      } catch (error) {
        testResults[0] = { name: "Database Schema", status: 'fail', message: `Database error: ${error.message}` };
      }
      setResults([...testResults]);

      // Test 2: Admin permissions
      testResults.push({ name: "Admin Permissions", status: 'pending', message: "Checking admin role..." });
      setResults([...testResults]);
      
      try {
        const { data, error } = await supabase.rpc('get_my_claim', { claim: 'is_admin' });
        if (error) throw error;
        if (data?.is_admin) {
          testResults[1] = { name: "Admin Permissions", status: 'pass', message: "User has admin access" };
        } else {
          testResults[1] = { name: "Admin Permissions", status: 'fail', message: "User does not have admin permissions" };
        }
      } catch (error) {
        testResults[1] = { name: "Admin Permissions", status: 'fail', message: `Permission check failed: ${error.message}` };
      }
      setResults([...testResults]);

      // Test 3: Storage buckets
      testResults.push({ name: "Storage Buckets", status: 'pending', message: "Checking storage configuration..." });
      setResults([...testResults]);
      
      try {
        // Test uploading a small file to each bucket
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const buckets = ['apk-files', 'ios-files', 'app_artifacts'];
        const bucketResults = [];
        
        for (const bucket of buckets) {
          try {
            const { error } = await supabase.storage
              .from(bucket)
              .upload(`test-${Date.now()}.txt`, testFile, { upsert: true });
            if (error) throw error;
            bucketResults.push(`${bucket}: ✓`);
          } catch (error) {
            bucketResults.push(`${bucket}: ✗ (${error.message})`);
          }
        }
        
        const failedBuckets = bucketResults.filter(r => r.includes('✗'));
        if (failedBuckets.length === 0) {
          testResults[2] = { name: "Storage Buckets", status: 'pass', message: "All storage buckets accessible" };
        } else {
          testResults[2] = { name: "Storage Buckets", status: 'warning', message: `Some buckets failed: ${failedBuckets.join(', ')}` };
        }
      } catch (error) {
        testResults[2] = { name: "Storage Buckets", status: 'fail', message: `Storage test failed: ${error.message}` };
      }
      setResults([...testResults]);

      // Test 4: Edge function connectivity
      testResults.push({ name: "Edge Function", status: 'pending', message: "Testing trigger-app-build function..." });
      setResults([...testResults]);
      
      try {
        // Test with invalid app_type to check function responds correctly
        const { data, error } = await supabase.functions.invoke('trigger-app-build', {
          body: { app_type: 'test_invalid' }
        });
        
        console.log('Edge function test result:', { data, error });
        
        // When a function returns non-2xx status, the error contains the response
        if (error) {
          // Check if it's the expected validation error
          const errorMessage = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
          
          if (errorMessage.includes('valid app_type') || (error.error && error.error.includes('valid app_type'))) {
            testResults[3] = { name: "Edge Function", status: 'pass', message: "trigger-app-build function is responsive and validates input correctly" };
          } else if (errorMessage.includes('Admin access required')) {
            testResults[3] = { name: "Edge Function", status: 'warning', message: "Function accessible but admin check failed - check user roles" };
          } else {
            testResults[3] = { name: "Edge Function", status: 'warning', message: `Function responded with error: ${errorMessage}` };
          }
        } else if (data) {
          testResults[3] = { name: "Edge Function", status: 'warning', message: `Function succeeded unexpectedly. Response: ${JSON.stringify(data)}` };
        } else {
          testResults[3] = { name: "Edge Function", status: 'warning', message: "Function responded but with no data or error" };
        }
      } catch (error) {
        console.error('Edge function test error:', error);
        testResults[3] = { name: "Edge Function", status: 'fail', message: `Function test failed: ${error.message}` };
      }
      setResults([...testResults]);

      // Test 5: Real-time subscription
      testResults.push({ name: "Real-time Updates", status: 'pending', message: "Testing real-time connectivity..." });
      setResults([...testResults]);
      
      try {
        const channel = supabase.channel('test_channel');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
          
          channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'app_builds' }, () => {})
            .subscribe((status) => {
              clearTimeout(timeout);
              if (status === 'SUBSCRIBED') {
                resolve(true);
              } else {
                reject(new Error(`Subscription failed: ${status}`));
              }
            });
        });
        
        await channel.unsubscribe();
        testResults[4] = { name: "Real-time Updates", status: 'pass', message: "Real-time subscription working" };
      } catch (error) {
        testResults[4] = { name: "Real-time Updates", status: 'fail', message: `Real-time test failed: ${error.message}` };
      }
      setResults([...testResults]);

      // Summary
      const passed = testResults.filter(r => r.status === 'pass').length;
      const warnings = testResults.filter(r => r.status === 'warning').length;
      const failed = testResults.filter(r => r.status === 'fail').length;
      
      if (failed === 0 && warnings === 0) {
        toast({
          title: "All Tests Passed! ✅",
          description: "The automated build system is fully functional.",
        });
      } else if (failed === 0) {
        toast({
          title: "Tests Completed with Warnings ⚠️",
          description: `${passed} passed, ${warnings} warnings. Check details below.`,
        });
      } else {
        toast({
          title: "Some Tests Failed ❌",
          description: `${passed} passed, ${warnings} warnings, ${failed} failed. Review issues below.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("Test execution error:", error);
      toast({
        title: "Test execution failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'default',
      fail: 'destructive', 
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Build System Verification
        </CardTitle>
        <CardDescription>
          Run comprehensive tests to verify the automated build system is properly configured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runSystemTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Running Tests...' : 'Run System Tests'}
        </Button>
        
        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};