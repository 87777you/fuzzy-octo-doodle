"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { AppLayout } from "../../../../../components/layout/AppLayout";
import { PageHeader } from "../../../../../components/layout/PageHeader";
import styles from "./ProfileEdit.module.css";

const MAX_NAME_LENGTH = 20;

export default function ProfileEditPage() {
  const [name, setName] = useState("りく");
  const [avatarUrl, setAvatarUrl] = useState("/images/donee-login-brand.png");

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUrl(URL.createObjectURL(file));
  }

  return (
    <AppLayout showHeader={false}>
      <div className={styles["page"]}>
        <PageHeader title="プロフィール編集" backHref="/mypage" />

        <section className={styles["avatarCard"]} aria-label="プロフィール画像">
          <div className={styles["avatar"]}>
            <Image src={avatarUrl} alt="プロフィール画像" width={150} height={150} />
          </div>
          <label className={styles["avatarButton"]}>
            <span className={styles["imageIcon"]} aria-hidden="true">▧</span>
            アイコンを変更
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className={styles["fileInput"]}
            />
          </label>
        </section>

        <form className={styles["form"]} onSubmit={(event) => event.preventDefault()}>
          <div className={styles["nameField"]}>
            <label htmlFor="profile-name">ユーザー名</label>
            <div className={styles["inputWrap"]}>
              <input
                id="profile-name"
                name="name"
                value={name}
                maxLength={MAX_NAME_LENGTH}
                onChange={(event) => setName(event.target.value)}
                autoComplete="nickname"
              />
              <span>{name.length} / {MAX_NAME_LENGTH}</span>
            </div>
          </div>

          <button type="submit" className={styles["saveButton"]}>
            保存する
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
