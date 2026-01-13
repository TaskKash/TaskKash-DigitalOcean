import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, 
  ArrowLeft,
  Target, 
  Gift, 
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileQuestion,
  ClipboardList,
  MapPin,
  Save,
  Eye,
  Settings,
  Users,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';
import { useApp } from '@/contexts/AppContext';

interface CampaignTask {
  id: string;
  sequence: number;
  type: 'video' | 'survey' | 'quiz' | 'visit' | 'filter';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  isRequired: boolean;
  gatingRules: {
    minCompletion?: number;
    minScore?: number;
    minDuration?: number;
    requireGps?: boolean;
    antiIncentiveGate?: boolean;
    disqualifyingAnswers?: Record<string, string[]>;
  };
  taskConfig: any;
}

interface Persona {
  id: string;
  nameEn: string;
  nameAr: string;
  targetingCriteria: Record<string, any>;
  videoUrl?: string;
  adCopyEn?: string;
  adCopyAr?: string;
}

interface CampaignData {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  reward: number;
  currency: string;
  budget: number;
  coverImage: string;
  tasks: CampaignTask[];
  personas: Persona[];
  qualifications: Array<{
    criteriaKey: string;
    operator: string;
    value: string;
  }>;
  kpiBenchmarks: {
    videoCompletionRate: number;
    filterPassRate: number;
    visitAttendanceRate: number;
    targetCpa: number;
  };
}

const TASK_TYPES = [
  { value: 'video', label: 'Video Watch', icon: Video, description: 'User watches a promotional video' },
  { value: 'filter', label: 'Qualification Filter', icon: Filter, description: 'Quick questions to filter qualified users' },
  { value: 'survey', label: 'Deep Survey', icon: ClipboardList, description: 'Detailed survey for lead qualification' },
  { value: 'quiz', label: 'Knowledge Quiz', icon: FileQuestion, description: 'Quiz to verify understanding' },
  { value: 'visit', label: 'Location Visit', icon: MapPin, description: 'Physical visit to a location' },
];

