import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone, Smartphone, BellRing, Settings2, Globe, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformOperations() {
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');

  const handleSendPush = () => {
    if (!pushTitle || !pushBody) {
      toast.error('Please enter both title and body for the push notification.');
      return;
    }
    toast.success(`Push notification sent to ${targetAudience} users!`);
    setPushTitle('');
    setPushBody('');
  };

  const handleUpdateAppVersion = () => {
    toast.success('App version requirements updated successfully.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Platform Operations</h1>
          <p className="text-muted-foreground mt-1">Manage global communications, app versions, and critical system controls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Push Notifications Center */}
        <Card className="border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5">
            <Megaphone className="w-48 h-48 -mr-12 -mt-12 text-blue-600" />
          </div>
          <CardHeader className="pb-3 border-b bg-blue-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-900 relative z-10">
              <BellRing className="w-5 h-5 text-blue-600" />
              Communication Center
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative z-10 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Send instant push notifications or in-app alerts to users directly to their devices.</p>
            
            <div className="space-y-2">
              <Label htmlFor="target">Target Audience</Label>
              <select
                id="target"
                title="Target Audience"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="all">All Users (Global Broadcast)</option>
                <option value="active">Active Users (Last 7 Days)</option>
                <option value="inactive">Inactive Users</option>
                <option value="bronze">Bronze Tier Only</option>
                <option value="platinum">Platinum Tier Only</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pushTitle">Notification Title</Label>
              <Input 
                id="pushTitle" 
                placeholder="e.g. New Mega Campaign Available!" 
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pushBody">Message Body</Label>
              <Textarea 
                id="pushBody" 
                placeholder="Type your message here..." 
                className="resize-none h-24"
                value={pushBody}
                onChange={(e) => setPushBody(e.target.value)}
              />
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSendPush}>
              <Megaphone className="w-4 h-4 mr-2" />
              Broadcast Message
            </Button>
          </CardContent>
        </Card>

        {/* System & App Controls */}
        <div className="space-y-6">
          <Card className="border-purple-100 shadow-sm">
            <CardHeader className="pb-3 border-b bg-purple-50/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-900">
                <Smartphone className="w-5 h-5 text-purple-600" />
                Mobile App Version Control
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">Ensure users are running the latest stable version of the mobile app to avoid bugs.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAndroid">Min Android Version</Label>
                  <Input id="minAndroid" defaultValue="1.2.4" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minIos">Min iOS Version</Label>
                  <Input id="minIos" defaultValue="1.2.5" />
                </div>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <strong>Warning:</strong> Updating these minimums will trigger a "Force Update" screen for all users on older versions immediately upon app launch.
                </div>
              </div>

              <Button variant="outline" className="w-full mt-2" onClick={handleUpdateAppVersion}>
                Update Enforced Versions
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader className="pb-3 border-b bg-green-50/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-green-900">
                <Globe className="w-5 h-5 text-green-600" />
                Active Regions & Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Egypt</span>
                <Badge className="bg-green-100 text-green-800 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">The platform is currently locked to Egyptian phone numbers (+20) and IP addresses.</p>
              <Button variant="outline" disabled className="w-full opacity-50 cursor-not-allowed">
                Expand Region (Locked for Phase 1)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
