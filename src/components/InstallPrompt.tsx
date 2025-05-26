'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function InstallPrompt() {
  const pathname = usePathname();
  const showPrompt = pathname.startsWith('/wordle') || pathname.startsWith('/template');

  useEffect(() => {
    if (!showPrompt) return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('✅ Service Worker registered'))
        .catch((err) => console.error('❌ SW registration failed', err));
    }

    function isiOS() {
      return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    }

    function isInStandaloneMode() {
      return 'standalone' in window.navigator && window.navigator.standalone;
    }

    function shouldShowiOSPrompt() {
      return isiOS() && !isInStandaloneMode();
    }

    function createiOSPrompt() {
      if (document.getElementById('ios-install-prompt')) return;
      const popup = document.createElement('div');
      popup.id = 'ios-install-prompt';

      const style = document.createElement('style');
      style.textContent = `
        @keyframes bounceIn {
          0%   { transform: translateY(100%); }
          60%  { transform: translateY(calc(0em - 10px)); }
          80%  { transform: translateY(calc(0em + 5px)); }
          100% { transform: translateY(0em); }
        }

        #ios-install-prompt {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 30vh;
          background: #fbfbfb;
          color: #1d1d1f;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 1.5rem 1rem 1rem;
          border-top-left-radius: 15px;
          border-top-right-radius: 15px;
          box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
          z-index: 9999;
          animation: bounceIn 0.6s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          transform: translateY(0em);
        }

        .ios-notch-icon {
          position: absolute;
          top: -62.5px;
          left: 50%;
          transform: translateX(-50%);
          width: 125px;
          height: 125px;
          background: white;
          border-radius: 25px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
        }

        .ios-notch-icon img {
          width: 110px;
          height: 110px;
        }

        .ios-prompt-content {
          display: inline-block;
          text-align: left;
          margin-top: 1.5rem;
        }

        .step-line {
          display: flex;
          align-items: center;
          font-size: 1.05rem;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }

        .step-circle {
          display: inline-flex;
          background: #1d1d1f;
          color: #fbfbfb;
          font-weight: bold;
          width: 1.5rem;
          height: 1.5rem;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          font-size: 0.9rem;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }

        .close-x {
          position: absolute;
          top: 0.75rem;
          right: 1.5rem;
          background: transparent;
          border: none;
          color: #1d1d1f;
          font-size: 1.5rem;
          font-weight: bold;
          cursor: pointer;
        }

        .ios-title {
          margin-top: 3.0rem;
          font-size: 1.25rem;
          font-weight: 700;
          text-align: center;
        }

        .share-icon {
          width: 32px;
          height: 32px;
          vertical-align: middle;
        }
      `;
      document.head.appendChild(style);

      popup.innerHTML = `
        <div class="ios-notch-icon">
          <img src="/images/apple-touch-icon.png" alt="Share Icon">
        </div>
        <button class="close-x" aria-label="Dismiss prompt">&times;</button>
        <div class="ios-title">Install the App</div>
        <div class="ios-prompt-content">
          <div class="step-line">
            <span class="step-circle">1</span>Tap the&nbsp;<strong>Share</strong>&nbsp;icon&nbsp;<img src="/images/share-apple.svg" alt="Share Icon" class="share-icon">
          </div>
          <div class="step-line">
            <span class="step-circle">2</span>Tap <strong>"Add to Home Screen"</strong>
          </div>
        </div>
      `;

      document.body.appendChild(popup);

      popup.querySelector('.close-x')?.addEventListener('click', () => {
        popup.style.animation = '';
        popup.style.transform = 'translateY(calc(100% + 125px))';
        popup.style.transition = 'transform 0.4s ease';
        setTimeout(() => popup.remove(), 400);
      });
    }

    let deferredPrompt: any;
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('🪟 beforeinstallprompt triggered');
      e.preventDefault();
      deferredPrompt = e;

      const btn = document.createElement('button');
      btn.textContent = '📥 Install App';
      Object.assign(btn.style, {
        position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: '#c1440e', color: 'white', padding: '1rem', fontSize: '1rem', border: 'none', borderRadius: '10px', zIndex: '9999'
      });

      btn.addEventListener('click', async () => {
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        console.log(result.outcome === 'accepted' ? '✅ Installed' : '❌ Dismissed');
        btn.remove();
      });

      document.body.appendChild(btn);
    });

    setTimeout(() => {
      if (shouldShowiOSPrompt()) {
        console.log('📱 iOS conditions met — showing install prompt');
        createiOSPrompt();
      } else {
        console.log('📱 iOS conditions NOT met');
      }
    }, 500);
  }, [showPrompt]);

  return null;
}
