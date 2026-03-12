import { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface PWAUpdateBannerProps {
    onUpdate?: () => void;
}

export function PWAUpdateBanner({ onUpdate }: PWAUpdateBannerProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleSWMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SW_UPDATED') {
                setShow(true);
            }
        };

        const handleDOMEvent = () => setShow(true);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleSWMessage);
        }
        window.addEventListener('swUpdated', handleDOMEvent);

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleSWMessage);
            }
            window.removeEventListener('swUpdated', handleDOMEvent);
        };
    }, []);

    const handleUpdate = () => {
        setShow(false);
        onUpdate?.();
        window.location.reload();
    };

    const handleDismiss = () => setShow(false);

    if (!show) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[9999] transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                show ? 'translate-y-0' : '-translate-y-full'
            }`}
        >
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white px-4 py-[10px] flex items-center gap-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-emerald-500/40">
                <RefreshCw size={18} className="flex-shrink-0" />
                <span className="flex-1 text-sm font-medium">
                    🎉 تحديث جديد متاح! | New update available
                </span>
                <button
                    onClick={handleUpdate}
                    className="bg-emerald-400 text-white border-none rounded-lg px-[14px] py-[5px] text-[0.8rem] font-semibold cursor-pointer whitespace-nowrap hover:bg-emerald-300 transition-colors"
                >
                    تحديث الآن / Update
                </button>
                <button
                    onClick={handleDismiss}
                    title="Dismiss"
                    className="bg-transparent border-none text-white/70 cursor-pointer p-1 flex items-center justify-center rounded-full hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
