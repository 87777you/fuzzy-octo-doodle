import type { ReactNode } from "react";

import "../styles/globals.css";
import "../styles/variables.css";

export const metadata = {
  title: "Donee",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}