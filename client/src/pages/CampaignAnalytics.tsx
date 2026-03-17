import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  ArrowLeft,
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  BarChart3,
  PieChart
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Funnel,
  FunnelChart,
  LabelList
} from "recharts";

interface AnalyticsData {
  campaign: any;
  kpis: {
    totalStarted: number;
    totalCompleted: number;
    totalDisqualified: number;
    conversionRate: string;
    costPerCompletion: string;
    totalSpent: number;
    budgetUtilization: string;
  };
  funnelData: any[];
  demographics: any[];
  dailyPerformance: any[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function CampaignAnalytics() {
  const { currency, symbol, formatAmount } = useCurrency();
  const params = useParams();
  const campaignId = params.id;
  const [, setLocation] = useLocation();

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: [`/api/advertiser/campaigns/${campaignId}/analytics`],
    enabled: !!campaignId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const campaign = analyticsData?.campaign;
  const kpis = analyticsData?.kpis;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => setLocation("/advertiser/campaigns")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{campaign?.nameEn || "Campaign Analytics"}</h1>
              <p className="text-purple-100 mt-1">
                Detailed performance metrics and insights
              </p>
            </div>
            <Badge 
              className={`${
                campaign?.status === 'active' 
                  ? 'bg-green-500' 
                  : campaign?.status === 'completed'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              } text-white`}
            >
              {campaign?.status?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Started</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {kpis?.totalStarted?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {kpis?.totalCompleted?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {kpis?.conversionRate || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cost Per Completion</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {kpis?.costPerCompletion || 0} {symbol}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Spent: {kpis?.totalSpent?.toLocaleString() || 0} {symbol}</span>
                <span>Budget: {campaign?.budget?.toLocaleString() || 0} {symbol}</span>
              </div>
              <Progress value={parseFloat(kpis?.budgetUtilization || "0")} className="h-3" />
              <p className="text-sm text-gray-500 text-center">
                {kpis?.budgetUtilization || 0}% of budget utilized
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campaign Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Campaign Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.funnelData?.map((step: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {index + 1}. {step.taskTitle}
                      </span>
                      <span className="text-gray-500">
                        {step.completed}/{step.started} ({step.started > 0 ? ((step.completed / step.started) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <Progress 
                      value={step.started > 0 ? (step.completed / step.started) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
                {(!analyticsData?.funnelData || analyticsData.funnelData.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No funnel data available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Audience Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {analyticsData?.demographics && analyticsData.demographics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.demographics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="ageGroup"
                      >
                        {analyticsData.demographics.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No demographic data available yet</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Daily Performance (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analyticsData?.dailyPerformance && analyticsData.dailyPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.dailyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="starts" fill="#3b82f6" name="Started" />
                    <Bar dataKey="completions" fill="#10b981" name="Completed" />
                    <Bar dataKey="disqualifications" fill="#ef4444" name="Disqualified" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No performance data available yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
