"use client";

/**
 * Compound Tabs component (v1 parity): Tabs / TabsList / TabsTrigger /
 * TabsContent. Keyboard- and RTL-friendly; horizontal scroll on overflow.
 */
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

const TabsCtx = createContext<{
  active: string;
  setActive: (v: string) => void;
}>({ active: "", setActive: () => {} });

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = "",
}: {
  defaultValue: string;
  /** Controlled mode: pass value + onValueChange to own the active tab. */
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsCtx.Provider value={{ active, setActive }}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <div className="tabs__list" role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  badge,
}: {
  value: string;
  children: ReactNode;
  /** Optional count/error badge. */
  badge?: ReactNode;
}) {
  const { active, setActive } = useContext(TabsCtx);
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`tabs__trigger ${selected ? "is-active" : ""}`}
      onClick={() => setActive(value)}
    >
      {children}
      {badge != null && <span className="tabs__badge">{badge}</span>}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  /** keepMounted renders hidden (needed for forms so inputs keep state). */
  keepMounted = false,
}: {
  value: string;
  children: ReactNode;
  keepMounted?: boolean;
}) {
  const { active } = useContext(TabsCtx);
  const selected = active === value;
  if (!selected && !keepMounted) return null;
  return (
    <div role="tabpanel" hidden={!selected} className="tabs__content">
      {children}
    </div>
  );
}
