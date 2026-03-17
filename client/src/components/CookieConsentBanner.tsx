import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Cookie, X, Settings2, Check } from 'lucide-react';

const CONSENT_KEY = 'tk_cookie_consent';

type ConsentState = 'undecided' | 'accepted' | 'rejected';

interface Preferences {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    analytics: true,
    marketing: false,
    functional: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Small delay to avoid flash on initial load
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const accept = () => {
    const prefs = { analytics: true, marketing: true, functional: true, essential: true, timestamp: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setShow(false);
  };

  const rejectOptional = () => {
    const prefs = { analytics: false, marketing: false, functional: false, essential: true, timestamp: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setShow(false);
  };

  const savePreferences = () => {
    const prefs = { ...preferences, essential: true, timestamp: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setShow(false);
    setShowPreferences(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        {!showPreferences ? (
          /* Main Banner */
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <Cookie className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{t('cookie.title')}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('cookie.description')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-end">
              <Button variant="ghost" size="sm" className="text-gray-500 text-xs" onClick={() => setShowPreferences(true)}>
                <Settings2 className="w-3.5 h-3.5 mr-1" /> {t('cookie.managePreferences')}
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={rejectOptional}>
                {t('cookie.rejectOptional')}
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs" onClick={accept}>
                <Check className="w-3.5 h-3.5 mr-1" /> {t('cookie.acceptAll')}
              </Button>
            </div>
          </div>
        ) : (
          /* Preferences Panel */
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('cookie.preferences.title')}</h3>
              <button title="Close preferences" onClick={() => setShowPreferences(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'functional' as const, label: t('cookie.preferences.functional.title'), desc: t('cookie.preferences.functional.desc'), required: false },
                { key: 'analytics' as const, label: t('cookie.preferences.analytics.title'), desc: t('cookie.preferences.analytics.desc'), required: false },
                { key: 'marketing' as const, label: t('cookie.preferences.marketing.title'), desc: t('cookie.preferences.marketing.desc'), required: false },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <button
                    title={`Toggle ${label}`}
                    onClick={() => setPreferences(p => ({ ...p, [key]: !p[key] }))}
                    className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${preferences[key] ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${preferences[key] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
              {/* Essential — always on */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg opacity-70">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{t('cookie.preferences.essential.title')} <span className="text-xs text-gray-400 ml-1">{t('cookie.preferences.essential.active')}</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('cookie.preferences.essential.desc')}</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-green-500 relative mt-0.5">
                  <span className="absolute top-0.5 left-5 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" size="sm" className="text-xs" onClick={rejectOptional}>{t('cookie.rejectOptional')}</Button>
              <Button size="sm" className="bg-primary text-white text-xs" onClick={savePreferences}>{t('cookie.preferences.save')}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
