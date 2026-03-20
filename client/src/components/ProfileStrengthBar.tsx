import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Shield, Star, Award, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileStrengthBarProps {
  strength: number; // 0-100
  showDetails?: boolean;
}

const getBadgeInfo = (strength: number, t: any) => {
  if (strength >= 100) {
    return {
      name: t('profileStrength.badges.complete', 'Complete'),
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      emoji: '🛡️'
    };
  } else if (strength >= 75) {
    return {
      name: t('profileStrength.badges.strong', 'Strong'),
      icon: Shield,
      color: 'text-blue-500',
      bgColor: 'bg-gradient-to-r from-blue-400 to-blue-600',
      emoji: '🔵'
    };
  } else if (strength >= 50) {
    return {
      name: t('profileStrength.badges.good', 'Good'),
      icon: Shield,
      color: 'text-indigo-400',
      bgColor: 'bg-gradient-to-r from-indigo-400 to-indigo-500',
      emoji: '🟣'
    };
  } else {
    return {
      name: t('profileStrength.badges.basic', 'Basic'),
      icon: Shield,
      color: 'text-gray-400',
      bgColor: 'bg-gradient-to-r from-gray-400 to-gray-500',
      emoji: '⚪'
    };
  }
};

const getStrengthColor = (strength: number) => {
  if (strength >= 91) return 'strength-complete';
  if (strength >= 61) return 'strength-high';
  if (strength >= 31) return 'strength-medium';
  return 'strength-low';
};

export default function ProfileStrengthBar({ strength, showDetails = true }: ProfileStrengthBarProps) {
  const { t } = useTranslation();
  const badge = getBadgeInfo(strength, t);
  const Icon = badge.icon;
  const strengthColor = getStrengthColor(strength);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${badge.color}`} />
          <span className="font-semibold">{t('profileStrength.title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${strengthColor}`}>{strength}%</span>
          <span className="text-2xl">{badge.emoji}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <Progress value={strength} className="h-3" />
      </div>

      {/* Badge */}
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-white font-semibold ${badge.bgColor}`}>
              {badge.name}
            </div>
          </div>
          <span className="text-muted-foreground">
            {strength < 100 
              ? `${100 - strength}% ${t('profileStrength.remaining')}` 
              : t('profileStrength.complete')
            }
          </span>
        </div>
      )}

      {/* Next Steps */}
      {showDetails && strength < 100 && (
        <div className="bg-gradient-card p-4 rounded-lg border-r-4 border-primary">
          <p className="text-sm font-medium mb-2">{t('profileStrength.boostProfile')}</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {strength < 60 && (
              <li>• {t('profileStrength.verifyIdentity')}</li>
            )}
            {strength < 100 && (
              <li>• {t('profileStrength.answerQuestions')} (+{100 - strength}%)</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
