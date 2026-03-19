import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { PWAUpdateBanner } from "./components/PWAUpdateBanner";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

// User Pages
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import VideoTask from "./pages/VideoTask";
import AppTask from "./pages/AppTask";
import QuizTask from "./pages/QuizTask";
import SocialTask from "./pages/SocialTask";
import VisitTask from "./pages/VisitTask";
import PhotoTask from "./pages/PhotoTask";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Referral from "./pages/Referral";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import EditProfile from "./pages/EditProfile";
import MyTier from "./pages/MyTier";
import ProfileQuestionsSection from "./pages/ProfileQuestionsSection";
import MyDisputes from "./pages/MyDisputes";
import AlgorithmTransparency from "./pages/AlgorithmTransparency";
import TransparencyDashboard from "./pages/TransparencyDashboard";
import UserProfile from "./pages/UserProfile";
import AdvertiserPage from "./pages/AdvertiserPageDynamic";
import TaskCompletion from "./pages/TaskCompletion";
import SurveyCompletion from "./pages/SurveyCompletion";
import Gamification from "./pages/Gamification";
import PhoneLogin from "./pages/PhoneLogin";
import ProfileComplete from "./pages/ProfileComplete";

// Advertiser Pages
import AdvertiserDashboard from "./pages/advertiser/Dashboard";

import Analytics from "./pages/advertiser/Analytics";
import Reports from "./pages/advertiser/Reports";
import Billing from "./pages/advertiser/Billing";
import AdvertiserLogin from "./pages/advertiser/AdvertiserLogin";
import AdvertiserRegister from "./pages/advertiser/AdvertiserRegister";
import CampaignList from "./pages/advertiser/CampaignList";
import CampaignDetails from "./pages/advertiser/CampaignDetails";
import TaskReviewQueue from "./pages/advertiser/TaskReviewQueue";
import AdvertiserTasks from "./pages/advertiser/AdvertiserTasks";
import AdvertiserProfile from "./pages/advertiser/AdvertiserProfile";
import PaymentMethods from "./pages/advertiser/PaymentMethods";
import TeamManagement from "./pages/advertiser/TeamManagement";
import AccountSettings from "./pages/advertiser/AccountSettings";
import AudienceInsights from "./pages/advertiser/AudienceInsights";
import EditCampaign from "./pages/advertiser/EditCampaign";
import MultiTaskCampaignBuilder from "./pages/advertiser/MultiTaskCampaignBuilder";
import AdvertiserDashboardLegacy from "./pages/AdvertiserDashboard";
import CampaignAnalytics from "./pages/CampaignAnalytics";
import TaskBuilder from "./pages/TaskBuilder";
import CreateTask from "./pages/advertiser/CreateTask";
import TaskReview from "./pages/advertiser/TaskReview";
import CampaignPerformance from "./pages/advertiser/CampaignPerformance";
import CampaignBuilder from "./pages/advertiser/CampaignBuilder";
import AnalyticsDashboard from "./pages/advertiser/AnalyticsDashboard";
import NewDashboard from "./pages/advertiser/NewDashboard";
import TaskDetailReview from "./pages/advertiser/TaskDetailReview";
import RejectedTasks from "./pages/advertiser/RejectedTasks";
import TransactionHistory from "./pages/advertiser/TransactionHistory";
import InvoiceDetail from "./pages/advertiser/InvoiceDetail";
import SupportCenter from "./pages/advertiser/SupportCenter";
import CompetitorAnalysis from "./pages/advertiser/CompetitorAnalysis";
import SuccessStories from "./pages/advertiser/SuccessStories";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import TaskHistory from "./pages/TaskHistory";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import OTPVerification from "./pages/OTPVerification";
import CompleteProfile from "./pages/CompleteProfile";
import IdentityVerification from "./pages/IdentityVerification";
import UploadID from "./pages/UploadID";
import SelfieCapture from "./pages/SelfieCapture";
import ProfileQuestions1 from "./pages/ProfileQuestions1";
import ProfileQuestions2 from "./pages/ProfileQuestions2";
import ProfileQuestions3 from "./pages/ProfileQuestions3";
import ProfileQuestions4 from "./pages/ProfileQuestions4";
import WithdrawSuccess from "./pages/WithdrawSuccess";
import PlatformDashboard from "./pages/PlatformDashboard";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import LandingPage from "./pages/LandingPage";
import Blog from "./pages/Blog";

