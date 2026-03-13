import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Camera, User as UserIcon, Mail, Phone, Calendar, AlertTriangle } from 'lucide-react';
import type { User } from '@/contexts/AppContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function EditProfile() {
  const { t } = useTranslation();
  const { user, setUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    phone: user?.phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error(t('pleaseTypeDelete', 'Please type DELETE to confirm'));
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success(t('accountDeleted', 'Account deleted successfully'));
        // Clear local storage and redirect
        localStorage.clear();
        window.location.href = '/welcome';
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('accountDeleteFailed', 'Failed to delete account'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to format date safely
  const formatJoinDate = (dateValue: string | Date | undefined | null): string => {
    if (!dateValue) return t('notAvailable');
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return t('notAvailable');
      return date.toLocaleDateString();
    } catch {
      return t('notAvailable');
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('editProfile.invalidFileType', 'Please select an image file'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('editProfile.fileTooLarge', 'Image size must be less than 5MB'));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload photo
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await response.json();
      
      if (data.success && user) {
        setUser({ ...user, avatar: data.avatarUrl } as User);
        toast.success(t('editProfile.photoUpdated', 'Profile photo updated successfully!'));
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(t('editProfile.photoUploadFailed', 'Failed to upload photo'));
      setPreviewAvatar(user?.avatar); // Revert preview on error
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      if (data.success && user) {
        // Update local user state
        setUser({ ...user, ...formData } as User);
        toast.success(t('profileUpdated'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profileUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MobileLayout title={t('editProfile')} showBack>
      <div className="p-4 space-y-6">
        {/* Avatar */}
        <Card className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={previewAvatar || '/default-avatar.png'}
                alt={user?.name}
                className="w-24 h-24 rounded-full border-4 border-primary object-cover"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button 
                onClick={handlePhotoClick}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50"
              >
                {isUploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {t('clickToChangePhoto')}
            </p>
          </div>
        </Card>

        {/* Personal Info */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold mb-4">
            {t('personalInfo')}
          </h3>
          
          <div>
            <Label htmlFor="name">
              {t('fullName')}
            </Label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pr-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">
              {t('email')}
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pr-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">
              {t('phoneNumber')}
            </Label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pr-10"
              />
            </div>
          </div>

          <div>
            <Label>{t('joinDate')}</Label>
            <div className="relative">
              <Calendar className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                value={formatJoinDate(user?.createdAt || user?.joinDate)}
                disabled
                className="pr-10 bg-muted"
              />
            </div>
          </div>
        </Card>

        {/* Account Statistics */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{t('accountStats')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user?.completedTasks}</div>
              <div className="text-sm text-muted-foreground">{t('completedTasks')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user?.totalEarnings}</div>
              <div className="text-sm text-muted-foreground">{t('totalEarnings')}</div>
            </div>
          </div>
        </Card>

        {/* Verification Status */}
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold mb-4">{t('verification')}</h3>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="text-sm">{t('email')}</span>
            </div>
            <span className="text-sm text-green-600 font-medium">{t('verified')}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="text-sm">{t('phoneNumber')}</span>
            </div>
            <span className="text-sm text-green-600 font-medium">{t('verified')}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{t('nationalId')}</span>
            </div>
            <Button variant="outline" size="sm">{t('verify')}</Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('saving') : t('saveChanges')}
          </Button>
          <Button variant="outline" className="w-full">
            {t('cancel')}
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="font-semibold text-red-600 mb-2">{t('dangerZone')}</h3>
          <p className="text-sm text-red-600 mb-4">
            {t('accountDeletionWarning')}
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                {t('deleteAccount')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  {t('confirmDeleteAccount', 'Confirm Account Deletion')}
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p className="text-red-600 font-medium">
                    {t('deleteAccountWarning', 'This action cannot be undone. All your data, earnings, and task history will be permanently deleted.')}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      {t('typeDeleteToConfirm', 'Type DELETE to confirm:')}
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="border-red-300 focus:border-red-500"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                  {t('cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? t('deleting', 'Deleting...') : t('deleteAccount')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </MobileLayout>
  );
}
