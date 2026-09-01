import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-[background-color,color,opacity,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        primary: "bg-mint text-mint-fg hover:bg-mint/90",
        ink: "bg-ink text-paper hover:bg-ink/90",
        dark: "bg-dark text-dark-fg hover:bg-dark-2",
        outline:
          "bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--color-ink)] hover:bg-ink hover:text-paper",
        ghost: "bg-transparent text-ink hover:bg-paper-2",
        mintOutline:
          "bg-transparent text-mint-fg shadow-[inset_0_0_0_1px_var(--color-ink)] hover:bg-ink hover:text-paper",
      },
      size: {
        sm: "h-10 px-3.5 text-xs",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-sm",
        xl: "h-14 px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
