'use client';
import { useState } from 'react';
import styles from '../overlayModal.module.css';
import LeaderboardView from '../shared/LeaderboardView';

export default function WordleOverlayContent({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'alltime' | 'stats'>('daily');

    const tabs: Array<'daily' | 'weekly' | 'alltime' | 'stats'> = ['daily', 'weekly', 'alltime', 'stats'];

  return (
    <>
      <div className={styles.headerRow}>
        <button
          className={styles.cycleButton}
          onClick={() => {
            const nextIndex = (tabs.indexOf(activeTab) + 1) % tabs.length;
            setActiveTab(tabs[nextIndex]);
          }}
        >
          {activeTab === 'daily' && '🏆 Daily Winners'}
          {activeTab === 'weekly' && '📅 Weekly Winners'}
          {activeTab === 'alltime' && '🌐 All-Time Winners'}
          {activeTab === 'stats' && '📊 My Stats'}
        </button>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <img src="/images/close.svg" alt="Close" />
        </button>
      </div>

      <div className={styles.contentContainer}>
        <LeaderboardView mode={activeTab} />
      </div>
    </>
  );
}
