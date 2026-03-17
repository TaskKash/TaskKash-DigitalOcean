import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Gift, FileText, CheckCircle, AlertCircle, ChevronRight, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function AvailableSurveys() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useApp();
  const isRTL = i18n.language === "ar";

  // API calls
  const availableSurveys = trpc.userSurvey.getAvailableSurveys.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );
  const surveyHistory = trpc.userSurvey.getSurveyHistory.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "basic": return "bg-gray-100 text-gray-800";
      case "professional": return "bg-blue-100 text-blue-800";
      case "enterprise": return "bg-purple-100 text-purple-800";
      case "custom": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">{isRTL ? "مكتمل" : "Completed"}</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">{isRTL ? "قيد التنفيذ" : "In Progress"}</Badge>;
      case "disqualified":
        return <Badge className="bg-red-100 text-red-800">{isRTL ? "غير مؤهل" : "Disqualified"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">{isRTL ? "الاستطلاعات" : "Surveys"}</h1>
          <p className="text-gray-600 mt-1">
            {isRTL ? "أكمل الاستطلاعات واكسب المال" : "Complete surveys and earn money"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="available">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {isRTL ? "متاح" : "Available"} ({availableSurveys.data?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {isRTL ? "السجل" : "History"} ({surveyHistory.data?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Available Surveys */}
          <TabsContent value="available">
            {availableSurveys.isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
              </div>
            ) : availableSurveys.data?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isRTL ? "لا توجد استطلاعات متاحة" : "No Surveys Available"}
                  </h3>
                  <p className="text-gray-500">
                    {isRTL 
                      ? "تحقق مرة أخرى لاحقاً للحصول على استطلاعات جديدة" 
                      : "Check back later for new surveys"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {availableSurveys.data?.map((survey: any) => (
                  <Card key={survey.campaignId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTierBadgeColor(survey.serviceTier)}>
                              {survey.serviceTier}
                            </Badge>
                            {survey.requireKycVerification && (
                              <Badge variant="outline" className="text-xs">
                                {isRTL ? "يتطلب KYC" : "KYC Required"}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold mb-1">
                            {isRTL && survey.titleAr ? survey.titleAr : survey.title}
                          </h3>
                          {survey.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {isRTL && survey.descriptionAr ? survey.descriptionAr : survey.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{survey.totalQuestions} {isRTL ? "سؤال" : "questions"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>~{survey.estimatedDuration} {isRTL ? "دقيقة" : "min"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 text-primary mb-2">
                            <Gift className="h-5 w-5" />
                            <span className="text-2xl font-bold">{survey.userReward}</span>
                            <span className="text-sm">${symbol}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setLocation(`/surveys/${survey.surveyId}/${survey.campaignId}`)}
                          >
                            {isRTL ? "ابدأ" : "Start"}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Survey History */}
          <TabsContent value="history">
            {surveyHistory.isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
              </div>
            ) : surveyHistory.data?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isRTL ? "لا يوجد سجل" : "No History"}
                  </h3>
                  <p className="text-gray-500">
                    {isRTL 
                      ? "ستظهر الاستطلاعات المكتملة هنا" 
                      : "Completed surveys will appear here"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {surveyHistory.data?.map((survey: any) => (
                  <Card key={survey.responseId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(survey.status)}
                            <span className="text-xs text-gray-500">
                              {formatDate(survey.completedAt || survey.startedAt)}
                            </span>
                          </div>
                          <h3 className="font-medium">
                            {isRTL && survey.titleAr ? survey.titleAr : survey.title}
                          </h3>
                          {survey.timeSpentSeconds && (
                            <p className="text-sm text-gray-500 mt-1">
                              {isRTL ? "الوقت المستغرق" : "Time spent"}: {formatDuration(survey.timeSpentSeconds)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {survey.status === "completed" ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-bold">+{survey.userReward} {symbol}</span>
                            </div>
                          ) : survey.status === "disqualified" ? (
                            <div className="flex items-center gap-1 text-red-500">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">{isRTL ? "غير مؤهل" : "Disqualified"}</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/surveys/${survey.surveyId}/${survey.campaignId}`)}
                            >
                              {isRTL ? "متابعة" : "Continue"}
                            </Button>
                          )}
                          {survey.qualityScore && survey.status === "completed" && (
                            <p className="text-xs text-gray-500 mt-1">
                              {isRTL ? "الجودة" : "Quality"}: {(survey.qualityScore * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
