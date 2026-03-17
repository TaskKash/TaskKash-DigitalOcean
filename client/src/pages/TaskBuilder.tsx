import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
// Basic API request helper
async function apiRequest(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API request failed');
  }
  return res.json();
}
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Video,
  FileQuestion,
  MapPin,
  ListChecks,
  Save,
  Rocket,
  Users,
  Target,
  DollarSign
} from "lucide-react";

interface TaskTemplate {
  id: string;
  type: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  defaultConfig: any;
}

const TASK_TYPES = [
  { value: 'survey', label: 'Survey', icon: FileQuestion, color: 'bg-blue-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'bg-red-500' },
  { value: 'quiz', label: 'Quiz', icon: ListChecks, color: 'bg-green-500' },
  { value: 'visit', label: 'Visit', icon: MapPin, color: 'bg-orange-500' },
];

export default function TaskBuilder() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string>('survey');
  const [showPreview, setShowPreview] = useState(false);
  
  const [taskData, setTaskData] = useState({
    type: 'survey',
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    reward: 5,
    totalBudget: 1000,
    completionsNeeded: 200,
    difficulty: 'medium',
    duration: 5,
    targetAgeMin: 18,
    targetAgeMax: 65,
    targetGender: '',
    taskData: {
      questions: [],
      videoUrl: '',
      minWatchPercentage: 70,
      passingScore: 80,
      location: null,
      minDuration: 15
    }
  });

  const [questions, setQuestions] = useState<any[]>([]);

  const { data: templates } = useQuery<TaskTemplate[]>({
    queryKey: ["/api/advertiser/templates"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/advertiser/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Task created successfully!");
      setLocation("/advertiser/tasks");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      type: 'multiple_choice',
      questionEn: '',
      questionAr: '',
      options: ['', '', ''],
      correctAnswer: 0
    }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = () => {
    const finalTaskData = {
      ...taskData,
      taskData: {
        ...taskData.taskData,
        questions: selectedType === 'survey' || selectedType === 'quiz' ? questions : undefined
      }
    };
    createTaskMutation.mutate(finalTaskData);
  };

  const estimatedReach = Math.floor(taskData.totalBudget / taskData.reward);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => setLocation("/advertiser/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Create New Task</h1>
          <p className="text-purple-100 mt-1">
            Build engaging tasks to reach your target audience
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Task Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {TASK_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSelectedType(type.value);
                        setTaskData({ ...taskData, type: type.value });
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedType === type.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className={`w-12 h-12 ${type.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-medium text-center">{type.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={taskData.titleEn}
                      onChange={(e) => setTaskData({ ...taskData, titleEn: e.target.value })}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (Arabic)</Label>
                    <Input
                      value={taskData.titleAr}
                      onChange={(e) => setTaskData({ ...taskData, titleAr: e.target.value })}
                      placeholder="أدخل عنوان المهمة"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Description (English)</Label>
                    <Textarea
                      value={taskData.descriptionEn}
                      onChange={(e) => setTaskData({ ...taskData, descriptionEn: e.target.value })}
                      placeholder="Describe the task"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Arabic)</Label>
                    <Textarea
                      value={taskData.descriptionAr}
                      onChange={(e) => setTaskData({ ...taskData, descriptionAr: e.target.value })}
                      placeholder="وصف المهمة"
                      dir="rtl"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task-Specific Configuration */}
            {(selectedType === 'survey' || selectedType === 'quiz') && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Questions</CardTitle>
                    <Button onClick={addQuestion} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileQuestion className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No questions added yet</p>
                      <p className="text-sm">Click "Add Question" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div key={question.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <span className="font-medium">Question {index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={question.questionEn}
                                onChange={(e) => updateQuestion(question.id, 'questionEn', e.target.value)}
                                placeholder="Question (English)"
                              />
                              <Input
                                value={question.questionAr}
                                onChange={(e) => updateQuestion(question.id, 'questionAr', e.target.value)}
                                placeholder="السؤال (عربي)"
                                dir="rtl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Options</Label>
                              {question.options.map((option: string, optIndex: number) => (
                                <Input
                                  key={optIndex}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optIndex] = e.target.value;
                                    updateQuestion(question.id, 'options', newOptions);
                                  }}
                                  placeholder={`Option ${optIndex + 1}`}
                                />
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuestion(question.id, 'options', [...question.options, ''])}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedType === 'video' && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input
                      value={taskData.taskData.videoUrl}
                      onChange={(e) => setTaskData({
                        ...taskData,
                        taskData: { ...taskData.taskData, videoUrl: e.target.value }
                      })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Watch Percentage: {taskData.taskData.minWatchPercentage}%</Label>
                    <Slider
                      value={[taskData.taskData.minWatchPercentage]}
                      onValueChange={(value) => setTaskData({
                        ...taskData,
                        taskData: { ...taskData.taskData, minWatchPercentage: value[0] }
                      })}
                      min={50}
                      max={100}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedType === 'visit' && (
              <Card>
                <CardHeader>
                  <CardTitle>Visit Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input placeholder="Store/Office Name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input type="number" step="0.0001" placeholder="30.0444" />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input type="number" step="0.0001" placeholder="31.2357" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Duration (minutes): {taskData.taskData.minDuration}</Label>
                    <Slider
                      value={[taskData.taskData.minDuration]}
                      onValueChange={(value) => setTaskData({
                        ...taskData,
                        taskData: { ...taskData.taskData, minDuration: value[0] }
                      })}
                      min={5}
                      max={60}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Targeting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Targeting Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={taskData.targetAgeMin}
                        onChange={(e) => setTaskData({ ...taskData, targetAgeMin: parseInt(e.target.value) })}
                        placeholder="Min"
                        className="w-20"
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        value={taskData.targetAgeMax}
                        onChange={(e) => setTaskData({ ...taskData, targetAgeMax: parseInt(e.target.value) })}
                        placeholder="Max"
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={taskData.targetGender}
                      onValueChange={(value) => setTaskData({ ...taskData, targetGender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Genders" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Budget & Preview */}
          <div className="space-y-6">
            {/* Budget Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget & Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Reward per Completion ({currency})</Label>
                  <Input
                    type="number"
                    value={taskData.reward}
                    onChange={(e) => setTaskData({ ...taskData, reward: parseFloat(e.target.value) })}
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Budget ({currency})</Label>
                  <Input
                    type="number"
                    value={taskData.totalBudget}
                    onChange={(e) => setTaskData({ ...taskData, totalBudget: parseFloat(e.target.value) })}
                    min={100}
                  />
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Estimated Reach</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {estimatedReach.toLocaleString()} users
                  </p>
                  <p className="text-sm text-gray-500">
                    Based on your budget and reward
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={taskData.difficulty}
                    onValueChange={(value) => setTaskData({ ...taskData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={taskData.duration}
                    onChange={(e) => setTaskData({ ...taskData, duration: parseInt(e.target.value) })}
                    min={1}
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Task
                  </Button>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleSubmit}
                    disabled={createTaskMutation.isPending}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates?.filter(t => t.type === selectedType).map((template) => (
                    <button
                      key={template.id}
                      className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setTaskData({
                          ...taskData,
                          titleEn: template.nameEn,
                          titleAr: template.nameAr,
                          descriptionEn: template.descriptionEn,
                          descriptionAr: template.descriptionAr,
                          taskData: { ...taskData.taskData, ...template.defaultConfig }
                        });
                      }}
                    >
                      <p className="font-medium">{template.nameEn}</p>
                      <p className="text-sm text-gray-500">{template.descriptionEn}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