export default function MultiTaskCampaignBuilder() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { currentAdvertiser, isInitialized } = useApp();
  const isRTL = i18n.language === 'ar';

  // Redirect if not logged in as advertiser
  useEffect(() => {
    if (isInitialized && !currentAdvertiser) {
      setLocation('/advertiser/login');
    }
  }, [currentAdvertiser, isInitialized, setLocation]);

  if (!isInitialized || !currentAdvertiser) {
    return null;
  }

  const [activeTab, setActiveTab] = useState('basic');
  const [campaign, setCampaign] = useState<CampaignData>({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    reward: 0,
    currency: 'EGP',
    budget: 0,
    coverImage: '',
    tasks: [],
    personas: [],
    qualifications: [],
    kpiBenchmarks: {
      videoCompletionRate: 65,
      filterPassRate: 50,
      visitAttendanceRate: 25,
      targetCpa: 20000
    }
  });

  const addTask = (type: CampaignTask['type']) => {
    const newTask: CampaignTask = {
      id: `task_${Date.now()}`,
      sequence: campaign.tasks.length + 1,
      type,
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
      isRequired: true,
      gatingRules: type === 'video' ? { minCompletion: 70 } : 
                   type === 'quiz' ? { minScore: 70 } :
                   type === 'visit' ? { minDuration: 30, requireGps: true } :
                   type === 'filter' ? { antiIncentiveGate: false } : {},
      taskConfig: {}
    };
    setCampaign(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const updateTask = (taskId: string, updates: Partial<CampaignTask>) => {
    setCampaign(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  };

  const removeTask = (taskId: string) => {
    setCampaign(prev => ({
      ...prev,
      tasks: prev.tasks
        .filter(task => task.id !== taskId)
        .map((task, index) => ({ ...task, sequence: index + 1 }))
    }));
  };

  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    const taskIndex = campaign.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    if (newIndex < 0 || newIndex >= campaign.tasks.length) return;
    
    const newTasks = [...campaign.tasks];
    [newTasks[taskIndex], newTasks[newIndex]] = [newTasks[newIndex], newTasks[taskIndex]];
    
    setCampaign(prev => ({
      ...prev,
      tasks: newTasks.map((task, index) => ({ ...task, sequence: index + 1 }))
    }));
  };

  const addPersona = () => {
    const newPersona: Persona = {
      id: `persona_${Date.now()}`,
      nameEn: '',
      nameAr: '',
      targetingCriteria: {},
      videoUrl: '',
      adCopyEn: '',
      adCopyAr: ''
    };
    setCampaign(prev => ({
      ...prev,
      personas: [...prev.personas, newPersona]
    }));
  };

  const updatePersona = (personaId: string, updates: Partial<Persona>) => {
    setCampaign(prev => ({
      ...prev,
      personas: prev.personas.map(persona => 
        persona.id === personaId ? { ...persona, ...updates } : persona
      )
    }));
  };

  const removePersona = (personaId: string) => {
    setCampaign(prev => ({
      ...prev,
      personas: prev.personas.filter(persona => persona.id !== personaId)
    }));
  };

  const addQualification = () => {
    setCampaign(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { criteriaKey: '', operator: '=', value: '' }]
    }));
  };

  const updateQualification = (index: number, updates: Partial<typeof campaign.qualifications[0]>) => {
    setCampaign(prev => ({
      ...prev,
      qualifications: prev.qualifications.map((qual, i) => 
        i === index ? { ...qual, ...updates } : qual
      )
    }));
  };

  const removeQualification = (index: number) => {
    setCampaign(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const saveCampaignMutation = useMutation({
    mutationFn: async (data: CampaignData) => {
      const response = await fetch('/api/advertiser/campaigns/multi-task', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save campaign');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(t('advertiser.campaignSaved', 'Campaign Saved'));
      setLocation(`/advertiser/campaigns/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('advertiser.saveError', 'Save Failed'));
    }
  });

  const handleSave = () => {
    // Validate
    if (!campaign.titleEn || !campaign.titleAr) {
      toast.error(t('advertiser.titleRequired', 'Campaign title is required in both languages'));
      return;
    }
    if (campaign.tasks.length === 0) {
      toast.error(t('advertiser.tasksRequired', 'At least one task is required'));
      return;
    }
    if (campaign.reward <= 0) {
      toast.error(t('advertiser.rewardRequired', 'Reward amount must be greater than 0'));
      return;
    }

    saveCampaignMutation.mutate(campaign);
  };

  const getTaskIcon = (type: string) => {
    const taskType = TASK_TYPES.find(t => t.value === type);
    if (!taskType) return <Target className="w-5 h-5" />;
    const Icon = taskType.icon;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-7 h-7 text-purple-600" />
              {t('advertiser.multiTaskCampaign', 'Multi-Task Campaign Builder')}
            </h1>
            <p className="text-gray-500 mt-1">
              {t('advertiser.multiTaskDescription', 'Create a campaign with multiple sequential tasks for higher engagement')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation('/advertiser/campaigns')}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saveCampaignMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveCampaignMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save Campaign')}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="basic">
              <Settings className="w-4 h-4 mr-2" />
              {t('advertiser.basicInfo', 'Basic Info')}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Target className="w-4 h-4 mr-2" />
              {t('advertiser.taskJourney', 'Task Journey')}
              {campaign.tasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">{campaign.tasks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="personas">
              <Users className="w-4 h-4 mr-2" />
              {t('advertiser.personas', 'Personas')}
              {campaign.personas.length > 0 && (
                <Badge variant="secondary" className="ml-2">{campaign.personas.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="targeting">
              <Filter className="w-4 h-4 mr-2" />
              {t('advertiser.targeting', 'Targeting')}
            </TabsTrigger>
            <TabsTrigger value="kpis">
              <Eye className="w-4 h-4 mr-2" />
              {t('advertiser.kpis', 'KPI Benchmarks')}
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>{t('advertiser.campaignDetails', 'Campaign Details')}</CardTitle>
                <CardDescription>
                  {t('advertiser.campaignDetailsDescription', 'Basic information about your multi-task campaign')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('advertiser.titleEn', 'Title (English)')}</Label>
                    <Input
                      value={campaign.titleEn}
                      onChange={(e) => setCampaign(prev => ({ ...prev, titleEn: e.target.value }))}
                      placeholder="e.g., Madinaty Property Discovery Journey"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('advertiser.titleAr', 'Title (Arabic)')}</Label>
                    <Input
                      value={campaign.titleAr}
                      onChange={(e) => setCampaign(prev => ({ ...prev, titleAr: e.target.value }))}
                      placeholder="مثال: رحلة اكتشاف مدينتي"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('advertiser.descriptionEn', 'Description (English)')}</Label>
                    <Textarea
                      value={campaign.descriptionEn}
                      onChange={(e) => setCampaign(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      placeholder="Describe your campaign..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('advertiser.descriptionAr', 'Description (Arabic)')}</Label>
                    <Textarea
                      value={campaign.descriptionAr}
                      onChange={(e) => setCampaign(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      placeholder="وصف الحملة..."
                      rows={4}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('advertiser.reward', 'Total Reward')}</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={campaign.reward}
                        onChange={(e) => setCampaign(prev => ({ ...prev, reward: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        className="rounded-r-none"
                      />
                      <Select
                        value={campaign.currency}
                        onValueChange={(value) => setCampaign(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="w-24 rounded-l-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EGP">EGP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="SAR">SAR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('advertiser.budget', 'Campaign Budget')}</Label>
                    <Input
                      type="number"
                      value={campaign.budget}
                      onChange={(e) => setCampaign(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('advertiser.coverImage', 'Cover Image URL')}</Label>
                    <Input
                      value={campaign.coverImage}
                      onChange={(e) => setCampaign(prev => ({ ...prev, coverImage: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task Journey Tab */}
          <TabsContent value="tasks">
            <div className="space-y-4">
              {/* Add Task Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('advertiser.addTask', 'Add Task to Journey')}</CardTitle>
                  <CardDescription>
                    {t('advertiser.addTaskDescription', 'Select a task type to add to your campaign journey')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {TASK_TYPES.map((taskType) => {
                      const Icon = taskType.icon;
                      return (
                        <Button
                          key={taskType.value}
                          variant="outline"
                          className="h-auto py-4 flex flex-col items-center gap-2"
                          onClick={() => addTask(taskType.value as CampaignTask['type'])}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs">{taskType.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Task List */}
              {campaign.tasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">{t('advertiser.noTasks', 'No Tasks Yet')}</h3>
                  <p className="text-gray-500 text-sm">
                    {t('advertiser.noTasksDescription', 'Add tasks above to build your campaign journey')}
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {campaign.tasks.map((task, index) => (
                    <Card key={task.id} className="overflow-hidden">
                      <div className="flex items-stretch">
                        {/* Drag Handle & Sequence */}
                        <div className="bg-gray-100 px-3 flex flex-col items-center justify-center border-r">
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                          <span className="text-lg font-bold text-gray-600">{task.sequence}</span>
                          <div className="flex flex-col gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveTask(task.id, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveTask(task.id, 'down')}
                              disabled={index === campaign.tasks.length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Task Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {getTaskIcon(task.type)}
                              <Badge variant="outline" className="capitalize">{task.type}</Badge>
                              {task.isRequired && (
                                <Badge variant="secondary">{t('advertiser.required', 'Required')}</Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeTask(task.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="content">
                              <AccordionTrigger>
                                {t('advertiser.taskContent', 'Task Content')}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                  <div className="space-y-2">
                                    <Label>{t('advertiser.titleEn', 'Title (English)')}</Label>
                                    <Input
                                      value={task.titleEn}
                                      onChange={(e) => updateTask(task.id, { titleEn: e.target.value })}
                                      placeholder="Task title..."
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('advertiser.titleAr', 'Title (Arabic)')}</Label>
                                    <Input
                                      value={task.titleAr}
                                      onChange={(e) => updateTask(task.id, { titleAr: e.target.value })}
                                      placeholder="عنوان المهمة..."
                                      dir="rtl"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('advertiser.descriptionEn', 'Description (English)')}</Label>
                                    <Textarea
                                      value={task.descriptionEn}
                                      onChange={(e) => updateTask(task.id, { descriptionEn: e.target.value })}
                                      placeholder="Task description..."
                                      rows={2}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('advertiser.descriptionAr', 'Description (Arabic)')}</Label>
                                    <Textarea
                                      value={task.descriptionAr}
                                      onChange={(e) => updateTask(task.id, { descriptionAr: e.target.value })}
                                      placeholder="وصف المهمة..."
                                      rows={2}
                                      dir="rtl"
                                    />
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="gating">
                              <AccordionTrigger>
                                {t('advertiser.gatingRules', 'Gating Rules')}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  {task.type === 'video' && (
                                    <div className="space-y-2">
                                      <Label>{t('advertiser.minCompletion', 'Minimum Completion %')}</Label>
                                      <Input
                                        type="number"
                                        value={task.gatingRules.minCompletion || 70}
                                        onChange={(e) => updateTask(task.id, { 
                                          gatingRules: { ...task.gatingRules, minCompletion: parseInt(e.target.value) || 70 }
                                        })}
                                        min={0}
                                        max={100}
                                      />
                                    </div>
                                  )}
                                  {task.type === 'quiz' && (
                                    <div className="space-y-2">
                                      <Label>{t('advertiser.minScore', 'Minimum Score %')}</Label>
                                      <Input
                                        type="number"
                                        value={task.gatingRules.minScore || 70}
                                        onChange={(e) => updateTask(task.id, { 
                                          gatingRules: { ...task.gatingRules, minScore: parseInt(e.target.value) || 70 }
                                        })}
                                        min={0}
                                        max={100}
                                      />
                                    </div>
                                  )}
                                  {task.type === 'visit' && (
                                    <>
                                      <div className="space-y-2">
                                        <Label>{t('advertiser.minDuration', 'Minimum Duration (minutes)')}</Label>
                                        <Input
                                          type="number"
                                          value={task.gatingRules.minDuration || 30}
                                          onChange={(e) => updateTask(task.id, { 
                                            gatingRules: { ...task.gatingRules, minDuration: parseInt(e.target.value) || 30 }
                                          })}
                                          min={1}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label>{t('advertiser.requireGps', 'Require GPS Verification')}</Label>
                                        <Switch
                                          checked={task.gatingRules.requireGps || false}
                                          onCheckedChange={(checked) => updateTask(task.id, { 
                                            gatingRules: { ...task.gatingRules, requireGps: checked }
                                          })}
                                        />
                                      </div>
                                    </>
                                  )}
                                  {task.type === 'filter' && (
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <Label>{t('advertiser.antiIncentiveGate', 'Anti-Incentive Gate')}</Label>
                                        <p className="text-xs text-gray-500">
                                          {t('advertiser.antiIncentiveDescription', 'Ask users if they are genuinely interested')}
                                        </p>
                                      </div>
                                      <Switch
                                        checked={task.gatingRules.antiIncentiveGate || false}
                                        onCheckedChange={(checked) => updateTask(task.id, { 
                                          gatingRules: { ...task.gatingRules, antiIncentiveGate: checked }
                                        })}
                                      />
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Personas Tab */}
          <TabsContent value="personas">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('advertiser.personaTargeting', 'Persona-Based Targeting')}</CardTitle>
                  <CardDescription>
                    {t('advertiser.personaDescription', 'Create different personas to deliver tailored content to different user segments')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={addPersona}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('advertiser.addPersona', 'Add Persona')}
                  </Button>
                </CardContent>
              </Card>

              {campaign.personas.map((persona, index) => (
                <Card key={persona.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {t('advertiser.persona', 'Persona')} {index + 1}: {persona.nameEn || t('advertiser.unnamed', 'Unnamed')}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removePersona(persona.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('advertiser.personaNameEn', 'Persona Name (English)')}</Label>
                        <Input
                          value={persona.nameEn}
                          onChange={(e) => updatePersona(persona.id, { nameEn: e.target.value })}
                          placeholder="e.g., Family Buyer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('advertiser.personaNameAr', 'Persona Name (Arabic)')}</Label>
                        <Input
                          value={persona.nameAr}
                          onChange={(e) => updatePersona(persona.id, { nameAr: e.target.value })}
                          placeholder="مثال: مشتري عائلي"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('advertiser.videoUrl', 'Video URL (for this persona)')}</Label>
                      <Input
                        value={persona.videoUrl}
                        onChange={(e) => updatePersona(persona.id, { videoUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('advertiser.adCopyEn', 'Ad Copy (English)')}</Label>
                        <Textarea
                          value={persona.adCopyEn}
                          onChange={(e) => updatePersona(persona.id, { adCopyEn: e.target.value })}
                          placeholder="Tailored message for this persona..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('advertiser.adCopyAr', 'Ad Copy (Arabic)')}</Label>
                        <Textarea
                          value={persona.adCopyAr}
                          onChange={(e) => updatePersona(persona.id, { adCopyAr: e.target.value })}
                          placeholder="رسالة مخصصة لهذه الشريحة..."
                          rows={3}
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Targeting Tab */}
          <TabsContent value="targeting">
            <Card>
              <CardHeader>
                <CardTitle>{t('advertiser.qualificationCriteria', 'Qualification Criteria')}</CardTitle>
                <CardDescription>
                  {t('advertiser.qualificationDescription', 'Define criteria that users must meet to participate in this campaign')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={addQualification}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('advertiser.addCriteria', 'Add Criteria')}
                </Button>

                {campaign.qualifications.map((qual, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Select
                      value={qual.criteriaKey}
                      onValueChange={(value) => updateQualification(index, { criteriaKey: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="age">Age</SelectItem>
                        <SelectItem value="gender">Gender</SelectItem>
                        <SelectItem value="city">City</SelectItem>
                        <SelectItem value="income">Income Level</SelectItem>
                        <SelectItem value="tier">User Tier</SelectItem>
                        <SelectItem value="profileStrength">Profile Strength</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={qual.operator}
                      onValueChange={(value) => updateQualification(index, { operator: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value="!=">≠</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value=">=">&gt;=</SelectItem>
                        <SelectItem value="<=">&lt;=</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="not_in">not in</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={qual.value}
                      onChange={(e) => updateQualification(index, { value: e.target.value })}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeQualification(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPIs Tab */}
          <TabsContent value="kpis">
            <Card>
              <CardHeader>
                <CardTitle>{t('advertiser.kpiBenchmarks', 'KPI Benchmarks')}</CardTitle>
                <CardDescription>
                  {t('advertiser.kpiDescription', 'Set target benchmarks for campaign performance tracking')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t('advertiser.videoCompletionRate', 'Target Video Completion Rate (%)')}</Label>
                    <Input
                      type="number"
                      value={campaign.kpiBenchmarks.videoCompletionRate}
                      onChange={(e) => setCampaign(prev => ({
                        ...prev,
                        kpiBenchmarks: { ...prev.kpiBenchmarks, videoCompletionRate: parseInt(e.target.value) || 0 }
                      }))}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('advertiser.filterPassRate', 'Target Filter Pass Rate (%)')}</Label>
                    <Input
                      type="number"
                      value={campaign.kpiBenchmarks.filterPassRate}
                      onChange={(e) => setCampaign(prev => ({
                        ...prev,
                        kpiBenchmarks: { ...prev.kpiBenchmarks, filterPassRate: parseInt(e.target.value) || 0 }
                      }))}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('advertiser.visitAttendanceRate', 'Target Visit Attendance Rate (%)')}</Label>
                    <Input
                      type="number"
                      value={campaign.kpiBenchmarks.visitAttendanceRate}
                      onChange={(e) => setCampaign(prev => ({
                        ...prev,
                        kpiBenchmarks: { ...prev.kpiBenchmarks, visitAttendanceRate: parseInt(e.target.value) || 0 }
                      }))}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('advertiser.targetCpa', 'Target CPA (Cost Per Acquisition)')}</Label>
                    <Input
                      type="number"
                      value={campaign.kpiBenchmarks.targetCpa}
                      onChange={(e) => setCampaign(prev => ({
                        ...prev,
                        kpiBenchmarks: { ...prev.kpiBenchmarks, targetCpa: parseInt(e.target.value) || 0 }
                      }))}
                      min={0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
