import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Table, Calendar } from "lucide-react";
import { format } from "date-fns";

interface DataExportToolsProps {
  userRole: "admin" | "screen_owner" | "broadcaster";
  userId?: string;
}

export function DataExportTools({ userRole, userId }: DataExportToolsProps) {
  const [exportType, setExportType] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportOptions = {
    admin: [
      { value: "all_users", label: "All Users", icon: Table },
      { value: "all_screens", label: "All Screens", icon: Table },
      { value: "all_bookings", label: "All Bookings", icon: Calendar },
      { value: "all_payments", label: "All Payments", icon: FileText },
      { value: "financial_report", label: "Financial Report", icon: FileText },
    ],
    screen_owner: [
      { value: "my_screens", label: "My Screens", icon: Table },
      { value: "my_bookings", label: "My Bookings", icon: Calendar },
      { value: "my_revenue", label: "Revenue Report", icon: FileText },
    ],
    broadcaster: [
      { value: "my_campaigns", label: "My Campaigns", icon: Table },
      { value: "my_bookings", label: "My Bookings", icon: Calendar },
      { value: "my_spending", label: "Spending Report", icon: FileText },
    ],
  };

  const exportData = async () => {
    if (!exportType) {
      toast({
        title: "Select export type",
        description: "Please choose what data to export",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);

    try {
      let query;
      let filename = `export-${exportType}-${format(new Date(), "yyyy-MM-dd")}`;

      switch (exportType) {
        case "all_users":
          query = supabase.from("profiles").select("*");
          break;
        case "all_screens":
          query = supabase.from("screens").select("*");
          break;
        case "all_bookings":
          query = supabase.from("bookings").select("*");
          break;
        case "all_payments":
          query = supabase.from("payments").select("*");
          break;
        case "my_screens":
          query = supabase.from("screens").select("*").eq("owner_user_id", userId);
          break;
        case "my_bookings":
          if (userRole === "screen_owner") {
            query = supabase
              .from("bookings")
              .select("*, screens!inner(*)")
              .eq("screens.owner_user_id", userId);
          } else {
            query = supabase.from("bookings").select("*").eq("user_id", userId);
          }
          break;
        case "my_revenue":
          query = supabase
            .from("payments")
            .select("*, bookings!inner(*, screens!inner(*))")
            .eq("bookings.screens.owner_user_id", userId);
          break;
        case "my_campaigns":
          query = supabase.from("ab_test_campaigns").select("*").eq("user_id", userId);
          break;
        case "my_spending":
          query = supabase.from("payments").select("*").eq("user_id", userId);
          break;
        default:
          throw new Error("Invalid export type");
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convert to CSV
      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "There is no data available for this export",
          variant: "destructive",
        });
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row: any) =>
          headers.map((header) => {
            const value = row[header];
            // Handle nested objects and arrays
            const cellValue =
              typeof value === "object" ? JSON.stringify(value) : value;
            // Escape commas and quotes
            return `"${String(cellValue || "").replace(/"/g, '""')}"`;
          }).join(",")
        ),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Downloaded ${data.length} records`,
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const options = exportOptions[userRole];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Download your data as CSV for analysis and reporting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select data to export" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportData} disabled={!exportType || exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Exported files will be in CSV format and include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>All relevant data fields</li>
            <li>Timestamps and metadata</li>
            <li>Ready for Excel, Google Sheets, or data analysis tools</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
