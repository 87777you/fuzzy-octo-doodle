"use client";

import styles from "./Tabs.module.css";

export type TabItem<T extends string = string> = {
  label: string;
  value: T;
};

type TabsProps<T extends string = string> = {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: TabsProps<T>) {
  return (
    <div
      className={styles["tabs"]}
      role="group"
      aria-label="表示の切り替え"
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`${styles["tab"]} ${
            value === item.value ? styles["active"] : ""
          }`}
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}