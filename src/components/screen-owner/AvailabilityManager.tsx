import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, DollarSign, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Screen {
  id: string;
  screen_name: string;
  availability_start: string;
  availability_end: string;
  price_per_hour: number;
  is_active: boolean;
}

interface SpecialPricing {
  id?: string;
  date: string;
  start_time: string;
  end_time: string;
  price_per_hour: number;
  description: string;
}

interface AvailabilityManagerProps {
  screenId: string;
}

export function AvailabilityManager({ screenId }: AvailabilityManagerProps) {
  const [screen, setScreen] = useState<Screen | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specialPricing, setSpecialPricing] = useState<SpecialPricing[]>([]);
  const [newSpecialPricing, setNewSpecialPricing] = useState<SpecialPricing>({
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    price_per_hour: 0,
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchScreenData();
  }, [screenId]);

  const fetchScreenData = async () => {
    try {
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .eq('id', screenId)
        .single();

      if (error) throw error;
      setScreen(data);
    } catch (error) {
      console.error('Error fetching screen:', error);
      toast({
        title: "Error",
        description: "Failed to load screen data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScreenAvailability = async () => {
    if (!screen) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('screens')
        .update({
          availability_start: screen.availability_start,
          availability_end: screen.availability_end,
          price_per_hour: screen.price_per_hour,
          is_active: screen.is_active
        })
        .eq('id', screenId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Screen availability updated successfully"
      });
    } catch (error) {
      console.error('Error updating screen:', error);
      toast({
        title: "Error",
        description: "Failed to update screen availability",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      options.push(timeString);
    }
    return options;
  };

  const addSpecialPricing = () => {
    if (!newSpecialPricing.date || !newSpecialPricing.description || newSpecialPricing.price_per_hour <= 0) {
      toast({
        title: "Invalid input",
        description: "Please fill in all fields for special pricing",
        variant: "destructive"
      });
      return;
    }

    setSpecialPricing([...specialPricing, { ...newSpecialPricing }]);
    setNewSpecialPricing({
      date: '',
      start_time: '09:00',
      end_time: '17:00',
      price_per_hour: 0,
      description: ''
    });
  };

  const removeSpecialPricing = (index: number) => {
    setSpecialPricing(specialPricing.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!screen) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Screen not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Availability Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Screen Active</Label>
              <p className="text-sm text-muted-foreground">Accept new bookings</p>
            </div>
            <Switch
              checked={screen.is_active}
              onCheckedChange={(checked) => setScreen({ ...screen, is_active: checked })}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Opening Time</Label>
              <Select 
                value={screen.availability_start} 
                onValueChange={(value) => setScreen({ ...screen, availability_start: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeOptions().map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="end-time">Closing Time</Label>
              <Select 
                value={screen.availability_end} 
                onValueChange={(value) => setScreen({ ...screen, availability_end: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeOptions().map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="price">Base Price per Hour (cents)</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                value={screen.price_per_hour}
                onChange={(e) => setScreen({ ...screen, price_per_hour: parseInt(e.target.value) || 0 })}
                placeholder="Price in cents (e.g., 5000 for $50.00)"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current price: ${(screen.price_per_hour / 100).toFixed(2)} per hour
            </p>
          </div>

          <Button onClick={updateScreenAvailability} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Special Pricing Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Special Pricing (Future Feature)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set special pricing for specific dates, holidays, or events.
          </p>

          {/* Existing Special Pricing */}
          {specialPricing.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Special Pricing</h4>
              {specialPricing.map((pricing, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{pricing.date}</Badge>
                      <span className="text-sm">{pricing.start_time} - {pricing.end_time}</span>
                      <Badge>${(pricing.price_per_hour / 100).toFixed(2)}/hr</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{pricing.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeSpecialPricing(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Special Pricing */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium">Add Special Pricing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="special-date">Date</Label>
                <Input
                  id="special-date"
                  type="date"
                  value={newSpecialPricing.date}
                  onChange={(e) => setNewSpecialPricing({ ...newSpecialPricing, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="special-start">Start Time</Label>
                <Select 
                  value={newSpecialPricing.start_time}
                  onValueChange={(value) => setNewSpecialPricing({ ...newSpecialPricing, start_time: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="special-end">End Time</Label>
                <Select 
                  value={newSpecialPricing.end_time}
                  onValueChange={(value) => setNewSpecialPricing({ ...newSpecialPricing, end_time: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="special-price">Price (cents)</Label>
                <Input
                  id="special-price"
                  type="number"
                  value={newSpecialPricing.price_per_hour}
                  onChange={(e) => setNewSpecialPricing({ ...newSpecialPricing, price_per_hour: parseInt(e.target.value) || 0 })}
                  placeholder="Price in cents"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="special-description">Description</Label>
              <Input
                id="special-description"
                value={newSpecialPricing.description}
                onChange={(e) => setNewSpecialPricing({ ...newSpecialPricing, description: e.target.value })}
                placeholder="e.g., Black Friday Special, Holiday Pricing"
              />
            </div>
            <Button onClick={addSpecialPricing} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Special Pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
