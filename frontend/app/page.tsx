import { HEALTH_PATH } from "@app/shared";

export default function Page() {
  return (
    <main>
      <h1>fuzzy-octo-doodle</h1>
      <p>Backend health endpoint: {HEALTH_PATH}</p>
    </main>
  );
}
