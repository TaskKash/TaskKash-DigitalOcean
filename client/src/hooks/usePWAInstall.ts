import { useState, useEffect, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

interface PWAInstallHook {
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    promptInstall: () => Promise<boolean>;
    dismiss: () => void;
    isDismissed: boolean;
}

const DISMISS_KEY = 'taskkash_pwa_install_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isDismissedRecently(): boolean {
    try {
        const stored = localStorage.getItem(DISMISS_KEY);
        if (!stored) return false;
        const ts = parseInt(stored, 10);
        return Date.now() - ts < DISMISS_DURATION_MS;
    } catch {
        return false;
    }
}

export function usePWAInstall(): PWAInstallHook {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isDismissed, setIsDismissed] = useState<boolean>(isDismissedRecently);

    // Detect iOS (Safari) — no beforeinstallprompt event on iOS
    const isIOS = /iphone|ipad|ipod/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );

    // Already running in standalone (installed PWA)?
    useEffect(() => {
        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true);
        setIsInstalled(standalone);
    }, []);

    // Capture the browser's install prompt
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Detect when the user installs via the prompt
    useEffect(() => {
        const handler = () => setIsInstalled(true);
        window.addEventListener('appinstalled', handler);
        return () => window.removeEventListener('appinstalled', handler);
    }, []);

    const promptInstall = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) return false;
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            if (outcome === 'accepted') {
                setIsInstalled(true);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        try {
            localStorage.setItem(DISMISS_KEY, Date.now().toString());
        } catch { /* noop */ }
        setIsDismissed(true);
    }, []);

    const isInstallable = !isInstalled && !isDismissed && (!!deferredPrompt || isIOS);

    return { isInstallable, isInstalled, isIOS, promptInstall, dismiss, isDismissed };
}
