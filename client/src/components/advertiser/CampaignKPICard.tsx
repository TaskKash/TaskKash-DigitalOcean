import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, CheckCircle2, Target, Clock, ChevronDown, ChevronUp } from 'lucide-react';

// Mock campaign analytics generator
function generateCampaignAnalytics(campaignId: string) {
  const seed = campaignId.charCodeAt(0) || 42;
  const totalTarget = 100 + (seed % 400);
  const completed = Math.floor(totalTarget * (0.3 + (seed % 5) * 0.1));
  const reward = 5 + (seed % 20);
  const commissionRate = 0.15;

  const hourlyData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    completions: Math.max(0, Math.floor(Math.sin((h - 6) / 3) * 8 + (seed % 5))),
  }));

  const genderData = [
    { name: 'Male', value: 55 + (seed % 20), fill: '#3b82f6' },
    { name: 'Female', value: 45 - (seed % 20), fill: '#ec4899' },
  ];

  const ageData = [
    { group: '16–24', count: 30 + (seed % 15) },
    { group: '25–34', count: 40 + (seed % 20) },
    { group: '35–44', count: 20 + (seed % 10) },
    { group: '45+', count: 10 + (seed % 5) },
  ];

  const cityData = [
    { city: 'Cairo', count: 45 + (seed % 20) },
    { city: 'Alexandria', count: 20 + (seed % 10) },
    { city: 'Giza', count: 15 + (seed % 8) },
    { city: 'Other', count: 20 },
  ];

  const tierData = [
    { tier: 'Bronze', count: 40, fill: '#cd7f32' },
    { tier: 'Silver', count: 30, fill: '#9ca3af' },
    { tier: 'Gold', count: 20, fill: '#f59e0b' },
    { tier: 'Platinum', count: 10, fill: '#7c3aed' },
  ];

  const spent = completed * reward * (1 + commissionRate);
  const remaining = totalTarget * reward * (1 + commissionRate) - spent;

  return { totalTarget, completed, reward, commissionRate, hourlyData, genderData, ageData, cityData, tierData, spent, remaining };
}

interface CampaignKPICardProps {
  campaign: { id: string; title: string; status: string; taskCount?: number };
}

export function CampaignKPICard({ campaign }: CampaignKPICardProps) {
  const [expanded, setExpanded] = useState(false);
  const analytics = generateCampaignAnalytics(campaign.id);
  const completionPct = Math.round((analytics.completed / analytics.totalTarget) * 100);

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-base font-semibold truncate">{campaign.title}</CardTitle>
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
              {campaign.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />{analytics.completed}/{analytics.totalTarget} completions</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-blue-500" />${analytics.spent.toFixed(2)} spent</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(e => !e)} className="shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CardHeader>

      {/* Progress Bar */}
      <div className="px-6 pb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span><span>{completionPct}%</span>
        </div>
        <Progress value={completionPct} className="h-2" />
      </div>

      {/* Quick KPIs Row */}
      <div className="grid grid-cols-4 border-t border-gray-100 divide-x divide-gray-100 text-center">
        {[
          { label: 'Reach', value: (analytics.totalTarget * 12).toLocaleString(), icon: Target },
          { label: 'Cost/Task', value: `$${(analytics.reward * (1 + analytics.commissionRate)).toFixed(2)}`, icon: DollarSign },
          { label: 'Remaining', value: `$${analytics.remaining.toFixed(0)}`, icon: Clock },
          { label: 'Commission', value: `$${(analytics.completed * analytics.reward * analytics.commissionRate).toFixed(0)}`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="py-3 px-2">
            <Icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Expanded Analytics */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-6 bg-gray-50">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hourly Trend */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Completions by Hour (Today)</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={analytics.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={5} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completions" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gender Split */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Gender Breakdown</p>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={analytics.genderData} cx="50%" cy="50%" outerRadius={55} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {analytics.genderData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Age Groups */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Age Group Distribution</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={analytics.ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="group" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* City Distribution */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Top Cities</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={analytics.cityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="city" type="category" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Tier Distribution */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Tasker Tier Distribution</p>
            <div className="flex gap-3">
              {analytics.tierData.map(t => (
                <div key={t.tier} className="flex-1 text-center p-3 rounded-lg border bg-white">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1 tier-color-dot" data-color={t.fill}
                    ref={el => { if (el) el.style.backgroundColor = t.fill; }} />
                  <p className="text-xs text-gray-500">{t.tier}</p>
                  <p className="text-sm font-bold">{t.count}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-gray-400 text-xs">Budget Spent</p><p className="font-bold text-green-600">${analytics.spent.toFixed(2)}</p></div>
              <div><p className="text-gray-400 text-xs">Remaining</p><p className="font-bold text-gray-700">${analytics.remaining.toFixed(2)}</p></div>
              <div><p className="text-gray-400 text-xs">Commission Paid</p><p className="font-bold text-blue-600">${(analytics.completed * analytics.reward * analytics.commissionRate).toFixed(2)}</p></div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default CampaignKPICard;
