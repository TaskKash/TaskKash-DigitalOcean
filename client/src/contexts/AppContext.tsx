import { createContext, useState, useEffect, useContext, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { mockTasks, mockTransactions, mockNotifications, type Task, type Transaction, type Notification } from '@/lib/mockData';
import { requestNotificationPermission } from '@/lib/pushNotifications';

// Define User type based on database schema
export interface User {
  id: number;
  openId: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  balance: number;
  tier: string;
  completedTasks: number;
  totalEarnings: number;
  joinDate: string;
  verified: boolean;
  profileStrength: number;
  countryId: number | null;
  role: string;
  createdAt?: string;
  advertiserId?: number;
}

interface AppContextType {
  // بيانات المستخدمين العاديين
  user: User | null;
  tasks: Task[];
  transactions: Transaction[];
  notifications: Notification[];

  // بيانات المعلنين
  currentAdvertiser: any;
  advertiserCampaigns: any[];
  advertiserTasks: any[];

  // نوع المستخدم
  userType: 'user' | 'advertiser';
  setUserType: (type: 'user' | 'advertiser') => void;
  setUser: (user: User | null) => void;

  // حالة التحميل
  isInitialized: boolean;
  isLoading: boolean;

  // دوال المستخدمين العاديين
  updateBalance: (amount: number) => void;
  completeTask: (taskId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  refreshTransactions: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // دوال المعلنين
  loginAdvertiser: (advertiserId: string) => void;
  logoutAdvertiser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Get authenticated user from useAuth hook
  const { user: authUser, loading: authLoading, isAuthenticated, refresh: refreshAuthUser } = useAuth();

  // حالة المستخدمين العاديين - استخدام البيانات من API
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // حالة المعلنين
  const [currentAdvertiser, setCurrentAdvertiser] = useState<any>(null);
  const [advertiserCampaigns, setAdvertiserCampaigns] = useState<any[]>([]);
  const [advertiserTasks, setAdvertiserTasks] = useState<any[]>([]);

  // نوع المستخدم
  const [userType, setUserType] = useState<'user' | 'advertiser'>('user');

  // حالة التحميل (لمنع عرض الصفحات قبل استعادة البيانات)
  const [isInitialized, setIsInitialized] = useState(false);

  // IMPORTANT: Update user state when authUser changes - MUST be before other effects that depend on user
  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        openId: authUser.openId,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone,
        avatar: authUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.name}`,
        balance: authUser.balance,
        tier: authUser.tier,
        completedTasks: authUser.completedTasks,
        totalEarnings: authUser.totalEarnings,
        joinDate: authUser.createdAt,
        verified: authUser.isVerified === 1,
        profileStrength: authUser.profileStrength,
        countryId: authUser.countryId,
        role: authUser.role,
      });
      // Automatically request notification permissions when user logs in/is authenticated
      setTimeout(() => {
        requestNotificationPermission().catch(console.error);
      }, 2000);
    } else {
      setUser(null);
    }
  }, [authUser]);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          // Transform API tasks to match Task interface
          const transformedTasks = data.tasks.map((task: any) => ({
            id: task.id.toString(),
            title: task.titleEn || task.titleAr,
            titleEn: task.titleEn,
            titleAr: task.titleAr,
            description: task.descriptionEn || task.descriptionAr,
            descriptionEn: task.descriptionEn,
            descriptionAr: task.descriptionAr,
            reward: task.reward,
            duration: task.duration,
            difficulty: task.difficulty,
            type: task.type,
            status: task.canComplete ? 'available' : 'completed', // Check if user can complete this task
            company: task.advertiserName || 'Samsung Egypt',
            companyLogo: task.advertiserLogo || '',
            advertiser: task.advertiserName || 'Samsung Egypt',
            advertiserLogo: task.advertiserLogo || '',
            advertiserId: task.advertiserId,
            requirements: task.requirements || [],
            steps: task.steps || [],
            category: task.category || 'technology',
            tags: task.tags || []
          }));
          setTasks(transformedTasks);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        // Fallback to empty array on error
        setTasks([]);
      }
    };

    fetchTasks();
  }, [user]); // Refetch tasks when user logs in or changes

  // Function to fetch transactions - can be called manually
  const fetchTransactions = useCallback(async () => {

    if (!user?.id) return;
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        // Transform API transactions to match Transaction interface
        const transformedTransactions = data.transactions.map((txn: any) => ({
          id: txn.id.toString(),
          type: txn.type,
          amount: txn.amount,
          description: txn.description,
          date: new Date(txn.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }),
          status: txn.status
        }));
        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    }
  }, [user?.id]);

  // Fetch transactions from API when user changes
  useEffect(() => {
    fetchTransactions();
  }, [user]);

  // Function to fetch notifications - can be called manually
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        // Transform API notifications to match Notification interface
        const transformedNotifications = data.notifications.map((notif: any) => ({
          id: notif.id.toString(),
          title: notif.titleEn, // Frontend will use language-specific title
          titleAr: notif.titleAr,
          titleEn: notif.titleEn,
          message: notif.messageEn, // Frontend will use language-specific message
          messageAr: notif.messageAr,
          messageEn: notif.messageEn,
          date: notif.date,
          read: notif.read,
          type: notif.type,
          actionUrl: notif.actionUrl,
        }));
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  // Fetch notifications from API when user changes
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // استعادة حالة تسجيل الدخول عند تحميل التطبيق
  useEffect(() => {
    const fetchAdvertiserData = async (advertiserData: any) => {
      try {
        // Fetch real dashboard stats and tasks
        const [dashboardRes, tasksRes] = await Promise.all([
          fetch('/api/advertiser/dashboard', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch('/api/advertiser/tasks', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          // Map DB tasks to the UI's Campaign model since the Video Builder creates Tasks
          const mappedCampaigns = tasksData.map((t: any) => {
             let loc = 'All';
             try { if(t.targetLocations) { const parsed = JSON.parse(t.targetLocations); loc = Array.isArray(parsed) ? parsed.join(', ') : 'All'; } } catch(e){}
             return {
             id: t.id.toString(),
             name: t.titleEn || t.titleAr || 'Untitled Campaign',
             status: t.status,
             budget: Number(t.totalBudget || 0),
             spent: Number(t.reward || 0) * Number(t.currentCompletions || 0),
             tasksCompleted: t.currentCompletions || 0,
             tasksTotal: t.completionsNeeded || t.maxCompletions || 1000,
             startDate: t.createdAt,
             endDate: new Date(new Date(t.createdAt).getTime() + (t.duration || 30)*24*60*60*1000).toISOString(),
             targetAudience: { location: loc },
             performance: {
               impressions: (t.currentCompletions || 0) * 2,
               clicks: Math.floor((t.currentCompletions || 0) * 1.5),
               conversions: t.currentCompletions || 0,
               ctr: 5.4,
               roi: 120
             }
          }});
          setAdvertiserCampaigns(mappedCampaigns);
          setAdvertiserTasks(tasksData);
        }
      } catch (err) {
         console.error('Failed to fetch real advertiser data', err);
      }
    };

    // Try to load advertiser from localStorage (from API login)
    const savedAdvertiserInfo = localStorage.getItem('advertiser-info');
    if (savedAdvertiserInfo) {
      try {
        const advertiserData = JSON.parse(savedAdvertiserInfo);
        setCurrentAdvertiser(advertiserData);
        setUserType('advertiser');
        fetchAdvertiserData(advertiserData);
      } catch (error) {
        console.error('Failed to parse advertiser info:', error);
        localStorage.removeItem('advertiser-info');
        localStorage.removeItem('currentAdvertiserId');
      }
    }
    setIsInitialized(true);
  }, []);

  // حفظ حالة تسجيل الدخول عند تغيير المعلن الحالي
  useEffect(() => {
    if (currentAdvertiser) {
      localStorage.setItem('currentAdvertiserId', currentAdvertiser.id);
    } else {
      localStorage.removeItem('currentAdvertiserId');
    }
  }, [currentAdvertiser]);

  // دوال المستخدمين العاديين
  const updateBalance = (amount: number) => {
    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance + amount
    }) : null);
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'completed' as const }
        : task
    ));
  };

  const markNotificationAsRead = async (notificationId: string) => {
    // Update local state immediately for responsiveness
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId
        ? { ...notif, read: true }
        : notif
    ));

    // Update on server
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // دوال المعلنين
  const loginAdvertiser = async (advertiserId: string) => {
    // Note: Assuming advertiser authentication is handled before this sets context
    try {
        const [dashboardRes, tasksRes] = await Promise.all([
          fetch('/api/advertiser/dashboard', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch('/api/advertiser/tasks', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        if (dashboardRes.ok && tasksRes.ok) {
          const dashboardData = await dashboardRes.json();
          const tasksData = await tasksRes.json();
          
          setCurrentAdvertiser(dashboardData.advertiser);
          localStorage.setItem('advertiser-info', JSON.stringify(dashboardData.advertiser));
          localStorage.setItem('currentAdvertiserId', dashboardData.advertiser.id.toString());
          
          // Map DB tasks to the UI's Campaign model since the Video Builder creates Tasks
          const mappedCampaigns = tasksData.map((t: any) => {
             let loc = 'All';
             try { if(t.targetLocations) { const parsed = JSON.parse(t.targetLocations); loc = Array.isArray(parsed) ? parsed.join(', ') : 'All'; } } catch(e){}
             return {
             id: t.id.toString(),
             name: t.titleEn || t.titleAr || 'Untitled Campaign',
             status: t.status,
             budget: Number(t.totalBudget || 0),
             spent: Number(t.reward || 0) * Number(t.currentCompletions || 0),
             tasksCompleted: t.currentCompletions || 0,
             tasksTotal: t.completionsNeeded || t.maxCompletions || 1000,
             startDate: t.createdAt,
             endDate: new Date(new Date(t.createdAt).getTime() + (t.duration || 30)*24*60*60*1000).toISOString(),
             targetAudience: { location: loc },
             performance: {
               impressions: (t.currentCompletions || 0) * 2,
               clicks: Math.floor((t.currentCompletions || 0) * 1.5),
               conversions: t.currentCompletions || 0,
               ctr: 5.4,
               roi: 120
             }
          }});
          
          setAdvertiserCampaigns(mappedCampaigns);
          setAdvertiserTasks(tasksData);
          setUserType('advertiser');
        }
    } catch (err) {
      console.error('Failed to parse advertiser login info', err);
    }
  };

  const logoutAdvertiser = () => {
    setCurrentAdvertiser(null);
    setAdvertiserCampaigns([]);
    setAdvertiserTasks([]);
    setUserType('user');
    localStorage.removeItem('currentAdvertiserId');
  };

  // Create a default user object for non-authenticated state
  const defaultUser: User = {
    id: 0,
    openId: '',
    name: 'Guest',
    email: '',
    phone: null,
    avatar: null,
    balance: 0,
    tier: 'tier1',
    completedTasks: 0,
    totalEarnings: 0,
    joinDate: new Date().toISOString(),
    verified: false,
    profileStrength: 0,
    countryId: null,
    role: 'user',
  };

  return (
    <AppContext.Provider value={{
      // بيانات المستخدمين العاديين - use authenticated user or default
      user: user || defaultUser,
      tasks,
      transactions,
      notifications,

      // بيانات المعلنين
      currentAdvertiser,
      advertiserCampaigns,
      advertiserTasks,

      // نوع المستخدم
      userType,
      setUserType,
      setUser,

      // حالة التحميل
      isInitialized,
      isLoading: authLoading,

      // دوال المستخدمين العاديين
      updateBalance,
      completeTask,
      markNotificationAsRead,
      refreshTransactions: fetchTransactions,
      refreshUser: refreshAuthUser,

      // دوال المعلنين
      loginAdvertiser,
      logoutAdvertiser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
