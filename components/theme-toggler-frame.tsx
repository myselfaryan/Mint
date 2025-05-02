"use client";

import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { ReactNode, useEffect, useState } from "react";

interface ThemeTogglerFrameProps {
  children: ReactNode;
}

export default function ThemeTogglerFrame({
  children,
}: ThemeTogglerFrameProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-4 items-center gap-2">
          {/* theme === "dark" && */ (
            <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          )}
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
          {/* theme === "light" && */ (
            <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
