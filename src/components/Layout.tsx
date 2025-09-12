import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { StatusIndicator } from "./StatusIndicator";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout = ({ children }: LayoutProps) => {
  // Deprecated wrapper: App.tsx now provides global layout (Navigation, StatusIndicator, main)
  return <>{children}</>;
};