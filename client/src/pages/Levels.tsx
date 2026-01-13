import { useState, useEffect } from 'react';
import { TrendingUp, Award, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Level {
  id: number;
  name: string;
  minTasks: number;
  minEarnings: number;
  rewardMultiplier: number;
  benefits: any;
  badgeIcon: string;
  color: string;
}

interface LevelProgress {
  currentLevel: {
    id: number;
    name: string;
    icon: string;
    color: string;
    multiplier: number;
  };
  nextLevel: Level | null;
  progress: {
    currentTasks: number;
    requiredTasks: number;
    currentEarnings: number;
    requiredEarnings: number;
    percentage: number;
  } | null;
}

export default function Levels() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [progress, setProgress] = useState<LevelProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLevelData();
  }, []);

  const loadLevelData = async () => {
    try {
      const [levelsRes, progressRes] = await Promise.all([
        fetch('/api/levels'),
        fetch('/api/levels/my-progress')
      ]);

      const levelsData = await levelsRes.json();
      const progressData = await progressRes.json();

      setLevels(levelsData.levels || []);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading level data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Levels</h1>
        <p className="text-muted-foreground">
          Complete tasks and earn money to level up and unlock exclusive benefits
        </p>
      </div>

      {/* Current Level Card */}
      {progress && (
        <Card className="mb-8" style={{ borderColor: progress.currentLevel.color }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-3xl">{progress.currentLevel.icon}</span>
                  <span>Your Current Level: {progress.currentLevel.name}</span>
                </CardTitle>
                <CardDescription>
                  Earning {((progress.currentLevel.multiplier - 1) * 100).toFixed(0)}% bonus on all tasks
                </CardDescription>
              </div>
              <Award className="h-12 w-12" style={{ color: progress.currentLevel.color }} />
            </div>
          </CardHeader>
          
          {progress.nextLevel && progress.progress && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress to {progress.nextLevel.name}</span>
                    <span className="text-muted-foreground">{progress.progress.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress.progress.percentage} className="h-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Tasks Completed</p>
                    <p className="text-2xl font-bold">
                      {progress.progress.currentTasks} / {progress.progress.requiredTasks}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold">
                      {progress.progress.currentEarnings.toFixed(0)} / {progress.progress.requiredEarnings.toFixed(0)} EGP
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* All Levels */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">All Levels</h2>
        
        {levels.map((level) => {
          const isCurrentLevel = progress?.currentLevel.id === level.id;
          const isUnlocked = progress && progress.currentLevel.id >= level.id;
          const bonusPercent = ((level.rewardMultiplier - 1) * 100).toFixed(0);

          return (
            <Card 
              key={level.id} 
              className={`${isCurrentLevel ? 'ring-2' : ''} ${!isUnlocked ? 'opacity-60' : ''}`}
              style={isCurrentLevel ? { borderColor: level.color } : {}}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="text-5xl p-3 rounded-lg"
                      style={{ backgroundColor: `${level.color}20` }}
                    >
                      {level.badgeIcon}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {level.name}
                        {isCurrentLevel && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                        {!isUnlocked && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        {bonusPercent}% bonus rewards • {level.minTasks} tasks • {level.minEarnings} EGP earned
                      </CardDescription>
                    </div>
                  </div>
                  <TrendingUp className="h-6 w-6" style={{ color: level.color }} />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Benefits:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Earn {bonusPercent}% more on every task</li>
                    {level.id >= 2 && <li>Priority customer support</li>}
                    {level.id >= 3 && <li>Access to exclusive high-paying tasks</li>}
                    {level.id >= 4 && <li>Faster withdrawal processing</li>}
                    {level.id >= 5 && <li>Dedicated account manager</li>}
                  </ul>
                </div>

                {!isUnlocked && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Requirements to unlock:</p>
                    <p className="text-sm text-muted-foreground">
                      Complete {level.minTasks} tasks and earn {level.minEarnings} EGP total
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
