import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  loading?: boolean;
  className?: string;
}

export type LoadingOrProps = Props;

export function LoadingOr({ children, className, loading }: Props) {
  return loading ? (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
  ) : (
    children
  );
}
