import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

const AppUtilityActionsContext = createContext<HTMLElement | null>(null);

export function AppUtilityActionsProvider({ target, children }: { target: HTMLElement | null; children: ReactNode }) {
  return <AppUtilityActionsContext.Provider value={target}>{children}</AppUtilityActionsContext.Provider>;
}

export function AppUtilityAction({ children }: { children: ReactNode }) {
  const target = useContext(AppUtilityActionsContext);
  return target ? createPortal(children, target) : null;
}