import AdminLogin from "./pages/admin/AdminLogin";
import UsersManagement from "./pages/admin/UsersManagement";
import AdvertisersManagement from "./pages/admin/AdvertisersManagement";
import ReportedTasks from "./pages/admin/ReportedTasks";
import PlatformSettings from "./pages/admin/PlatformSettings";
import NewAdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminTasks from "./pages/admin/Tasks";
import UsersManagementNew from "./pages/admin/UsersManagementNew";
import AdvertisersManagementNew from "./pages/admin/AdvertisersManagementNew";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import FinancialControl from "./pages/admin/FinancialControl";
import PlatformOperations from "./pages/admin/PlatformOperations";
import WalletDashboard from "./pages/admin/WalletDashboard";
import AdminCurrencyRates from "./pages/admin/AdminCurrencyRates";
import AdminCampaignReview from "./pages/admin/AdminCampaignReview";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminFraudDashboard from "./pages/admin/AdminFraudDashboard";
import AdminAnalyticsDashboard from "./pages/admin/AdminAnalyticsDashboard";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import CookieConsentBanner from "./components/CookieConsentBanner";
import AdvertiserLayout from "./components/layout/AdvertiserLayout";
import { AdvertiserProtectedRoute } from "./components/AdvertiserProtectedRoute";
import Referrals from "./pages/Referrals";
import Levels from "./pages/Levels";
import Badges from "./pages/Badges";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";

// Compliance & Privacy Pages
import ProfileTierQuestions from "./pages/ProfileTierQuestions";
import PrivacyCenter from "./pages/PrivacyCenter";
import KYCVerification from "./pages/KYCVerification";

// Survey Framework Pages
import SurveyBuilder from "./pages/SurveyBuilder";
import CampaignLaunch from "./pages/CampaignLaunch";
import TakeSurvey from "./pages/TakeSurvey";
import AvailableSurveys from "./pages/AvailableSurveys";

