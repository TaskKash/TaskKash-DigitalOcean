import { CheckCircle, Circle, Clock } from 'lucide-react';

export interface TaskStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedDuration: number; // بالدقائق
  completedAt?: Date;
}

export interface TaskProgress {
  taskId: string;
  currentStep: number;
  totalSteps: number;
  steps: TaskStep[];
  startedAt: Date;
  estimatedCompletion: Date;
}

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  steps: TaskStep[];
}

export function ProgressTracker({ currentStep, totalSteps, steps }: ProgressTrackerProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">📋 التقدم في المهمة</h3>
        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {currentStep}/{totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                index + 1 < currentStep
                  ? 'bg-emerald-500 border-emerald-500'
                  : index + 1 === currentStep
                  ? 'bg-white border-orange-500 ring-2 ring-orange-200'
                  : 'bg-white border-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <StepIndicator
            key={step.id}
            step={step}
            isActive={index + 1 === currentStep}
            isCompleted={index + 1 < currentStep}
            stepNumber={index + 1}
          />
        ))}
      </div>

      {/* Estimated Time */}
      {currentStep < totalSteps && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">الوقت المتوقع للإكمال:</span>
            <span className="font-medium text-orange-600">
              {steps
                .slice(currentStep - 1)
                .reduce((sum, step) => sum + step.estimatedDuration, 0)}{' '}
              دقيقة
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface StepIndicatorProps {
  step: TaskStep;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
}

function StepIndicator({ step, isActive, isCompleted, stepNumber }: StepIndicatorProps) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
        isActive ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200' : ''
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        ) : isActive ? (
          <div className="relative">
            <Clock className="w-6 h-6 text-orange-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
          </div>
        ) : (
          <Circle className="w-6 h-6 text-gray-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            الخطوة {stepNumber}
          </span>
          {isActive && (
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              جاري التنفيذ
            </span>
          )}
          {isCompleted && (
            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              مكتملة
            </span>
          )}
        </div>
        <h4
          className={`font-medium mb-1 ${
            isActive ? 'text-orange-700' : isCompleted ? 'text-emerald-700' : 'text-gray-500'
          }`}
        >
          {step.title}
        </h4>
        <p className="text-sm text-muted-foreground">{step.description}</p>
        {isActive && step.estimatedDuration > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Clock className="w-3 h-3 text-orange-600" />
            <p className="text-xs text-orange-600 font-medium">
              الوقت المتوقع: {step.estimatedDuration} دقيقة
            </p>
          </div>
        )}
        {isCompleted && step.completedAt && (
          <p className="text-xs text-emerald-600 mt-1">
            ✓ تم الإكمال في {new Date(step.completedAt).toLocaleString('ar-EG')}
          </p>
        )}
      </div>
    </div>
  );
}
