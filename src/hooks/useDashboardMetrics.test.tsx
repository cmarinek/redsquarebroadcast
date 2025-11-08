import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useDashboardMetrics } from "./useDashboardMetrics";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() })
}));

const supabaseMock = vi.hoisted(() => ({
  functions: {
    invoke: vi.fn(),
  },
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: supabaseMock,
}));

describe("useDashboardMetrics", () => {
  beforeEach(() => {
    supabaseMock.functions.invoke.mockReset();
    supabaseMock.from.mockReset();
    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
  });

  it("loads dashboard metrics for public role", async () => {
    supabaseMock.functions.invoke.mockResolvedValue({
      data: { summary: { totalBookings: 12 }, timeSeries: { daily: [] } },
      error: null,
    });

    const { result } = renderHook(() => useDashboardMetrics({ role: "public", skipToast: true }));

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(supabaseMock.functions.invoke).toHaveBeenCalled();
    expect(result.current.data?.summary).toMatchObject({ totalBookings: 12 });
    expect(result.current.error).toBeNull();
  });

  it("loads data quality alerts for admin role", async () => {
    supabaseMock.functions.invoke.mockResolvedValue({
      data: { summary: {}, timeSeries: {} },
      error: null,
    });

    const selectMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockReturnThis();
    const limitMock = vi.fn().mockResolvedValue({ data: [{ check_name: "test", status: "passing", message: "ok", detected_at: new Date().toISOString(), resolved_at: null }], error: null });

    supabaseMock.from.mockReturnValue({ select: selectMock, order: orderMock, limit: limitMock });

    const { result } = renderHook(() => useDashboardMetrics({ role: "admin", skipToast: true }));

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.qualityAlerts).toHaveLength(1);
    expect(supabaseMock.from).toHaveBeenCalledWith("data_quality_alerts");
  });

});
