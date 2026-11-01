import { Button } from "../ui/Button";
import styles from "./SubmitObjectionButton.module.css";

interface SubmitObjectionButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function SubmitObjectionButton({
  disabled = false,
  onClick,
}: SubmitObjectionButtonProps) {
  return (
    <Button
      variant="danger"
      size="md"
      fullWidth
      disabled={disabled}
      className={styles["button"]}
      onClick={onClick}
    >
      <span aria-hidden="true">!</span>
      <span>異議申し立てを送信する</span>
    </Button>
  );
}
