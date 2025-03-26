
import { ReactNode, useEffect } from "react";
import { TopNavigation } from "./TopNavigation";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
  withTopNav?: boolean;
  fullHeight?: boolean;
}

export function PageContainer({
  children,
  title,
  className,
  withTopNav = true,
  fullHeight = false,
}: PageContainerProps) {
  // Scroll to top on page render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={cn(
      "flex flex-col w-full mx-auto px-4 pb-6 max-w-screen-md animate-fade-in",
      fullHeight && "min-h-[calc(100vh-4rem)]",
      className
    )}>
      {withTopNav && <TopNavigation />}
      {title && (
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
