
import { Home, Calculator, FolderOpen, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Check if we're in any calculator page
  const isCalculatorActive = [
    "/axial-load-calculator",
    "/eccentric-load-calculator",
    "/spiral-column-calculator",
    "/spiral-column-design",
    "/tied-column-calculator"
  ].some(path => currentPath.startsWith(path));

  const navItems = [
    {
      name: "Home",
      icon: Home,
      path: "/",
    },
    {
      name: "Calculations",
      icon: Calculator,
      path: "/axial-load-calculator", // Default calculator
      isActive: isCalculatorActive,
    },
    {
      name: "Saved",
      icon: FolderOpen,
      path: "/saved-projects",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 light-glass border-t border-border">
      <nav className="flex h-full items-center justify-around">
        {navItems.map((item) => {
          const isActive = 
            item.isActive !== undefined 
              ? item.isActive 
              : (item.path === "/" && currentPath === "/") || 
                (item.path !== "/" && currentPath.startsWith(item.path));
            
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center space-y-1 px-2 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "scale-110" : "scale-100"
                )}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
