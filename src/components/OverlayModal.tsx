import React, { MouseEvent, ReactNode } from 'react';
import styles from './overlayModal.module.css';

interface OverlayModalProps {
  onClose: () => void;
  children: ReactNode;
}

export default function OverlayModal({ onClose, children }: OverlayModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e: MouseEvent) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
