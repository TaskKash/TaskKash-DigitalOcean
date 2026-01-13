import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Users, Eye, CheckCircle, 
  DollarSign, Clock, Target, BarChart3, PieChart, Calendar,
  Download, Filter, RefreshCw, Smartphone, MapPin, UserCheck
} from 'lucide-react';

// Mock data for analytics
const mockCampaignData = {
  id: 1,
  name: 'Samsung Customer Experience Survey',
  status: 'active',
  startDate: '2024-12-01',
  endDate: '2024-12-31',
  budget: 3000,
  spent: 1850,
  reward: 30,
  completions: 62,
  targetCompletions: 100,
  views: 1250,
  started: 180,
  conversionRate: 34.4,
  avgCompletionTime: '4m 32s',
};

const dailyStats = [
  { date: 'Dec 12', completions: 8, views: 120, spent: 240 },
  { date: 'Dec 13', completions: 12, views: 180, spent: 360 },
  { date: 'Dec 14', completions: 6, views: 95, spent: 180 },
  { date: 'Dec 15', completions: 15, views: 210, spent: 450 },
  { date: 'Dec 16', completions: 11, views: 165, spent: 330 },
  { date: 'Dec 17', completions: 10, views: 140, spent: 300 },
];

const demographicsData = {
  gender: { male: 45, female: 52, other: 3 },
  age: { '18-24': 25, '25-34': 35, '35-44': 22, '45-54': 12, '55+': 6 },
  tier: { tier1: 30, tier2: 45, tier3: 25 },
};

const deviceData = {
  brands: { Samsung: 35, Apple: 28, Xiaomi: 18, Huawei: 12, Other: 7 },
  os: { Android: 65, iOS: 35 },
  carriers: { Vodafone: 40, Orange: 30, Etisalat: 20, WE: 10 },
};

const locationData = [
  { city: 'Cairo', completions: 28, percentage: 45 },
  { city: 'Alexandria', completions: 15, percentage: 24 },
  { city: 'Giza', completions: 10, percentage: 16 },
  { city: 'Other', completions: 9, percentage: 15 },
];

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const campaign = mockCampaignData;
  const completionPercentage = (campaign.completions / campaign.targetCompletions) * 100;
  const budgetPercentage = (campaign.spent / campaign.budget) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/advertiser/campaigns">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Campaigns
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Active
                  </span>
                  <span className="text-sm text-gray-500">
                    {campaign.startDate} - {campaign.endDate}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Time Range Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Time Range:</span>
            {['24h', '7d', '30d', 'All'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completions</p>
                  <p className="text-3xl font-bold">{campaign.completions}</p>
                  <p className="text-green-100 text-xs mt-1">
                    of {campaign.targetCompletions} target
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
              <div className="mt-3 bg-green-400/30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Views</p>
                  <p className="text-3xl font-bold text-gray-900">{campaign.views.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 text-xs">+12.5%</span>
                  </div>
                </div>
                <Eye className="w-10 h-10 text-gray-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{campaign.conversionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 text-xs">+3.2%</span>
                  </div>
                </div>
                <Target className="w-10 h-10 text-gray-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Budget Spent</p>
                  <p className="text-3xl font-bold">{campaign.spent.toLocaleString()} EGP</p>
                  <p className="text-amber-100 text-xs mt-1">
                    of {campaign.budget.toLocaleString()} EGP
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-amber-200" />
              </div>
              <div className="mt-3 bg-amber-400/30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2" 
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Started Task</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.started}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Avg. Completion Time</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.avgCompletionTime}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Cost per Completion</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.reward} EGP</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'demographics', label: 'Demographics', icon: Users },
            { id: 'devices', label: 'Devices', icon: Smartphone },
            { id: 'location', label: 'Location', icon: MapPin },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Daily Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailyStats.map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-16">{day.date}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${(day.completions / 20) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">{day.completions}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">{day.spent} EGP</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="bg-blue-100 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">{campaign.views.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">Views</p>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400">▼</div>
                  </div>
                  <div className="relative mx-8">
                    <div className="bg-amber-100 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-amber-700">{campaign.started}</p>
                      <p className="text-sm text-amber-600">Started ({((campaign.started / campaign.views) * 100).toFixed(1)}%)</p>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400">▼</div>
                  </div>
                  <div className="mx-16">
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{campaign.completions}</p>
                      <p className="text-sm text-green-600">Completed ({campaign.conversionRate}%)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(demographicsData.gender).map(([gender, percentage]) => (
                    <div key={gender} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-16 capitalize">{gender}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full ${
                            gender === 'male' ? 'bg-blue-500' : 
                            gender === 'female' ? 'bg-pink-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(demographicsData.age).map(([age, percentage]) => (
                    <div key={age} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-16">{age}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div 
                          className="h-4 rounded-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(demographicsData.tier).map(([tier, percentage]) => (
                    <div key={tier} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-16 capitalize">
                        {tier === 'tier1' ? '🥉 Bronze' : tier === 'tier2' ? '🥈 Silver' : '🥇 Gold'}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full ${
                            tier === 'tier1' ? 'bg-amber-600' : 
                            tier === 'tier2' ? 'bg-gray-400' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device Brands */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  Device Brands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(deviceData.brands).map(([brand, percentage]) => (
                    <div key={brand} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20">{brand}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div 
                          className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* OS Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operating System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8 py-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-green-600">{deviceData.os.Android}%</span>
                    </div>
                    <p className="text-sm text-gray-600">Android</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-gray-600">{deviceData.os.iOS}%</span>
                    </div>
                    <p className="text-sm text-gray-600">iOS</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carriers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mobile Carriers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(deviceData.carriers).map(([carrier, percentage]) => (
                    <div key={carrier} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20">{carrier}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div 
                          className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Completions by City
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locationData.map((loc, index) => (
                    <div key={loc.city} className="flex items-center gap-4">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 flex-1">{loc.city}</span>
                      <div className="w-32 bg-gray-100 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${loc.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{loc.completions} ({loc.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-green-300 mx-auto mb-2" />
                    <p className="text-gray-500">Map visualization</p>
                    <p className="text-sm text-gray-400">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
