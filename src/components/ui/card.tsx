import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-neutral-200 dark:border-neutral-800",
        glass: "backdrop-blur-md bg-white/80 dark:bg-neutral-900/80",
        filled: "bg-neutral-100 dark:bg-neutral-800 border-none",
        outline:
          "bg-transparent border border-neutral-200 dark:border-neutral-800 shadow-none",
      },
      size: {
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
      },
      hover: {
        default:
          "hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700",
        lift: "hover:translate-y-[-2px] hover:shadow-md",
        glow: "hover:shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "default",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  animate?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant, size, hover, animate = false, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, hover, className }))}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-neutral-900 dark:text-neutral-50",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-500 dark:text-neutral-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
