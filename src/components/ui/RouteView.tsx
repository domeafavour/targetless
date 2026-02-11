import { cn } from "@/lib/utils";
import React from "react";

type Ref = React.ComponentRef<"div"> | null;

type Props = React.ComponentPropsWithoutRef<"div">;

export type RouteViewRef = Ref;
export type RouteViewProps = Props;

export const RouteView = React.forwardRef<Ref, Props>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cn(
          "min-h-[calc(100vh-64px)] bg-slate-950 text-white",
          className,
        )}
        {...props}
      />
    );
  },
);

RouteView.displayName = "RouteView";
