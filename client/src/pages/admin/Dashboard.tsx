import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Users, Briefcase, Building2, DollarSign, TrendingUp, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalTasks: 0,
    totalAdvertisers: 0,
    totalTransactions: 0,
    activeUsers: 0,
    completedTasks: 0,
  });

  React.useEffect(() => {
    // Fetch stats - we'll use mock data for now
    // In production, you'd call tRPC endpoints
    setStats({
      totalUsers: 1,
      totalTasks: 0,
      totalAdvertisers: 0,
      totalTransactions: 0,
      activeUsers: 1,
      completedTasks: 0,
    });
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: Briefcase,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Advertisers',
      value: stats.totalAdvertisers,
      icon: Building2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of TASKKASH platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/admin/users"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="font-medium">Manage Users</div>
                <div className="text-sm text-muted-foreground">
                  View and manage all users
                </div>
              </a>
              <a
                href="/admin/tasks"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="font-medium">Manage Tasks</div>
                <div className="text-sm text-muted-foreground">
                  Create and manage tasks
                </div>
              </a>
              <a
                href="/admin/advertisers"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="font-medium">Manage Advertisers</div>
                <div className="text-sm text-muted-foreground">
                  View and manage advertisers
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
