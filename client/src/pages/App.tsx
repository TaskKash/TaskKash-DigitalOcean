import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import DemoModeBanner from "./components/DemoModeBanner";

// 🦥 Lazy-loaded: heavy pages (only loaded when route is accessed)
const SurveyBuilder = lazy(() => import("./pages/SurveyBuilder"));
const VoteBuilder = lazy(() => import("./pages/VoteBuilder"));
const TaskBuilder = lazy(() => import("./pages/TaskBuilder"));
const CampaignLaunch = lazy(() => import("./pages/CampaignLaunch"));
const VoteCampaignLaunch = lazy(() => import("./pages/VoteCampaignLaunch"));
const CampaignDetail = lazy(() => import("./pages/CampaignDetail"));
const KYCVerification = lazy(() => import("./pages/KYCVerification"));
const PrivacyCenter = lazy(() => import("./pages/PrivacyCenter"));
const TakeSurvey = lazy(() => import("./pages/TakeSurvey"));
const TakeVote = lazy(() => import("./pages/TakeVote"));
// Dev-only showcase — excluded from production bundle
const ComponentShowcase = import.meta.env.DEV
  ? lazy(() => import("./pages/ComponentShowcase"))
  : null;

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

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
import CreateCampaign from "./pages/advertiser/CreateCampaign";
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

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
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
import Referrals from "./pages/Referrals";
import Levels from "./pages/Levels";
import Badges from "./pages/Badges";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";

// Compliance & Privacy Pages (eagerly loaded as they're lightweight)
import ConsentPreferences from "./pages/ConsentPreferences";
import ProfileTierQuestions from "./pages/ProfileTierQuestions";
import AvailableSurveys from "./pages/AvailableSurveys";
import Campaigns from "./pages/Campaigns";
import AvailableVotes from "./pages/AvailableVotes";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

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
      <Route path="/privacy" component={Privacy} />
      <Route path="/tasks/history" component={TaskHistory} />
      <Route path="/withdraw-success" component={WithdrawSuccess} />
      <Route path="/platform-dashboard" component={PlatformDashboard} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/blog" component={Blog} />
      <Route path="/profile/payment-methods" component={PaymentMethodsPage} />
      
      {/* Compliance & Privacy Routes */}
      <Route path="/settings/consent" component={ConsentPreferences} />
      <Route path="/profile/tier-questions" component={ProfileTierQuestions} />
      <Route path="/privacy-center" component={PrivacyCenter} />
      <Route path="/kyc-verification" component={KYCVerification} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={UsersManagement} />
      <Route path="/admin/advertisers" component={AdvertisersManagement} />
      <Route path="/admin/reports" component={ReportedTasks} />
      <Route path="/admin/settings" component={PlatformSettings} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={NewAdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/users-manage" component={UsersManagementNew} />
      <Route path="/admin/advertisers-manage" component={AdvertisersManagementNew} />
      <Route path="/admin/tasks" component={AdminTasks} />
      <Route path="/admin/advertisers" component={AdvertisersManagement} />
      <Route path="/admin/transactions" component={ReportedTasks} />
      <Route path="/admin/countries" component={PlatformSettings} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} />
      
      {/* Advertiser Routes */}
      <Route path="/advertiser/login" component={AdvertiserLogin} />
      <Route path="/advertiser/register" component={AdvertiserRegister} />
      <Route path="/advertiser/dashboard" component={AdvertiserDashboard} />
      <Route path="/advertiser/campaigns" component={CampaignList} />
      <Route path="/advertiser/campaigns/new" component={CreateCampaign} />
      <Route path="/advertiser/campaign-builder" component={CampaignBuilder} />
      <Route path="/advertiser/analytics-dashboard" component={AnalyticsDashboard} />
      <Route path="/advertiser/new-dashboard" component={NewDashboard} />
      <Route path="/advertiser/campaigns/:id" component={CampaignDetails} />
      <Route path="/advertiser/campaigns/multi-task/new" component={MultiTaskCampaignBuilder} />
      <Route path="/advertiser/tasks" component={AdvertiserTasks} />
      <Route path="/advertiser/tasks/create" component={CreateTask} />
      <Route path="/advertiser/tasks/:id/submissions" component={TaskReview} />
      <Route path="/advertiser/tasks/review" component={TaskReviewQueue} />
      <Route path="/advertiser/profile" component={AdvertiserProfile} />
      <Route path="/advertiser/analytics" component={Analytics} />
      <Route path="/advertiser/reports" component={Reports} />
      <Route path="/advertiser/billing" component={Billing} />
      <Route path="/advertiser/payment-methods" component={PaymentMethods} />
      <Route path="/advertiser/team" component={TeamManagement} />
      <Route path="/advertiser/settings" component={AccountSettings} />
      <Route path="/advertiser/audience" component={AudienceInsights} />
      <Route path="/advertiser/campaigns/:id/edit" component={EditCampaign} />
      <Route path="/advertiser/campaigns/:id/performance" component={CampaignPerformance} />
      <Route path="/advertiser/tasks/:id/review" component={TaskDetailReview} />
      <Route path="/advertiser/tasks/rejected" component={RejectedTasks} />
      <Route path="/advertiser/transactions" component={TransactionHistory} />
      <Route path="/advertiser/invoices/:id" component={InvoiceDetail} />
      <Route path="/advertiser/support" component={SupportCenter} />
      <Route path="/advertiser/competitors" component={CompetitorAnalysis} />
      <Route path="/advertiser/success-stories" component={SuccessStories} />
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
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <DemoModeBanner />
            <Suspense fallback={<PageLoader />}>
              <Router />
            </Suspense>
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

