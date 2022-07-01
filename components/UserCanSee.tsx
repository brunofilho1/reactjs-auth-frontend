import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface UserCanSeeProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}

export function UserCanSee({ children, permissions, roles }: UserCanSeeProps) {
  const userCanSeeComponent = useCan({ permissions, roles });

  if (!userCanSeeComponent) {
    return null;
  }

  return <>{children}</>;
}
