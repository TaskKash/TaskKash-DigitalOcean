import { usePWAInstall } from '@/hooks/usePWAInstall';
import { X, Download, Share } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PWAInstallBanner() {
    const { isInstallable, isIOS, promptInstall, dismiss } = usePWAInstall();
    const [visible, setVisible] = useState(false);

    // Delay appearance slightly so it doesn't flash immediately on load
    useEffect(() => {
        if (isInstallable) {
            const timer = setTimeout(() => setVisible(true), 2500);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [isInstallable]);

    const handleInstall = async () => {
        if (isIOS) return; // iOS uses manual instructions shown in UI
        const accepted = await promptInstall();
        if (accepted) setVisible(false);
    };

    const handleDismiss = () => {
        setVisible(false);
        dismiss();
    };

    if (!isInstallable) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9998,
                transform: visible ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                pointerEvents: visible ? 'all' : 'none',
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #0d2318 0%, #1a3d2b 100%)',
                    borderTop: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '16px',
                    boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
                }}
            >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <img
                        src="/icon-192.png"
                        alt="TaskKash"
                        style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
                            TaskKash
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginTop: 2 }}>
                            {isIOS
                                ? 'أضف التطبيق لشاشة الرئيسية | Add to Home Screen'
                                : 'ثبّت التطبيق لتجربة أسرع | Install for faster access'}
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        title="Dismiss"
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: 'none',
                            color: 'rgba(255,255,255,0.6)',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* iOS instructions */}
                {isIOS ? (
                    <div
                        style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            fontSize: '0.82rem',
                            color: 'rgba(255,255,255,0.75)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <Share size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span>
                            اضغط على <strong style={{ color: '#10B981' }}>مشاركة</strong> ثم{' '}
                            <strong style={{ color: '#10B981' }}>"إضافة للشاشة الرئيسية"</strong>
                            <br />
                            Tap <strong style={{ color: '#10B981' }}>Share</strong> → <strong style={{ color: '#10B981' }}>Add to Home Screen</strong>
                        </span>
                    </div>
                ) : (
                    /* Android / Chrome install button */
                    <button
                        onClick={handleInstall}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            border: 'none',
                            borderRadius: 12,
                            color: '#fff',
                            padding: '12px 16px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                        }}
                    >
                        <Download size={18} />
                        تثبيت التطبيق / Install App
                    </button>
                )}
            </div>
        </div>
    );
}
