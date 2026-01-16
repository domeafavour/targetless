import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center gap-2 font-semibold uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-cyan-500 text-white hover:bg-cyan-400',
        outline: 'border border-white/20 text-white hover:border-white/60',
        ghost: 'bg-white/10 text-white hover:bg-white/20',
        danger:
          'border border-red-400/50 text-red-200 hover:border-red-300 bg-transparent',
        success: 'bg-emerald-500 text-white hover:bg-emerald-400',
      },
      size: {
        sm: 'text-xs px-4 py-1.5',
        md: 'text-sm px-5 py-2',
        lg: 'text-base px-6 py-3',
      },
      shape: {
        pill: 'rounded-full',
        soft: 'rounded-2xl',
      },
      fullWidth: {
        true: 'w-full justify-center',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      shape: 'pill',
      fullWidth: false,
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      fullWidth,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape, fullWidth }), className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }
