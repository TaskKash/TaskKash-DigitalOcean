import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useApp } from "../contexts/AppContext";
import { trpc } from "../lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Vote, Plus, Trash2, Image, ArrowRight, CheckCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PricingTier {
  id: number;
  tierName: string;
  displayName: string;
  displayNameAr: string;
  description: string;
  descriptionAr: string;
  minPricePerVote: number;
  maxPricePerVote: number;
  defaultUserReward: number;
  minQuestions: number;
  maxQuestions: number;
  minOptions: number;
  maxOptions: number;
  features: string;
}

interface QuestionOption {
  optionText: string;
  optionTextAr: string;
  imageUrl: string;
}

interface Question {
  questionText: string;
  questionTextAr: string;
  sectionTitle: string;
  sectionTitleAr: string;
  questionType: 'single_choice' | 'multiple_choice' | 'ranking' | 'slider';
  options: QuestionOption[];
}

export default function VoteBuilder() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const isRtl = i18n.language === 'ar';

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [category, setCategory] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [createdVoteId, setCreatedVoteId] = useState<number | null>(null);

  // Fetch pricing tiers
  const { data: pricingTiers, isLoading: tiersLoading } = trpc["voteManagement.getPricingTiers"].useQuery();

  // Mutations
  const createVoteMutation = trpc["voteManagement.createVote"].useMutation();
  const addQuestionMutation = trpc["voteManagement.addQuestion"].useMutation();

  const selectedTier = pricingTiers?.find((t: PricingTier) => t.id === selectedTierId);

  const handleSelectTier = (tierId: number) => {
    setSelectedTierId(tierId);
    setCurrentStep(2);
  };

  const handleCreateVote = async () => {
    if (!selectedTierId || !title) return;

    try {
      const result = await createVoteMutation.mutateAsync({
        pricingTierId: selectedTierId,
        title,
        titleAr: titleAr || undefined,
        description: description || undefined,
        descriptionAr: descriptionAr || undefined,
        category: category || undefined,
        estimatedDuration: 2,
        successThreshold: 60,
      });

      setCreatedVoteId(result.voteId);
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to create vote:", error);
    }
  };

  const addQuestion = () => {
    if (!selectedTier) return;
    if (questions.length >= selectedTier.maxQuestions) return;

    setQuestions([...questions, {
      questionText: "",
      questionTextAr: "",
      sectionTitle: "",
      sectionTitleAr: "",
      questionType: 'single_choice',
      options: [
        { optionText: "", optionTextAr: "", imageUrl: "" },
        { optionText: "", optionTextAr: "", imageUrl: "" },
      ],
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    if (!selectedTier) return;
    const question = questions[questionIndex];
    if (question.options.length >= selectedTier.maxOptions) return;

    const updated = [...questions];
    updated[questionIndex].options.push({ optionText: "", optionTextAr: "", imageUrl: "" });
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
      setQuestions(updated);
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof QuestionOption, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex][field] = value;
    setQuestions(updated);
  };

  const handleSaveQuestions = async () => {
    if (!createdVoteId) return;

    try {
      for (const question of questions) {
        if (!question.questionText) continue;
        
        await addQuestionMutation.mutateAsync({
          voteId: createdVoteId,
          questionType: question.questionType,
          questionText: question.questionText,
          questionTextAr: question.questionTextAr || undefined,
          sectionTitle: question.sectionTitle || undefined,
          sectionTitleAr: question.sectionTitleAr || undefined,
          maxSelections: question.questionType === 'multiple_choice' ? 3 : 1,
          options: question.options.filter(o => o.optionText).map(o => ({
            optionText: o.optionText,
            optionTextAr: o.optionTextAr || undefined,
            imageUrl: o.imageUrl || undefined,
          })),
        });
      }

      // Navigate to campaign launch
      setLocation(`/advertiser/votes/${createdVoteId}/launch`);
    } catch (error) {
      console.error("Failed to save questions:", error);
    }
  };

  if (tiersLoading) {
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
          <h1 className="text-2xl font-bold">{isRtl ? 'إنشاء تصويت جديد' : 'Create New Vote'}</h1>
          <p className="text-muted-foreground">{isRtl ? 'احصل على آراء المستخدمين حول منتجاتك' : 'Get user opinions on your products'}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
            </div>
            {step < 3 && (
              <div className={`w-24 h-1 mx-2 ${currentStep > step ? 'bg-purple-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Tier */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">{isRtl ? 'اختر نوع التصويت' : 'Select Vote Type'}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingTiers?.map((tier: PricingTier) => (
              <Card 
                key={tier.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTierId === tier.id ? 'ring-2 ring-purple-600' : ''
                }`}
                onClick={() => handleSelectTier(tier.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {isRtl ? tier.displayNameAr : tier.displayName}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">
                    {tier.minPricePerVote}-{tier.maxPricePerVote} {symbol}
                  </CardTitle>
                  <CardDescription>
                    {isRtl ? tier.descriptionAr : tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• {tier.minQuestions}-{tier.maxQuestions} {isRtl ? 'أسئلة' : 'questions'}</p>
                    <p>• {tier.minOptions}-{tier.maxOptions} {isRtl ? 'خيارات لكل سؤال' : 'options per question'}</p>
                    <p>• {tier.defaultUserReward} {symbol} {isRtl ? 'مكافأة المستخدم' : 'user reward'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Vote Details */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{isRtl ? 'تفاصيل التصويت' : 'Vote Details'}</CardTitle>
            <CardDescription>
              {isRtl ? 'أدخل المعلومات الأساسية للتصويت' : 'Enter basic information for your vote'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRtl ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isRtl ? 'أدخل العنوان بالإنجليزية' : 'Enter title in English'}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                <Input
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder={isRtl ? 'أدخل العنوان بالعربية' : 'Enter title in Arabic'}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRtl ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isRtl ? 'أدخل الوصف بالإنجليزية' : 'Enter description in English'}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                <Textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder={isRtl ? 'أدخل الوصف بالعربية' : 'Enter description in Arabic'}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRtl ? 'الفئة' : 'Category'}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={isRtl ? 'اختر الفئة' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">{isRtl ? 'منتج' : 'Product'}</SelectItem>
                  <SelectItem value="design">{isRtl ? 'تصميم' : 'Design'}</SelectItem>
                  <SelectItem value="brand">{isRtl ? 'علامة تجارية' : 'Brand'}</SelectItem>
                  <SelectItem value="feature">{isRtl ? 'ميزة' : 'Feature'}</SelectItem>
                  <SelectItem value="other">{isRtl ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                {isRtl ? 'السابق' : 'Previous'}
              </Button>
              <Button onClick={handleCreateVote} disabled={!title || createVoteMutation.isPending}>
                {createVoteMutation.isPending ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    {isRtl ? 'التالي' : 'Next'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add Questions */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{isRtl ? 'أضف الأسئلة' : 'Add Questions'}</h2>
            <Badge variant="outline">
              {questions.length}/{selectedTier?.maxQuestions || 10} {isRtl ? 'أسئلة' : 'questions'}
            </Badge>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={qIndex}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {isRtl ? `السؤال ${qIndex + 1}` : `Question ${qIndex + 1}`}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{isRtl ? 'نص السؤال (إنجليزي)' : 'Question Text (English)'}</Label>
                    <Input
                      value={question.questionText}
                      onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                      placeholder={isRtl ? 'أدخل السؤال بالإنجليزية' : 'Enter question in English'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRtl ? 'نص السؤال (عربي)' : 'Question Text (Arabic)'}</Label>
                    <Input
                      value={question.questionTextAr}
                      onChange={(e) => updateQuestion(qIndex, 'questionTextAr', e.target.value)}
                      placeholder={isRtl ? 'أدخل السؤال بالعربية' : 'Enter question in Arabic'}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRtl ? 'نوع السؤال' : 'Question Type'}</Label>
                  <Select 
                    value={question.questionType} 
                    onValueChange={(v) => updateQuestion(qIndex, 'questionType', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_choice">{isRtl ? 'اختيار واحد' : 'Single Choice'}</SelectItem>
                      <SelectItem value="multiple_choice">{isRtl ? 'اختيار متعدد' : 'Multiple Choice'}</SelectItem>
                      <SelectItem value="ranking">{isRtl ? 'ترتيب' : 'Ranking'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{isRtl ? 'الخيارات' : 'Options'}</Label>
                    <Badge variant="outline">
                      {question.options.length}/{selectedTier?.maxOptions || 6}
                    </Badge>
                  </div>

                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="grid gap-2 md:grid-cols-2">
                          <Input
                            value={option.optionText}
                            onChange={(e) => updateOption(qIndex, oIndex, 'optionText', e.target.value)}
                            placeholder={isRtl ? 'نص الخيار (إنجليزي)' : 'Option text (English)'}
                          />
                          <Input
                            value={option.optionTextAr}
                            onChange={(e) => updateOption(qIndex, oIndex, 'optionTextAr', e.target.value)}
                            placeholder={isRtl ? 'نص الخيار (عربي)' : 'Option text (Arabic)'}
                            dir="rtl"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={option.imageUrl}
                            onChange={(e) => updateOption(qIndex, oIndex, 'imageUrl', e.target.value)}
                            placeholder={isRtl ? 'رابط الصورة (اختياري)' : 'Image URL (optional)'}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      {question.options.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {question.options.length < (selectedTier?.maxOptions || 6) && (
                    <Button variant="outline" onClick={() => addOption(qIndex)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      {isRtl ? 'إضافة خيار' : 'Add Option'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length < (selectedTier?.maxQuestions || 10) && (
            <Button variant="outline" onClick={addQuestion} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {isRtl ? 'إضافة سؤال' : 'Add Question'}
            </Button>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              {isRtl ? 'السابق' : 'Previous'}
            </Button>
            <Button 
              onClick={handleSaveQuestions} 
              disabled={questions.length === 0 || addQuestionMutation.isPending}
            >
              {addQuestionMutation.isPending ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  {isRtl ? 'حفظ وإطلاق الحملة' : 'Save & Launch Campaign'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
