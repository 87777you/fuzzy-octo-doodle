import styles from "./ObjectionCompleteHero.module.css";

export function ObjectionCompleteHero() {
  return (
    <section className={styles["hero"]}>
      <div className={styles["check"]} aria-hidden="true">
        ✓
      </div>
      <h2>異議申し立てを送信しました</h2>
      <p>このタスクは再確認中です。</p>
      <p>タスク登録者が24時間以内に追加証拠を提出します。</p>
    </section>
  );
}
