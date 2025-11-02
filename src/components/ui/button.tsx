import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-[hsl(203,92%,56%)] text-white font-bold rounded-[10px] shadow-[0_4px_12px_hsl(203,92%,56%,0.3),0_8px_20px_hsl(43,65%,52%,0.15)] hover:shadow-[0_6px_16px_hsl(203,92%,56%,0.4),0_10px_24px_hsl(43,65%,52%,0.2)] hover:-translate-y-0.5 transition-all duration-300 relative after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-[hsl(43,65%,52%)] after:to-transparent after:shadow-[0_0_10px_hsl(43,65%,52%,0.6)]",
        "glass-3d": "relative rounded-[28px] backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 text-[hsl(var(--brand-blue))] font-bold shadow-[0_20px_60px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_24px_70px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 before:absolute before:inset-0 before:rounded-[28px] before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[80%] after:h-[4px] after:rounded-full after:blur-md after:transition-all after:duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
