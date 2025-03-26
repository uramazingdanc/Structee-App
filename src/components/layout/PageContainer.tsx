
import { ReactNode, useEffect } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
  withBottomNav?: boolean;
  fullHeight?: boolean;
}

export function PageContainer({
  children,
  title,
  className,
  withBottomNav = true,
  fullHeight = false,
}: PageContainerProps) {
  // Scroll to top on page render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={cn(
      "flex flex-col w-full mx-auto px-4 pb-24 pt-6 max-w-screen-md animate-fade-in",
      fullHeight && "min-h-[calc(100vh-4rem)]",
      className
    )}>
      {title && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
      )}
      <div className="flex-1">{children}</div>
      {withBottomNav && <BottomNavigation />}
    </div>
  );
}
