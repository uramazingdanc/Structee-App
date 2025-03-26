import { cn } from "@/lib/utils";
import React from "react";
import { Link, LinkProps as RouterLinkProps } from "react-router-dom";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  to?: string;
  active?: boolean;
}

export function Card({
  className,
  children,
  to,
  active = false,
  ...props
}: CardProps) {
  const cardClasses = cn(
    "rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all duration-200",
    active && "border-primary/50 bg-primary/5",
    to && "hover:shadow-md hover:border-primary/20 cursor-pointer",
    className
  );

  if (to) {
    // Only include props that are compatible with LinkProps when rendering Link
    const { className: _, ...linkProps } = props as any;
    return (
      <Link to={to} className={cardClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({
  className,
  children,
  ...props
}: CardTitleProps) {
  return (
    <h3
      className={cn("font-semibold leading-tight tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({
  className,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn("flex items-center pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