// Vote Framework Pages
import VoteBuilder from "./pages/VoteBuilder";
import VoteCampaignLaunch from "./pages/VoteCampaignLaunch";
// Multi-Task Campaign Pages
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import TakeVote from "./pages/TakeVote";
import AvailableVotes from "./pages/AvailableVotes";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      {/* Splash */}
      <Route path="/splash" component={Splash} />
      <Route path="/welcome" component={Welcome} />

      {/* Auth Routes */}
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/phone-login" component={PhoneLogin} />
      <Route path="/register" component={Register} />
      <Route path="/profile/complete" component={ProfileComplete} />
      <Route path="/otp-verification" component={OTPVerification} />
      <Route path="/complete-profile" component={CompleteProfile} />
      <Route path="/identity-verification" component={IdentityVerification} />
      <Route path="/upload-id" component={UploadID} />
      <Route path="/selfie-capture" component={SelfieCapture} />
      <Route path="/profile-questions-1" component={ProfileQuestions1} />
      <Route path="/profile-questions-2" component={ProfileQuestions2} />
      <Route path="/profile-questions-3" component={ProfileQuestions3} />
      <Route path="/profile-questions-4" component={ProfileQuestions4} />

      {/* User Routes */}
      <Route path="/">
        <Redirect to="/splash" />
      </Route>
      <Route path="/home" component={Home} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/tasks/history" component={TaskHistory} />
      <Route path="/tasks/:id" component={TaskDetail} />

      <Route path="/task/video" component={VideoTask} />
      <Route path="/tasks/:id/complete" component={TaskCompletion} />
      <Route path="/tasks/:id/survey" component={SurveyCompletion} />
      <Route path="/tasks/:id/app" component={AppTask} />
      <Route path="/tasks/:id/quiz" component={QuizTask} />
      <Route path="/tasks/:id/social" component={SocialTask} />
      <Route path="/tasks/:id/visit" component={VisitTask} />
      <Route path="/tasks/:id/photo" component={PhotoTask} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-tier" component={MyTier} />
      <Route path="/profile/questions/:sectionKey" component={ProfileQuestionsSection} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route path="/referral" component={Referral} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/levels" component={Levels} />
      <Route path="/badges" component={Badges} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/gamification" component={Gamification} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaigns/:id" component={CampaignDetail} />
      <Route path="/profile/edit" component={EditProfile} />
      <Route path="/profile/language" component={Settings} />
      <Route path="/my-disputes" component={MyDisputes} />
      <Route path="/algorithm-transparency" component={AlgorithmTransparency} />
      <Route path="/transparency" component={TransparencyDashboard} />
      <Route path="/user/:userId" component={UserProfile} />
      <Route path="/faq" component={FAQ} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={PrivacyCenter} />
      <Route path="/withdraw-success" component={WithdrawSuccess} />
      <Route path="/platform-dashboard" component={PlatformDashboard} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/blog" component={Blog} />
      <Route path="/profile/payment-methods" component={PaymentMethodsPage} />

      {/* Compliance & Privacy Routes */}
      <Route path="/privacy" component={PrivacyCenter} />
      <Route path="/profile/tier-questions" component={ProfileTierQuestions} />
      <Route path="/privacy-center" component={PrivacyCenter} />
      <Route path="/kyc-verification" component={KYCVerification} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <AdminProtectedRoute><NewAdminDashboard /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/dashboard">
        <AdminProtectedRoute><NewAdminDashboard /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <AdminProtectedRoute><UsersManagementNew /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/users-manage">
        <AdminProtectedRoute><UsersManagementNew /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/advertisers">
        <AdminProtectedRoute><AdvertisersManagementNew /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/advertisers-manage">
        <AdminProtectedRoute><AdvertisersManagementNew /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/wallet-hub">
        <AdminProtectedRoute><WalletDashboard /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/tasks">
        <AdminProtectedRoute><AdminTasks /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/reports">
        <AdminProtectedRoute><ReportedTasks /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/financials">
        <AdminProtectedRoute><FinancialControl /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/operations">
        <AdminProtectedRoute><PlatformOperations /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminProtectedRoute><PlatformSettings /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/currency-rates">
        <AdminProtectedRoute><AdminCurrencyRates /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/withdrawals">
        <AdminProtectedRoute><AdminWithdrawals /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/campaign-review">
        <AdminProtectedRoute><AdminCampaignReview /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/disputes">
        <AdminProtectedRoute><AdminDisputes /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/fraud">
        <AdminProtectedRoute><AdminFraudDashboard /></AdminProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <AdminProtectedRoute><AdminAnalyticsDashboard /></AdminProtectedRoute>
      </Route>

      {/* Advertiser Routes */}
      <Route path="/advertiser/login" component={AdvertiserLogin} />
      <Route path="/advertiser/register" component={AdvertiserRegister} />
      <Route path="/advertiser/dashboard"><AdvertiserProtectedRoute><AdvertiserLayout><AdvertiserDashboard /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/campaigns"><AdvertiserProtectedRoute><AdvertiserLayout><CampaignList /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/campaigns/new"><AdvertiserProtectedRoute><AdvertiserLayout><CampaignBuilder /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/analytics-dashboard"><AdvertiserProtectedRoute><AdvertiserLayout><AnalyticsDashboard /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/new-dashboard"><AdvertiserProtectedRoute><AdvertiserLayout><NewDashboard /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/campaigns/:id"><AdvertiserProtectedRoute><AdvertiserLayout><CampaignDetails /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/campaigns/multi-task/new"><AdvertiserProtectedRoute><AdvertiserLayout><MultiTaskCampaignBuilder /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/tasks"><AdvertiserProtectedRoute><AdvertiserLayout><AdvertiserTasks /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/tasks/create"><AdvertiserProtectedRoute><AdvertiserLayout><CreateTask /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/tasks/:id/submissions"><AdvertiserProtectedRoute><AdvertiserLayout><TaskReview /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/tasks/review"><AdvertiserProtectedRoute><AdvertiserLayout><TaskReviewQueue /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/profile"><AdvertiserProtectedRoute><AdvertiserLayout><AdvertiserProfile /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/analytics"><AdvertiserProtectedRoute><AdvertiserLayout><Analytics /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/reports"><AdvertiserProtectedRoute><AdvertiserLayout><Reports /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/billing"><AdvertiserProtectedRoute><AdvertiserLayout><Billing /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/payment-methods"><AdvertiserProtectedRoute><AdvertiserLayout><PaymentMethods /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/team"><AdvertiserProtectedRoute><AdvertiserLayout><TeamManagement /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/settings"><AdvertiserProtectedRoute><AdvertiserLayout><AccountSettings /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/audience"><AdvertiserProtectedRoute><AdvertiserLayout><AudienceInsights /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/campaigns/:id/edit"><AdvertiserProtectedRoute><AdvertiserLayout><EditCampaign /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/campaigns/:id/performance"><AdvertiserProtectedRoute><AdvertiserLayout><CampaignPerformance /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/tasks/:id/review"><AdvertiserProtectedRoute><AdvertiserLayout><TaskDetailReview /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/tasks/rejected"><AdvertiserProtectedRoute><AdvertiserLayout><RejectedTasks /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/transactions"><AdvertiserProtectedRoute><AdvertiserLayout><TransactionHistory /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/invoices/:id"><AdvertiserProtectedRoute><AdvertiserLayout><InvoiceDetail /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/support"><AdvertiserProtectedRoute><AdvertiserLayout><SupportCenter /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/competitors"><AdvertiserProtectedRoute><AdvertiserLayout><CompetitorAnalysis /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/success-stories"><AdvertiserProtectedRoute><AdvertiserLayout><SuccessStories /></AdvertiserLayout></AdvertiserProtectedRoute></Route>
      <Route path="/advertiser/:advertiserId" component={AdvertiserPage} />

      {/* Survey Framework Routes */}
      <Route path="/advertiser/surveys/new" component={SurveyBuilder} />
      <Route path="/advertiser/surveys/:surveyId/edit" component={SurveyBuilder} />
      <Route path="/advertiser/surveys/:surveyId/launch" component={CampaignLaunch} />
      <Route path="/surveys" component={AvailableSurveys} />
      <Route path="/surveys/:surveyId/:campaignId" component={TakeSurvey} />

      {/* Vote Framework Routes */}
      <Route path="/advertiser/votes/new" component={VoteBuilder} />
      <Route path="/advertiser/votes/:id/launch" component={VoteCampaignLaunch} />
      <Route path="/votes" component={AvailableVotes} />
      <Route path="/votes/:id/:campaignId" component={TakeVote} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Implement Android hardware back button handler
    const setupBackButton = async () => {
      await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        const path = window.location.pathname;
        const rootPaths = ['/', '/home', '/login', '/welcome', '/splash', '/onboarding'];

        // Exit app if on main screens
        if (rootPaths.includes(path)) {
          CapacitorApp.exitApp();
        } else if (canGoBack) {
          // Go back in web history instead of closing
          window.history.back();
        } else {
          CapacitorApp.exitApp();
        }
      });
    };

    if (Capacitor.isNativePlatform()) {
      setupBackButton();
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AppProvider>
          <TooltipProvider>
            <PWAUpdateBanner />
            <Toaster />
            <Router />
            <PWAInstallBanner />
            <CookieConsentBanner />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

