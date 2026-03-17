import { useLocation } from "wouter";
import { useApp } from "../contexts/AppContext";
import { trpc } from "../lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vote, Clock, Gift, ChevronRight, Image } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AvailableVote {
  voteId: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  estimatedDuration: number;
  totalQuestions: number;
  category: string;
  campaignId: number;
  userReward: number;
  targetVotes: number;
  completedVotes: number;
  tierName: string;
  tierDisplayName: string;
}

export default function AvailableVotes() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const isRtl = i18n.language === 'ar';

  const { data: votes, isLoading, error } = trpc["userVote.getAvailableVotes"].useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header with Vote Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-100 rounded-full">
          <Vote className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{isRtl ? 'التصويتات المتاحة' : 'Available Votes'}</h1>
          <p className="text-muted-foreground">
            {isRtl ? 'شارك برأيك واكسب مكافآت' : 'Share your opinion and earn rewards'}
          </p>
        </div>
      </div>

      {/* Vote Cards */}
      {votes && votes.length > 0 ? (
        <div className="space-y-4">
          {votes.map((vote: AvailableVote) => (
            <Card 
              key={`${vote.voteId}-${vote.campaignId}`}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-purple-300"
              onClick={() => setLocation(`/votes/${vote.voteId}/${vote.campaignId}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Vote Icon */}
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Image className="h-6 w-6 text-purple-600" />
                    </div>

                    {/* Vote Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {isRtl ? vote.titleAr || vote.title : vote.title}
                        </h3>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {vote.tierDisplayName}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {isRtl ? vote.descriptionAr || vote.description : vote.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {vote.estimatedDuration} {isRtl ? 'دقائق' : 'min'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Vote className="h-4 w-4" />
                          {vote.totalQuestions} {isRtl ? 'أسئلة' : 'questions'}
                        </span>
                        <span className="text-xs">
                          {vote.completedVotes}/{vote.targetVotes} {isRtl ? 'تصويت' : 'votes'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reward & Action */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                      <Gift className="h-5 w-5" />
                      {vote.userReward} {symbol}
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      {isRtl ? 'صوّت الآن' : 'Vote Now'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${Math.min((vote.completedVotes / vote.targetVotes) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {Math.round((vote.completedVotes / vote.targetVotes) * 100)}% {isRtl ? 'مكتمل' : 'complete'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Vote className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {isRtl ? 'لا توجد تصويتات متاحة' : 'No Votes Available'}
            </h3>
            <p className="text-muted-foreground">
              {isRtl 
                ? 'تحقق مرة أخرى لاحقاً للحصول على فرص تصويت جديدة'
                : 'Check back later for new voting opportunities'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Vote History Link */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => setLocation('/votes/history')}>
          {isRtl ? 'عرض سجل التصويتات' : 'View Vote History'}
        </Button>
      </div>
    </div>
  );
}
