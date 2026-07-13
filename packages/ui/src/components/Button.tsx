import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border text-foreground hover:bg-secondary",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
        danger: "border border-destructive/50 text-destructive hover:bg-destructive/10",
        success: "bg-chart-2 text-white hover:bg-chart-2/90",
      },
      size: {
        sm: "text-xs px-3 py-1.5 rounded-md",
        md: "text-sm px-4 py-2 rounded-lg",
        lg: "text-base px-5 py-2.5 rounded-lg",
      },
      shape: {
        pill: "rounded-full",
        soft: "rounded-xl",
      },
      fullWidth: {
        true: "w-full justify-center",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "pill",
      fullWidth: false,
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape, fullWidth }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
