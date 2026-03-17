import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Users, Eye, CheckCircle, 
  DollarSign, Clock, Target, BarChart3, PieChart, Calendar,
  Download, Filter, RefreshCw, Smartphone, MapPin, UserCheck
} from 'lucide-react';

const demographicsData = {
  gender: { male: 55, female: 45 },
  age: { '18-24': 30, '25-34': 40, '35-44': 20, '45+': 10 },
  tier: { tier1: 40, tier2: 30, tier3: 30 }
};

const deviceData = {
  brands: { Samsung: 45, Apple: 25, Xiaomi: 15, Oppo: 10, Other: 5 },
  os: { Android: 70, iOS: 30 },
  carriers: { Vodafone: 40, Orange: 30, Etisalat: 20, WE: 10 }
};

const locationData = [
  { city: 'Cairo', completions: 12500, percentage: 45 },
  { city: 'Alexandria', completions: 5500, percentage: 20 },
  { city: 'Giza', completions: 4500, percentage: 15 },
  { city: 'Mansoura', completions: 2000, percentage: 8 },
  { city: 'Other', completions: 3500, percentage: 12 },
];

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewRes, perfRes] = await Promise.all([
          fetch('/api/advertiser/analytics/overview'),
          fetch(`/api/advertiser/analytics/performance?days=${timeRange.replace('d', '')}`)
        ]);
        
        if (overviewRes.ok && perfRes.ok) {
          setOverview(await overviewRes.json());
          setPerformance(await perfRes.json());
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return <div className="p-8 text-center bg-gray-50 min-h-screen">Loading analytics data...</div>;
  }
  
  if (!overview) {
    return <div className="p-8 text-center bg-gray-50 min-h-screen">Failed to load analytics</div>;
  }

  const completionPercentage = overview.completionRate;
  const budgetPercentage = overview.tasksAssigned > 0 ? (overview.tasksCompleted / overview.tasksAssigned) * 100 : 0;

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
                <h1 className="text-xl font-bold text-gray-900">Analytics Overview</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {overview.totalCampaigns} Campaigns
                  </span>
                  <span className="text-sm text-gray-500">
                    All Active Data
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
                  <p className="text-green-100 text-sm">Tasks Completed</p>
                  <p className="text-3xl font-bold">{overview.tasksCompleted.toLocaleString()}</p>
                  <p className="text-green-100 text-xs mt-1">
                    of {overview.tasksAssigned.toLocaleString()} total
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
              <div className="mt-3 bg-green-400/30 rounded-full h-2">
                <style>{`.w-dyn-ovw-cmp { width: ${Math.min(100, overview.completionRate)}%; }`}</style>
                <div className="bg-white rounded-full h-2 w-dyn-ovw-cmp" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Audience Reached</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.audienceReached.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 text-xs text-muted-foreground mr-1">unique users</span>
                  </div>
                </div>
                <Users className="w-10 h-10 text-gray-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.completionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Target className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 text-xs">average</span>
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
                  <p className="text-amber-100 text-sm">Total Spend</p>
                  <p className="text-3xl font-bold">{overview.totalSpend.toLocaleString()} EGP</p>
                  <p className="text-amber-100 text-xs mt-1">
                    across {overview.totalCampaigns} campaigns
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-amber-200" />
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
                  {performance.slice(0, 10).map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-16">{day.date}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <style>{`.w-dyn-prf-${day.date.replace(/\\D/g, '')} { width: ${Math.max(10, Math.min(100, (day.completions / Math.max(1, Math.max(...performance.map(p => p.completions)))) * 100))}%; }`}</style>
                        <div className={`absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-end pr-2 w-dyn-prf-${day.date.replace(/\\D/g, '')}`}>
                          <span className="text-xs text-white font-medium pl-2">{day.completions}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">{day.spent} EGP</span>
                    </div>
                  ))}
                  {performance.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">No performance data yet</div>
                  )}
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
                      <p className="text-2xl font-bold text-blue-700">{overview.tasksAssigned.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">Tasks Required</p>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400">▼</div>
                  </div>
                  <div className="relative mx-8">
                    <div className="bg-amber-100 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-amber-700">{overview.audienceReached}</p>
                      <p className="text-sm text-amber-600">Unique Users Reached</p>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400">▼</div>
                  </div>
                  <div className="mx-16">
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{overview.tasksCompleted}</p>
                      <p className="text-sm text-green-600">Tasks Completed ({overview.completionRate}%)</p>
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
                        <style>{`.w-dyn-gnd-${gender} { width: ${percentage}%; }`}</style>
                        <div className={`h-4 rounded-full w-dyn-gnd-${gender} ${
                            gender === 'male' ? 'bg-blue-500' : 
                            gender === 'female' ? 'bg-pink-500' : 'bg-gray-400'
                          }`} />
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
                        <style>{`.w-dyn-age-${age.replace(/[^a-zA-Z0-9]/g, '')} { width: ${percentage}%; }`}</style>
                        <div className={`h-4 rounded-full bg-gradient-to-r from-green-500 to-green-400 w-dyn-age-${age.replace(/[^a-zA-Z0-9]/g, '')}`} />
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
                        <style>{`.w-dyn-tier-${tier} { width: ${percentage}%; }`}</style>
                        <div className={`h-4 rounded-full w-dyn-tier-${tier} ${
                            tier === 'tier1' ? 'bg-amber-600' : 
                            tier === 'tier2' ? 'bg-gray-400' : 'bg-yellow-500'
                          }`} />
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
                        <style>{`.w-dyn-brand-${brand.replace(/\\s+/g, '-')} { width: ${percentage}%; }`}</style>
                        <div className={`h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 w-dyn-brand-${brand.replace(/\\s+/g, '-')}`} />
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
                        <style>{`.w-dyn-carrier-${carrier.replace(/\\s+/g, '-')} { width: ${percentage}%; }`}</style>
                        <div className={`h-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 w-dyn-carrier-${carrier.replace(/\\s+/g, '-')}`} />
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
                        <style>{`.w-dyn-loc-${index} { width: ${loc.percentage}%; }`}</style>
                        <div className={`h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400 w-dyn-loc-${index}`} />
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
