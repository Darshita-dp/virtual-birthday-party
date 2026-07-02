import type { ReactNode } from "react";
import styles from "./Panel.module.css";

type PanelTag = "div" | "section" | "aside" | "nav";

interface PanelProps {
  children: ReactNode;
  className?: string;
  as?: PanelTag;
}

/** Reusable translucent "glass" panel (DESIGN_SYSTEM §8). */
export function Panel({ children, className = "", as: Tag = "div" }: PanelProps) {
  return <Tag className={`${styles.panel} ${className}`.trim()}>{children}</Tag>;
}
