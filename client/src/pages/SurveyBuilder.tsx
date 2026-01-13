import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Save, Eye, Rocket, ArrowLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Question {
  id?: number;
  questionText: string;
  questionTextAr?: string;
  questionType: string;
  options?: { text: string; value?: string }[];
  optionsAr?: { text: string; value?: string }[];
  isRequired: boolean;
}

export default function SurveyBuilder() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useApp();
  const isRTL = i18n.language === "ar";

  // Survey state
  const [surveyId, setSurveyId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [serviceTier, setServiceTier] = useState<string>("basic");
  const [estimatedDuration, setEstimatedDuration] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  // Question dialog state
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Question>({
    questionText: "",
    questionTextAr: "",
    questionType: "single_choice",
    options: [{ text: "" }, { text: "" }],
    optionsAr: [{ text: "" }, { text: "" }],
    isRequired: true,
  });

  // API calls
  const pricingTiers = trpc.surveyManagement.getPricingTiers.useQuery();
  const createSurvey = trpc.surveyManagement.createSurvey.useMutation();
  const addQuestion = trpc.surveyManagement.addQuestion.useMutation();
  const deleteQuestion = trpc.surveyManagement.deleteQuestion.useMutation();
  const getSurvey = trpc.surveyManagement.getSurvey.useQuery(
    { surveyId: surveyId! },
    { enabled: !!surveyId }
  );

  // Load existing survey if editing
  useEffect(() => {
    if (getSurvey.data) {
      setTitle(getSurvey.data.survey.title);
      setTitleAr(getSurvey.data.survey.titleAr || "");
      setDescription(getSurvey.data.survey.description || "");
      setDescriptionAr(getSurvey.data.survey.descriptionAr || "");
      setServiceTier(getSurvey.data.survey.serviceTier);
      setEstimatedDuration(getSurvey.data.survey.estimatedDuration || 5);
      setQuestions(getSurvey.data.questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        questionTextAr: q.questionTextAr,
        questionType: q.questionType,
        options: q.options ? JSON.parse(q.options) : [],
        optionsAr: q.optionsAr ? JSON.parse(q.optionsAr) : [],
        isRequired: q.isRequired,
      })));
    }
  }, [getSurvey.data]);

  const handleSaveSurvey = async () => {
    if (!title) return;

    try {
      if (!surveyId) {
        const result = await createSurvey.mutateAsync({
          advertiserId: user?.advertiserId || 1,
          title,
          titleAr: titleAr || undefined,
          description: description || undefined,
          descriptionAr: descriptionAr || undefined,
          serviceTier: serviceTier as any,
          estimatedDuration,
        });
        setSurveyId(result.surveyId);
        setActiveTab("questions");
      }
    } catch (error) {
      console.error("Error saving survey:", error);
    }
  };

  const handleAddQuestion = async () => {
    if (!surveyId || !newQuestion.questionText) return;

    try {
      await addQuestion.mutateAsync({
        surveyId,
        questionText: newQuestion.questionText,
        questionTextAr: newQuestion.questionTextAr || undefined,
        questionType: newQuestion.questionType as any,
        options: newQuestion.options?.filter(o => o.text),
        optionsAr: newQuestion.optionsAr?.filter(o => o.text),
        isRequired: newQuestion.isRequired,
      });

      getSurvey.refetch();
      setShowQuestionDialog(false);
      setNewQuestion({
        questionText: "",
        questionTextAr: "",
        questionType: "single_choice",
        options: [{ text: "" }, { text: "" }],
        optionsAr: [{ text: "" }, { text: "" }],
        isRequired: true,
      });
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteQuestion.mutateAsync({ questionId });
      getSurvey.refetch();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...(newQuestion.options || []), { text: "" }],
      optionsAr: [...(newQuestion.optionsAr || []), { text: "" }],
    });
  };

  const removeOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options?.filter((_, i) => i !== index),
      optionsAr: newQuestion.optionsAr?.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, text: string, isArabic: boolean = false) => {
    if (isArabic) {
      const newOptionsAr = [...(newQuestion.optionsAr || [])];
      newOptionsAr[index] = { text };
      setNewQuestion({ ...newQuestion, optionsAr: newOptionsAr });
    } else {
      const newOptions = [...(newQuestion.options || [])];
      newOptions[index] = { text };
      setNewQuestion({ ...newQuestion, options: newOptions });
    }
  };

  const questionTypes = [
    { value: "single_choice", label: "Single Choice", labelAr: "اختيار واحد" },
    { value: "multiple_choice", label: "Multiple Choice", labelAr: "اختيار متعدد" },
    { value: "open_text", label: "Open Text", labelAr: "نص مفتوح" },
    { value: "rating_scale", label: "Rating Scale (1-5)", labelAr: "مقياس التقييم (1-5)" },
    { value: "nps", label: "NPS (0-10)", labelAr: "صافي نقاط الترويج (0-10)" },
    { value: "slider", label: "Slider", labelAr: "شريط التمرير" },
  ];

  const selectedTier = pricingTiers.data?.find((t: any) => t.tierName === serviceTier);

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/advertiser/surveys")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {surveyId ? (isRTL ? "تعديل الاستطلاع" : "Edit Survey") : (isRTL ? "إنشاء استطلاع جديد" : "Create New Survey")}
            </h1>
            {surveyId && <p className="text-sm text-gray-500">ID: {surveyId}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            {isRTL ? "معاينة" : "Preview"}
          </Button>
          {surveyId && questions.length > 0 && (
            <Button size="sm" onClick={() => setLocation(`/advertiser/surveys/${surveyId}/launch`)}>
              <Rocket className="h-4 w-4 mr-2" />
              {isRTL ? "إطلاق الحملة" : "Launch Campaign"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">{isRTL ? "التفاصيل" : "Details"}</TabsTrigger>
            <TabsTrigger value="questions" disabled={!surveyId}>
              {isRTL ? "الأسئلة" : "Questions"} ({questions.length})
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={!surveyId}>
              {isRTL ? "الإعدادات" : "Settings"}
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "معلومات الاستطلاع" : "Survey Information"}</CardTitle>
                <CardDescription>
                  {isRTL ? "أدخل المعلومات الأساسية للاستطلاع" : "Enter the basic information for your survey"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Tier Selection */}
                <div className="space-y-2">
                  <Label>{isRTL ? "مستوى الخدمة" : "Service Tier"}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {pricingTiers.data?.map((tier: any) => (
                      <Card
                        key={tier.tierName}
                        className={`cursor-pointer transition-all ${
                          serviceTier === tier.tierName
                            ? "border-primary ring-2 ring-primary/20"
                            : "hover:border-gray-300"
                        }`}
                        onClick={() => setServiceTier(tier.tierName)}
                      >
                        <CardContent className="p-3 text-center">
                          <p className="font-medium text-sm">{isRTL ? tier.displayNameAr : tier.displayName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {tier.minPricePerComplete}-{tier.maxPricePerComplete} EGP
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {isRTL ? "مكافأة المستخدم" : "User Reward"}: {tier.defaultUserReward} EGP
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {selectedTier && (
                    <p className="text-sm text-gray-600 mt-2">
                      {isRTL ? selectedTier.descriptionAr : selectedTier.description}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{isRTL ? "العنوان (إنجليزي)" : "Title (English)"} *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter survey title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleAr">{isRTL ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                    <Input
                      id="titleAr"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder="أدخل عنوان الاستطلاع"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">{isRTL ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter survey description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">{isRTL ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                    <Textarea
                      id="descriptionAr"
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      placeholder="أدخل وصف الاستطلاع"
                      dir="rtl"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Estimated Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">{isRTL ? "المدة المقدرة (دقائق)" : "Estimated Duration (minutes)"}</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={60}
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 5)}
                    className="w-32"
                  />
                </div>

                <Button onClick={handleSaveSurvey} disabled={!title || createSurvey.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {surveyId
                    ? (isRTL ? "حفظ التغييرات" : "Save Changes")
                    : (isRTL ? "إنشاء الاستطلاع" : "Create Survey")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{isRTL ? "أسئلة الاستطلاع" : "Survey Questions"}</CardTitle>
                  <CardDescription>
                    {isRTL ? "أضف وأدر أسئلة الاستطلاع" : "Add and manage your survey questions"}
                  </CardDescription>
                </div>
                <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {isRTL ? "إضافة سؤال" : "Add Question"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{isRTL ? "إضافة سؤال جديد" : "Add New Question"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Question Type */}
                      <div className="space-y-2">
                        <Label>{isRTL ? "نوع السؤال" : "Question Type"}</Label>
                        <Select
                          value={newQuestion.questionType}
                          onValueChange={(value) => setNewQuestion({ ...newQuestion, questionType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {isRTL ? type.labelAr : type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Question Text */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{isRTL ? "نص السؤال (إنجليزي)" : "Question Text (English)"} *</Label>
                          <Textarea
                            value={newQuestion.questionText}
                            onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                            placeholder="Enter your question"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isRTL ? "نص السؤال (عربي)" : "Question Text (Arabic)"}</Label>
                          <Textarea
                            value={newQuestion.questionTextAr}
                            onChange={(e) => setNewQuestion({ ...newQuestion, questionTextAr: e.target.value })}
                            placeholder="أدخل السؤال"
                            dir="rtl"
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Options (for choice questions) */}
                      {(newQuestion.questionType === "single_choice" || newQuestion.questionType === "multiple_choice") && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>{isRTL ? "الخيارات" : "Options"}</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addOption}>
                              <Plus className="h-3 w-3 mr-1" />
                              {isRTL ? "إضافة خيار" : "Add Option"}
                            </Button>
                          </div>
                          {newQuestion.options?.map((option, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                              <Input
                                value={option.text}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                              />
                              <Input
                                value={newQuestion.optionsAr?.[index]?.text || ""}
                                onChange={(e) => updateOption(index, e.target.value, true)}
                                placeholder={`الخيار ${index + 1}`}
                                dir="rtl"
                                className="flex-1"
                              />
                              {(newQuestion.options?.length || 0) > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Required Toggle */}
                      <div className="flex items-center justify-between">
                        <Label>{isRTL ? "سؤال إلزامي" : "Required Question"}</Label>
                        <Switch
                          checked={newQuestion.isRequired}
                          onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, isRequired: checked })}
                        />
                      </div>

                      <Button onClick={handleAddQuestion} className="w-full" disabled={!newQuestion.questionText}>
                        {isRTL ? "إضافة السؤال" : "Add Question"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>{isRTL ? "لم تتم إضافة أسئلة بعد" : "No questions added yet"}</p>
                    <p className="text-sm mt-1">
                      {isRTL ? "انقر على 'إضافة سؤال' للبدء" : "Click 'Add Question' to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <Card key={question.id || index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 text-gray-400">
                              <GripVertical className="h-5 w-5 cursor-move" />
                              <span className="font-medium">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{question.questionText}</p>
                              {question.questionTextAr && (
                                <p className="text-sm text-gray-600 mt-1" dir="rtl">{question.questionTextAr}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">
                                  {questionTypes.find(t => t.value === question.questionType)?.label}
                                </Badge>
                                {question.isRequired && (
                                  <Badge variant="secondary">{isRTL ? "إلزامي" : "Required"}</Badge>
                                )}
                                {question.options && question.options.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {question.options.length} {isRTL ? "خيارات" : "options"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => question.id && handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "إعدادات الاستطلاع" : "Survey Settings"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  {isRTL 
                    ? "سيتم تكوين الإعدادات المتقدمة عند إطلاق الحملة"
                    : "Advanced settings will be configured when launching the campaign"}
                </p>
                {questions.length > 0 && (
                  <Button 
                    className="mt-4"
                    onClick={() => setLocation(`/advertiser/surveys/${surveyId}/launch`)}
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    {isRTL ? "المتابعة لإطلاق الحملة" : "Continue to Campaign Launch"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
