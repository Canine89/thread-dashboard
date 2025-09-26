"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ProviderProps = {
  children: React.ReactNode
}

function TooltipProvider({ children }: ProviderProps) {
  return <>{children}</>
}

type TooltipProps = {
  children: React.ReactNode
}

function Tooltip({ children }: TooltipProps) {
  return <div className="relative group/tooltip inline-block">{children}</div>
}

type TooltipTriggerProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp: "span" | "button" = asChild ? "span" : "button"
    return React.createElement(Comp, { ref, className: cn(className), ...props })
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 6, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-2 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground opacity-0 shadow-sm transition-opacity group-hover/tooltip:opacity-100",
          className
        )}
        style={{
          top: `calc(100% + ${sideOffset}px)`,
          left: "50%",
          ...style,
        }}
        {...props}
      />
    )
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
