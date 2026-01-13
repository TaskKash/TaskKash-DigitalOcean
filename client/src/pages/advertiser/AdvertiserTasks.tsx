import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useLocation } from "wouter";

interface Task {
  id: string;
  title: string;
  campaignName: string;
  status: "pending" | "approved" | "rejected" | "in_review";
  submittedBy: string;
  submittedAt: string;
  reward: number;
  completionTime: string;
}

export default function AdvertiserTasks() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - replace with actual API call
  const tasks: Task[] = [
    {
      id: "1",
      title: "مشاهدة فيديو ترويجي للمنتج",
      campaignName: "حملة المنتج الجديد",
      status: "pending",
      submittedBy: "أحمد محمد",
      submittedAt: "2024-01-15 14:30",
      reward: 25,
      completionTime: "5 دقائق",
    },
    {
      id: "2",
      title: "استبيان رأي حول الخدمة",
      campaignName: "تحسين تجربة المستخدم",
      status: "approved",
      submittedBy: "فاطمة علي",
      submittedAt: "2024-01-15 13:20",
      reward: 30,
      completionTime: "8 دقائق",
    },
    {
      id: "3",
      title: "تقييم تطبيق الموبايل",
      campaignName: "إطلاق التطبيق",
      status: "in_review",
      submittedBy: "محمود حسن",
      submittedAt: "2024-01-15 12:10",
      reward: 20,
      completionTime: "3 دقائق",
    },
    {
      id: "4",
      title: "مشاركة منشور على وسائل التواصل",
      campaignName: "حملة التسويق الرقمي",
      status: "rejected",
      submittedBy: "سارة أحمد",
      submittedAt: "2024-01-15 11:00",
      reward: 15,
      completionTime: "2 دقيقة",
    },
    {
      id: "5",
      title: "كتابة مراجعة للمنتج",
      campaignName: "جمع آراء العملاء",
      status: "approved",
      submittedBy: "خالد يوسف",
      submittedAt: "2024-01-15 10:45",
      reward: 40,
      completionTime: "10 دقائق",
    },
  ];

  const getStatusBadge = (status: Task["status"]) => {
    const statusConfig = {
      pending: { label: "قيد الانتظار", variant: "secondary" as const },
      approved: { label: "مقبول", variant: "default" as const },
      rejected: { label: "مرفوض", variant: "destructive" as const },
      in_review: { label: "قيد المراجعة", variant: "outline" as const },
    };
    return statusConfig[status];
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    approved: tasks.filter((t) => t.status === "approved").length,
    rejected: tasks.filter((t) => t.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة المهام</h1>
            <p className="text-gray-600 mt-1">
              عرض ومراجعة جميع المهام المقدمة من المستخدمين
            </p>
          </div>
          <Button
            onClick={() => setLocation("/advertiser/tasks/review")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Eye className="ml-2 h-4 w-4" />
            مراجعة المهام
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-t-4 border-t-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المهام</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد الانتظار</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مقبول</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مرفوض</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث عن مهمة، حملة، أو مستخدم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_review">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المهام ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد مهام مطابقة للبحث</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {task.campaignName}
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {task.submittedBy}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {task.submittedAt}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {task.completionTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {task.reward} ج.م
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusBadge(task.status).variant}>
                          {getStatusBadge(task.status).label}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setLocation(`/advertiser/tasks/${task.id}/review`)
                          }
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          عرض
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
