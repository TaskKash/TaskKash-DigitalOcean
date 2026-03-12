import { usePWAInstall } from '@/hooks/usePWAInstall';
import { X, Download, Share } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PWAInstallBanner() {
    const { isInstallable, isIOS, promptInstall, dismiss } = usePWAInstall();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isInstallable) {
            const timer = setTimeout(() => setVisible(true), 2500);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [isInstallable]);

    const handleInstall = async () => {
        if (isIOS) return;
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
            className={`fixed bottom-0 left-0 right-0 z-[9998] transition-transform duration-[450ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                visible ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'
            }`}
        >
            <div className="bg-gradient-to-br from-[#0d2318] to-[#1a3d2b] border-t border-emerald-500/40 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
                {/* Header row */}
                <div className="flex items-center gap-3 mb-3">
                    <img
                        src="/icon-192.png"
                        alt="TaskKash"
                        className="w-12 h-12 rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-[0.95rem] leading-tight">
                            TaskKash
                        </div>
                        <div className="text-white/60 text-[0.78rem] mt-0.5">
                            {isIOS
                                ? 'أضف التطبيق لشاشة الرئيسية | Add to Home Screen'
                                : 'ثبّت التطبيق لتجربة أسرع | Install for faster access'}
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        title="Dismiss"
                        className="bg-white/10 border-none text-white/60 rounded-full w-[30px] h-[30px] flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-white/20 transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* iOS instructions */}
                {isIOS ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-[10px] px-[14px] py-[10px] text-[0.82rem] text-white/75 flex items-center gap-2">
                        <Share size={16} className="text-emerald-400 flex-shrink-0" />
                        <span>
                            اضغط على <strong className="text-emerald-400">مشاركة</strong> ثم{' '}
                            <strong className="text-emerald-400">"إضافة للشاشة الرئيسية"</strong>
                            <br />
                            Tap <strong className="text-emerald-400">Share</strong> →{' '}
                            <strong className="text-emerald-400">Add to Home Screen</strong>
                        </span>
                    </div>
                ) : (
                    /* Android / Chrome install button */
                    <button
                        onClick={handleInstall}
                        className="w-full bg-gradient-to-br from-emerald-500 to-emerald-700 border-none rounded-xl text-white py-3 px-4 text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.55)] transition-shadow"
                    >
                        <Download size={18} />
                        تثبيت التطبيق / Install App
                    </button>
                )}
            </div>
        </div>
    );
}
