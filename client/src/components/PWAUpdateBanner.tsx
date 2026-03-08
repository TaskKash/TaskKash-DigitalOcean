import { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface PWAUpdateBannerProps {
    onUpdate?: () => void;
}

export function PWAUpdateBanner({ onUpdate }: PWAUpdateBannerProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Service worker broadcasts SW_UPDATED after activation
        const handleSWMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SW_UPDATED') {
                setShow(true);
            }
        };

        // Also listen for the custom DOM event dispatched from registerSW.ts
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
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                transform: show ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                    color: '#fff',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    borderBottom: '1px solid rgba(16,185,129,0.4)',
                }}
            >
                <RefreshCw size={18} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                    🎉 تحديث جديد متاح! | New update available
                </span>
                <button
                    onClick={handleUpdate}
                    style={{
                        background: '#10B981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    }}
                >
                    تحديث الآن / Update
                </button>
                <button
                    onClick={handleDismiss}
                    title="Dismiss"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                    }}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
