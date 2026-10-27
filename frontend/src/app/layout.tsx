import type { ReactNode } from "react";

import "../src/styles/variables.css";

export const metadata = {
  title: "fuzzy-octo-doodle",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}