import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  Edit,
  Camera,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function AdvertiserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "شركة التسويق الرقمي",
    email: "info@digitalmarketing.com",
    phone: "+20 123 456 7890",
    website: "www.digitalmarketing.com",
    address: "القاهرة، مصر",
    description:
      "شركة رائدة في مجال التسويق الرقمي وإدارة الحملات الإعلانية. نقدم حلول تسويقية مبتكرة للشركات والعلامات التجارية.",
    industry: "التسويق والإعلان",
    foundedYear: "2020",
  });

  const stats = {
    totalCampaigns: 24,
    activeCampaigns: 8,
    totalSpent: 125000,
    totalTasks: 1250,
    successRate: 94,
    avgRating: 4.8,
  };

  const handleSave = () => {
    // Here you would typically save to backend
    toast.success("تم حفظ التغييرات بنجاح");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
            <p className="text-gray-600 mt-1">إدارة معلومات حسابك وإعداداتك</p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Edit className="ml-2 h-4 w-4" />
              تعديل الملف
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} variant="default">
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src="/placeholder-company.png" />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      ش ت
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                      variant="secondary"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Award className="ml-1 h-3 w-3" />
                  معلن موثوق
                </Badge>
              </div>

              {/* Company Info */}
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">اسم الشركة</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({ ...formData, companyName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">المجال</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">الموقع الإلكتروني</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="foundedYear">سنة التأسيس</Label>
                      <Input
                        id="foundedYear"
                        value={formData.foundedYear}
                        onChange={(e) =>
                          setFormData({ ...formData, foundedYear: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">نبذة عن الشركة</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {formData.companyName}
                      </h2>
                      <p className="text-gray-600">{formData.industry}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{formData.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{formData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span>{formData.website}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>تأسست عام {formData.foundedYear}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{formData.address}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        نبذة عن الشركة
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {formData.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي الحملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalCampaigns}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {stats.activeCampaigns} نشطة
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي المهام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalTasks.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    نسبة النجاح {stats.successRate}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي الإنفاق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalSpent.toLocaleString()} ج.م
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    تقييم {stats.avgRating}/5.0
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>حالة الحساب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">حالة التحقق</p>
                  <p className="text-sm text-gray-600">تم التحقق من الحساب</p>
                </div>
                <Badge className="bg-green-100 text-green-800">موثق</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">نوع الحساب</p>
                  <p className="text-sm text-gray-600">حساب أعمال متميز</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">تاريخ الانضمام</p>
                  <p className="text-sm text-gray-600">15 يناير 2024</p>
                </div>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">آخر نشاط</p>
                  <p className="text-sm text-gray-600">منذ ساعتين</p>
                </div>
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
