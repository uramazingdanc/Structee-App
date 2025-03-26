
import { Plus } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  to?: string;
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, icon = <Plus className="h-6 w-6" />, to, ...props }, ref) => {
    const buttonClass = cn(
      "fixed bottom-20 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full",
      "bg-primary text-primary-foreground shadow-lg",
      "transition-all duration-300 hover:scale-105 active:scale-95",
      className
    );

    if (to) {
      return (
        <Link to={to} className={buttonClass}>
          {icon}
        </Link>
      );
    }

    return (
      <button ref={ref} className={buttonClass} {...props}>
        {icon}
      </button>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";
