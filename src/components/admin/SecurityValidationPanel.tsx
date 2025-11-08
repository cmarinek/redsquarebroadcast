import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  details?: any;
}

interface ValidationSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalFailures: number;
  highFailures: number;
  overall: "PASS" | "FAIL";
  timestamp: string;
}

interface ValidationResponse {
  success: boolean;
  summary: ValidationSummary;
  results: ValidationResult[];
  recommendations: string[];
}

export function SecurityValidationPanel() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ValidationResponse | null>(null);

  const runValidation = async () => {
    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('security-validation', {
        body: {}
      });

      if (error) {
        console.error("Validation error:", error);
        toast.error("Security validation failed", {
          description: error.message
        });
        return;
      }

      setResults(data as ValidationResponse);
      
      if (data.summary.overall === "PASS") {
        toast.success("Security validation passed!", {
          description: `${data.summary.passedTests}/${data.summary.totalTests} tests passed`
        });
      } else {
        toast.error("Security issues detected", {
          description: `${data.summary.criticalFailures} critical, ${data.summary.highFailures} high severity issues`
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to run security validation");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="h-4 w-4" />;
      case "high": return <AlertTriangle className="h-4 w-4" />;
      case "medium": return <AlertCircle className="h-4 w-4" />;
      case "low": return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Security Validation</CardTitle>
              <CardDescription>
                Run comprehensive security checks on database, RLS policies, and data integrity
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={runValidation} 
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Validation...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Run Security Check
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {results && (
        <CardContent className="space-y-6">
          {/* Summary */}
          <Alert variant={results.summary.overall === "PASS" ? "default" : "destructive"}>
            <AlertTitle className="flex items-center gap-2">
              {results.summary.overall === "PASS" ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  All Security Checks Passed
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  Security Issues Detected
                </>
              )}
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                <p>Total Tests: {results.summary.totalTests}</p>
                <p>Passed: {results.summary.passedTests}</p>
                <p>Failed: {results.summary.failedTests}</p>
                {results.summary.criticalFailures > 0 && (
                  <p className="font-bold text-destructive">
                    Critical Failures: {results.summary.criticalFailures}
                  </p>
                )}
                {results.summary.highFailures > 0 && (
                  <p className="font-semibold text-orange-500">
                    High Severity: {results.summary.highFailures}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Last run: {new Date(results.summary.timestamp).toLocaleString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Recommendations</h3>
              <div className="space-y-2">
                {results.recommendations.map((rec, idx) => (
                  <Alert key={idx} variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Detailed Test Results</h3>
            <div className="space-y-2">
              {results.results.map((result, idx) => (
                <Card key={idx} className={result.passed ? "border-green-200" : "border-red-200"}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          getSeverityIcon(result.severity)
                        )}
                        <span className="font-medium text-sm">{result.test}</span>
                      </div>
                      <Badge variant={result.passed ? "secondary" : getSeverityColor(result.severity)}>
                        {result.passed ? "PASS" : result.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.details && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
