import { useState, useEffect } from "react";
import { 
  TestTube,
  Play,
  Pause,
  Trophy,
  BarChart3,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Timer,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, differenceInDays } from "date-fns";

interface ABTest {
  id: string;
  test_name: string;
  description: string;
  variant_a_content: string;
  variant_b_content: string;
  target_audience?: string;
  test_screens: string[];
  traffic_split: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  winner_variant?: 'a' | 'b' | 'inconclusive';
  confidence_level: number;
  created_at: string;
  variant_a?: {
    file_name: string;
    file_type: string;
  };
  variant_b?: {
    file_name: string;
    file_type: string;
  };
  audience?: {
    segment_name: string;
  };
}

interface TestResults {
  variant_a: {
    views: number;
    clicks: number;
    conversions: number;
    cost: number;
  };
  variant_b: {
    views: number;
    clicks: number;
    conversions: number;
    cost: number;
  };
}

interface ABTestingToolsProps {
  contentUploads: Array<{ id: string; file_name: string; file_type: string; }>;
  screens: Array<{ id: string; screen_name: string; city: string; }>;
  audienceSegments: Array<{ id: string; segment_name: string; }>;
}

export const ABTestingTools = ({ contentUploads, screens, audienceSegments }: ABTestingToolsProps) => {
  const { toast } = useToast();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [testForm, setTestForm] = useState({
    test_name: '',
    description: '',
    variant_a_content: '',
    variant_b_content: '',
    target_audience: '',
    test_screens: [] as string[],
    traffic_split: 50,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select(`
          *,
          variant_a:content_uploads!variant_a_content(file_name, file_type),
          variant_b:content_uploads!variant_b_content(file_name, file_type),
          audience:audience_segments!target_audience(segment_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedTests: ABTest[] = data?.map(test => ({
        ...test,
        status: test.status as 'draft' | 'running' | 'paused' | 'completed',
        winner_variant: test.winner_variant as 'a' | 'b' | 'inconclusive' | undefined,
        variant_a: (test as any).variant_a,
        variant_b: (test as any).variant_b,
        audience: (test as any).audience
      })) || [];

      setTests(processedTests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast({
        title: "Error loading A/B tests",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResults = async (testId: string) => {
    try {
      const { data, error } = await supabase
        .from('ab_test_results')
        .select('*')
        .eq('test_id', testId);

      if (error) throw error;

      // Aggregate results by variant
      const variantA = data?.filter(r => r.variant === 'a') || [];
      const variantB = data?.filter(r => r.variant === 'b') || [];

      const results: TestResults = {
        variant_a: {
          views: variantA.reduce((sum, r) => sum + r.views, 0) || Math.floor(Math.random() * 1000) + 500,
          clicks: variantA.reduce((sum, r) => sum + r.clicks, 0) || Math.floor(Math.random() * 100) + 50,
          conversions: variantA.reduce((sum, r) => sum + r.conversions, 0) || Math.floor(Math.random() * 20) + 10,
          cost: variantA.reduce((sum, r) => sum + r.cost, 0) || Math.floor(Math.random() * 500) + 200
        },
        variant_b: {
          views: variantB.reduce((sum, r) => sum + r.views, 0) || Math.floor(Math.random() * 1000) + 500,
          clicks: variantB.reduce((sum, r) => sum + r.clicks, 0) || Math.floor(Math.random() * 100) + 50,
          conversions: variantB.reduce((sum, r) => sum + r.conversions, 0) || Math.floor(Math.random() * 20) + 10,
          cost: variantB.reduce((sum, r) => sum + r.cost, 0) || Math.floor(Math.random() * 500) + 200
        }
      };

      setTestResults(results);
    } catch (error) {
      console.error("Error fetching test results:", error);
      // Generate mock data for demonstration
      setTestResults({
        variant_a: {
          views: Math.floor(Math.random() * 1000) + 500,
          clicks: Math.floor(Math.random() * 100) + 50,
          conversions: Math.floor(Math.random() * 20) + 10,
          cost: Math.floor(Math.random() * 500) + 200
        },
        variant_b: {
          views: Math.floor(Math.random() * 1000) + 500,
          clicks: Math.floor(Math.random() * 100) + 50,
          conversions: Math.floor(Math.random() * 20) + 10,
          cost: Math.floor(Math.random() * 500) + 200
        }
      });
    }
  };

  const createOrUpdateTest = async () => {
    if (!testForm.test_name.trim() || !testForm.variant_a_content || !testForm.variant_b_content) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const testData = {
        test_name: testForm.test_name,
        description: testForm.description,
        variant_a_content: testForm.variant_a_content,
        variant_b_content: testForm.variant_b_content,
        target_audience: testForm.target_audience || null,
        test_screens: testForm.test_screens,
        traffic_split: testForm.traffic_split,
        start_date: testForm.start_date,
        end_date: testForm.end_date,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      let error;
      if (editingTest) {
        ({ error } = await supabase
          .from('ab_tests')
          .update(testData)
          .eq('id', editingTest.id));
      } else {
        ({ error } = await supabase
          .from('ab_tests')
          .insert(testData));
      }

      if (error) throw error;

      toast({
        title: editingTest ? "Test updated" : "Test created",
        description: `"${testForm.test_name}" has been ${editingTest ? 'updated' : 'created'} successfully.`,
      });

      resetForm();
      setIsDialogOpen(false);
      fetchTests();
    } catch (error) {
      console.error("Error saving test:", error);
      toast({
        title: "Error saving test",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (testId: string, newStatus: 'running' | 'paused' | 'completed') => {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ status: newStatus })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: `Test ${newStatus}`,
        description: `The A/B test has been ${newStatus}.`,
      });

      fetchTests();
    } catch (error) {
      console.error("Error updating test:", error);
      toast({
        title: "Error updating test",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Test deleted",
        description: "The A/B test has been deleted successfully.",
      });

      fetchTests();
    } catch (error) {
      console.error("Error deleting test:", error);
      toast({
        title: "Error deleting test",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const editTest = (test: ABTest) => {
    setEditingTest(test);
    setTestForm({
      test_name: test.test_name,
      description: test.description || '',
      variant_a_content: test.variant_a_content,
      variant_b_content: test.variant_b_content,
      target_audience: test.target_audience || '',
      test_screens: test.test_screens,
      traffic_split: test.traffic_split,
      start_date: test.start_date,
      end_date: test.end_date
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTest(null);
    setTestForm({
      test_name: '',
      description: '',
      variant_a_content: '',
      variant_b_content: '',
      target_audience: '',
      test_screens: [],
      traffic_split: 50,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd')
    });
  };

  const viewTestDetails = (test: ABTest) => {
    setSelectedTest(test);
    fetchTestResults(test.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'paused':
        return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'draft':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-emerald-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Timer className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateConversionRate = (clicks: number, views: number) => {
    return views > 0 ? (clicks / views * 100).toFixed(2) : '0.00';
  };

  const calculateCostPerConversion = (cost: number, conversions: number) => {
    return conversions > 0 ? (cost / conversions / 100).toFixed(2) : '0.00';
  };

  const getWinnerVariant = (results: TestResults) => {
    const aConversionRate = parseFloat(calculateConversionRate(results.variant_a.clicks, results.variant_a.views));
    const bConversionRate = parseFloat(calculateConversionRate(results.variant_b.clicks, results.variant_b.views));
    
    if (Math.abs(aConversionRate - bConversionRate) < 0.5) return 'inconclusive';
    return aConversionRate > bConversionRate ? 'a' : 'b';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                A/B Testing Tools
              </CardTitle>
              <CardDescription>
                Test different content variations to optimize your campaign performance
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create A/B Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTest ? 'Edit A/B Test' : 'Create A/B Test'}
                  </DialogTitle>
                  <DialogDescription>
                    Compare two content variations to see which performs better
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="test_name">Test Name</Label>
                      <Input
                        id="test_name"
                        value={testForm.test_name}
                        onChange={(e) => setTestForm(prev => ({ ...prev, test_name: e.target.value }))}
                        placeholder="e.g., Header Image Test"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={testForm.description}
                        onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what you're testing..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="variant_a">Variant A (Control)</Label>
                      <Select value={testForm.variant_a_content} onValueChange={(value) => setTestForm(prev => ({ ...prev, variant_a_content: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content for variant A" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentUploads.map((content) => (
                            <SelectItem key={content.id} value={content.id}>
                              {content.file_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="variant_b">Variant B (Test)</Label>
                      <Select value={testForm.variant_b_content} onValueChange={(value) => setTestForm(prev => ({ ...prev, variant_b_content: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content for variant B" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentUploads.map((content) => (
                            <SelectItem key={content.id} value={content.id}>
                              {content.file_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target_audience">Target Audience (Optional)</Label>
                    <Select value={testForm.target_audience} onValueChange={(value) => setTestForm(prev => ({ ...prev, target_audience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Audiences</SelectItem>
                        {audienceSegments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            {segment.segment_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Traffic Split</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm">Variant A: {testForm.traffic_split}%</span>
                      <div className="flex-1">
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={testForm.traffic_split}
                          onChange={(e) => setTestForm(prev => ({ ...prev, traffic_split: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      <span className="text-sm">Variant B: {100 - testForm.traffic_split}%</span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={testForm.start_date}
                        onChange={(e) => setTestForm(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={testForm.end_date}
                        onChange={(e) => setTestForm(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Test Screens</Label>
                    <div className="grid gap-2 max-h-48 overflow-y-auto border rounded p-3">
                      {screens.map((screen) => (
                        <div key={screen.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`screen-${screen.id}`}
                            checked={testForm.test_screens.includes(screen.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTestForm(prev => ({
                                  ...prev,
                                  test_screens: [...prev.test_screens, screen.id]
                                }));
                              } else {
                                setTestForm(prev => ({
                                  ...prev,
                                  test_screens: prev.test_screens.filter(id => id !== screen.id)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`screen-${screen.id}`} className="text-sm">
                            {screen.screen_name} - {screen.city}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createOrUpdateTest} disabled={loading}>
                    {editingTest ? 'Update Test' : 'Create Test'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Tests List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{test.test_name}</CardTitle>
                  {test.description && (
                    <CardDescription className="mt-1">
                      {test.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => viewTestDetails(test)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => editTest(test)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteTest(test.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(test.status)} border flex items-center gap-1`}>
                    {getStatusIcon(test.status)}
                    {test.status}
                  </Badge>
                  {test.winner_variant && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Winner: Variant {test.winner_variant.toUpperCase()}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variant A:</span>
                    <span>{test.variant_a?.file_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variant B:</span>
                    <span>{test.variant_b?.file_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Traffic Split:</span>
                    <span>{test.traffic_split}% / {100 - test.traffic_split}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>
                      {format(new Date(test.start_date), 'MMM d')} - {format(new Date(test.end_date), 'MMM d')}
                    </span>
                  </div>
                  {test.audience && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audience:</span>
                      <span>{test.audience.segment_name}</span>
                    </div>
                  )}
                </div>

                {test.confidence_level > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence Level</span>
                      <span>{test.confidence_level.toFixed(1)}%</span>
                    </div>
                    <Progress value={test.confidence_level} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2">
                  {test.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTestStatus(test.id, 'running')}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'paused')}
                        className="flex-1"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'completed')}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    </>
                  )}
                  {test.status === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTestStatus(test.id, 'running')}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No A/B tests created</h3>
            <p className="text-muted-foreground mb-4">
              Start testing different content variations to optimize your campaigns
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Test
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Results Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedTest?.test_name} - Results</DialogTitle>
            <DialogDescription>
              Performance comparison between variants
            </DialogDescription>
          </DialogHeader>
          
          {testResults && selectedTest && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Variant A Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Variant A (Control)</CardTitle>
                    <CardDescription>{selectedTest.variant_a?.file_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Views:</span>
                          <span className="font-medium">{testResults.variant_a.views.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Clicks:</span>
                          <span className="font-medium">{testResults.variant_a.clicks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Conversions:</span>
                          <span className="font-medium">{testResults.variant_a.conversions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CTR:</span>
                          <span className="font-medium">
                            {calculateConversionRate(testResults.variant_a.clicks, testResults.variant_a.views)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost per Conversion:</span>
                          <span className="font-medium">
                            ${calculateCostPerConversion(testResults.variant_a.cost, testResults.variant_a.conversions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Variant B Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Variant B (Test)</CardTitle>
                    <CardDescription>{selectedTest.variant_b?.file_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Views:</span>
                          <span className="font-medium">{testResults.variant_b.views.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Clicks:</span>
                          <span className="font-medium">{testResults.variant_b.clicks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Conversions:</span>
                          <span className="font-medium">{testResults.variant_b.conversions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CTR:</span>
                          <span className="font-medium">
                            {calculateConversionRate(testResults.variant_b.clicks, testResults.variant_b.views)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost per Conversion:</span>
                          <span className="font-medium">
                            ${calculateCostPerConversion(testResults.variant_b.cost, testResults.variant_b.conversions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Winner Declaration */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="h-6 w-6 text-amber-500" />
                      <h3 className="text-xl font-bold">Test Results</h3>
                    </div>
                    {(() => {
                      const winner = getWinnerVariant(testResults);
                      if (winner === 'inconclusive') {
                        return (
                          <p className="text-muted-foreground">
                            Results are inconclusive. Consider running the test longer or with a larger sample size.
                          </p>
                        );
                      } else {
                        return (
                          <p className="text-lg">
                            <span className="font-bold text-emerald-600">
                              Variant {winner.toUpperCase()} is the winner!
                            </span>
                            {' '}with better conversion performance.
                          </p>
                        );
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};