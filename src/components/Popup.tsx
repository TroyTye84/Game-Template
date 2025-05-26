'use client';
import { useEffect } from 'react';
import styles from './popup.module.css';

export default function Popup({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(onClose, 2000); // Matches animation
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div
      className={styles.popup}
      onClick={onClose}
      dangerouslySetInnerHTML={{ __html: message }}
    />
  );
}
