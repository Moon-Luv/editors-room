import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Mail, 
  Lock, 
  Database,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/src/lib/supabase';
import { motion } from 'motion/react';

export const Settings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground">Configure your dashboard and application preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5" />
          Settings updated successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Tabs (Vertical) */}
        <div className="lg:col-span-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-muted/50 text-primary">
            <User className="w-4 h-4" /> Profile Information
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-muted/50">
            <Bell className="w-4 h-4" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-muted/50">
            <Shield className="w-4 h-4" /> Security & Privacy
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-muted/50">
            <Globe className="w-4 h-4" /> General Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-muted/50">
            <Database className="w-4 h-4" /> System & API
          </Button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <section className="p-8 rounded-2xl bg-card border border-border space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold text-2xl text-white border-4 border-border">
                AD
              </div>
              <div>
                <h3 className="text-xl font-bold">Admin Profile</h3>
                <p className="text-sm text-muted-foreground">Manage your personal information and avatar.</p>
                <Button variant="outline" size="sm" className="mt-2 text-xs border-border bg-muted/50">Change Avatar</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" defaultValue="Super Admin" className="bg-muted/50 border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue="admin@editorsroom.com" className="bg-muted/50 border-border" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself..." className="bg-muted/50 border-border min-h-[100px]" />
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="p-8 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="text-xl font-bold">Notifications</h3>
            <p className="text-sm text-muted-foreground">Control which alerts you receive and how.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive daily summaries of bookings and activity.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <p className="font-medium">Real-time Alerts</p>
                  <p className="text-xs text-muted-foreground">Get instant browser notifications for new messages.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <p className="font-medium">System Status</p>
                  <p className="text-xs text-muted-foreground">Notify me about critical system updates or downtime.</p>
                </div>
                <Switch className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="p-8 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="text-xl font-bold">Security</h3>
            <p className="text-sm text-muted-foreground">Update your password and manage account security.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input id="current_password" type="password" className="bg-muted/50 border-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" className="bg-muted/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input id="confirm_password" type="password" className="bg-muted/50 border-border" />
                </div>
              </div>
              <Button variant="outline" className="w-full border-border bg-muted/50 mt-4">Update Password</Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="p-8 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-6">
            <h3 className="text-xl font-bold text-rose-500">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">Irreversible actions for your account.</p>

            <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="space-y-0.5">
                <p className="font-medium text-rose-500">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently remove your admin account and data.</p>
              </div>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
