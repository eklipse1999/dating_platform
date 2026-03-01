'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Edit, Save, X, MapPin, Briefcase, Heart,
  Church, BookOpen, Award, Shield, Loader2, Upload,
  CheckCircle, XCircle, Clock, AlertCircle, Key, Lock,
  Smartphone, Mail, RefreshCw, User
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/app-context';
import { usersService } from '@/lib/api/services/users.service';
import { toast } from 'sonner';
import { TierBadge } from '@/components/tier-badge';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, isAdmin, isLoading: authLoading } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    age: 25,
    gender: 'male' as 'male' | 'female',
    phone: '',
    bio: '',
    career: '',
    denomination: '',
    country: '',
    city: '',
    interests: [] as string[],
    values: [] as string[],
    faithJourney: '',
    churchName: '',
    churchBranch: '',
    lookingFor: '',   // maps to 'looking_for' in API
  });

  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [idVerification, setIdVerification] = useState({
    status: 'pending' as 'pending' | 'submitted' | 'verified' | 'rejected',
    documentType: '',
    submittedAt: null as Date | null,
    verifiedAt: null as Date | null,
    rejectionReason: '',
  });
  const [idDocument, setIdDocument] = useState<File | null>(null);

  const [securitySettings, setSecuritySettings] = useState({
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    lastPasswordChange: null as Date | null,
  });

  useEffect(() => {
    if (isAdmin) { router.push('/admin'); return; }
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    loadProfileData();
  }, [isAdmin, isAuthenticated, router]);

  const loadProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      const userProfile = await usersService.getCurrentUser();

      // Normalise — backend may return PascalCase (FirstName) or snake_case (first_name)
      const p = userProfile as any;
      const pick = (...keys: string[]) => {
        for (const k of keys) { if (p[k] !== undefined && p[k] !== null && p[k] !== '') return p[k]; }
        return undefined;
      };
      setProfileData({
        first_name:   pick('first_name',   'FirstName',   'firstName')    || currentUser?.first_name || '',
        last_name:    pick('last_name',    'LastName',    'lastName')     || currentUser?.last_name  || '',
        username:     pick('user_name',    'UserName',    'username',  'Username', 'name', 'Name') || currentUser?.name || '',
        email:        pick('email',        'Email')                       || currentUser?.email || '',
        age:          pick('age',          'Age')                         || currentUser?.age   || 25,
        gender:      (pick('gender',       'Gender')                      || currentUser?.gender || 'male') as 'male' | 'female',
        phone:        pick('phone',        'Phone')                       || currentUser?.phone || '',
        bio:          pick('bio',          'Bio')                         || '',
        career:       pick('career',       'Career')                      || '',
        denomination: pick('denomination', 'Denomination')                || '',
        country:      pick('country',      'Country')    || p.location?.country || currentUser?.location?.country || '',
        city:         pick('city',         'City')       || p.location?.city    || currentUser?.location?.city    || '',
        interests:    pick('interests',    'Interests')                   || [],
        values:       pick('values',       'Values')                      || [],
        faithJourney: pick('faithJourney', 'FaithJourney', 'key', 'Key') || '',
        churchName:   pick('church_name',  'ChurchName',  'churchName')  || p.church?.name   || currentUser?.church?.name   || '',
        churchBranch: pick('church_branch','ChurchBranch','churchBranch') || p.church?.branch || currentUser?.church?.branch || '',
        lookingFor:   pick('looking_for',  'LookingFor',  'lookingFor')  || '',
      });

      // Load existing profile image — field is profile_image in flat schema
      if ((userProfile as any).profile_image || (userProfile as any).profileImage) {
        setProfileImageUrl((userProfile as any).profile_image || (userProfile as any).profileImage);
      }

      if (userProfile.idVerification) {
        setIdVerification({
          status: userProfile.idVerification.status || 'pending',
          documentType: userProfile.idVerification.documentType || '',
          submittedAt: userProfile.idVerification.submittedAt || null,
          verifiedAt: userProfile.idVerification.verifiedAt || null,
          rejectionReason: userProfile.idVerification.rejectionReason || '',
        });
      }

      if (userProfile.securityVerification) {
        setSecuritySettings({
          emailVerified: userProfile.securityVerification.emailVerified || false,
          phoneVerified: userProfile.securityVerification.phoneVerified || false,
          twoFactorEnabled: userProfile.securityVerification.twoFactorEnabled || false,
          lastPasswordChange: userProfile.securityVerification.lastPasswordChange || null,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Fall back to currentUser data from context (set at login/signup)
      if (currentUser) {
        const u = currentUser as any;
        setProfileData({
          first_name:   u.first_name   || u.FirstName   || '',
          last_name:    u.last_name    || u.LastName    || '',
          username:     u.name         || u.user_name   || u.UserName   || '',
          email:        u.email        || u.Email       || '',
          age:          u.age          || u.Age         || 25,
          gender:      (u.gender       || u.Gender      || 'male') as 'male' | 'female',
          phone:        u.phone        || u.Phone       || '',
          bio:          u.bio          || u.Bio         || '',
          career:       u.career       || u.Career      || '',
          denomination: u.denomination || u.Denomination|| '',
          country:      u.location?.country || '',
          city:         u.location?.city    || '',
          interests:    u.interests    || [],
          values:       u.values       || [],
          faithJourney: u.faithJourney || u.key         || '',
          churchName:   u.church?.name   || u.church_name   || '',
          churchBranch: u.church?.branch || u.church_branch || '',
          lookingFor:   u.looking_for    || u.lookingFor    || '',
        });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Handle photo file selection — show preview immediately
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    toast.success('Photo selected — click Save Changes to upload');
  };

  // Upload photo to backend, returns the URL
  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingPhoto(true);
      const url = await usersService.uploadPhoto(file);
      return url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let newImageUrl = profileImageUrl;

      // Upload photo first if one was selected
      if (selectedFile) {
        const uploaded = await uploadPhoto(selectedFile);
        if (uploaded) {
          newImageUrl = uploaded;
          setProfileImageUrl(uploaded);
          setPreviewUrl('');
          setSelectedFile(null);
        }
      }

      // PUT /update/user — EXACT fields from Swagger (image confirmed):
      // age, bio, career, church_branch, church_name, denomination, gender,
      // interests[], key, looking_for, profile_image
      // NOTE: first_name, last_name, phone, city, country are NOT accepted by this endpoint
      const updateData = {
        age:           profileData.age,
        bio:           profileData.bio          || undefined,
        career:        profileData.career       || undefined,
        church_branch: profileData.churchBranch || undefined,
        church_name:   profileData.churchName   || undefined,
        denomination:  profileData.denomination || undefined,
        gender:        profileData.gender,
        interests:     profileData.interests?.length ? profileData.interests : undefined,
        key:           profileData.faithJourney || undefined,  // faith journey → 'key'
        looking_for:   profileData.lookingFor   || undefined,
        ...(newImageUrl ? { profile_image: newImageUrl } : {}),
      };

      await usersService.updateProfile(updateData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      await loadProfileData();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl('');
    loadProfileData();
  };

  const handleIdDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocument(file);
      toast.success('Document selected. Click "Submit for Verification" to upload.');
    }
  };

  const handleSubmitIdVerification = async () => {
    if (!idDocument) { toast.error('Please select a document first'); return; }
    if (!idVerification.documentType) { toast.error('Please select a document type'); return; }
    try {
      toast.info('ID verification submission coming soon.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit document');
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':   return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'submitted':  return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'rejected':   return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:           return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const displayImage = previewUrl || profileImageUrl;

  if (!isAuthenticated || !currentUser) return null;

  if (isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving || isUploadingPhoto}>
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Save Changes</>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />Profile Picture
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden border-4 border-border">
                {displayImage ? (
                  <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{currentUser.avatar || '👤'}</span>
                )}
              </div>

              {/* Upload overlay — always visible in edit mode */}
              {isEditing && (
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  htmlFor="photo-upload"
                  className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-white text-xs font-medium">Change</span>
                    </>
                  )}
                </motion.label>
              )}

              {/* Always-visible camera button in edit mode */}
              {isEditing && (
                <label
                  htmlFor="photo-upload"
                  className="absolute -bottom-1 -right-1 w-9 h-9 bg-secondary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-secondary/90 transition-colors border-2 border-background"
                >
                  <Camera className="w-4 h-4 text-secondary-foreground" />
                </label>
              )}

              <input
                id="photo-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {profileData.first_name} {profileData.last_name}
              </h3>
              <p className="text-muted-foreground">@{profileData.username}</p>
              {(profileData.country) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {profileData.city ? `${profileData.city}, ` : ''}{profileData.country}
                </p>
              )}
              <div className="mt-2">
                <TierBadge tier={currentUser.tier} />
              </div>

              {/* Photo hint in edit mode */}
              <AnimatePresence>
                {isEditing && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground mt-2"
                  >
                    {selectedFile
                      ? `✓ "${selectedFile.name}" ready to upload`
                      : 'Click the camera icon to change your photo (max 5MB)'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input value={profileData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={profileData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={profileData.username} onChange={(e) => handleInputChange('username', e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label>Email <span className="text-xs text-muted-foreground">(cannot be changed)</span></Label>
              <Input value={profileData.email} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" min={18} max={120} value={profileData.age} onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 18)} disabled={!isEditing} />
            </div>
            <div>
              <Label>Gender</Label>
              <select
                value={profileData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                disabled={!isEditing}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profileData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} placeholder="+1 234 567 8900" />
            </div>
            <div>
              <Label>Career</Label>
              <Input value={profileData.career} onChange={(e) => handleInputChange('career', e.target.value)} disabled={!isEditing} placeholder="e.g., Software Engineer" />
            </div>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>City</Label>
              <Input value={profileData.city} onChange={(e) => handleInputChange('city', e.target.value)} disabled={!isEditing} placeholder="e.g., New York" />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={profileData.country} onChange={(e) => handleInputChange('country', e.target.value)} disabled={!isEditing} placeholder="e.g., USA" />
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />About Me
          </h2>
          <Label>Bio</Label>
          <Textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
            rows={4}
            className="mt-1"
          />
        </motion.div>

        {/* Faith */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Church className="w-5 h-5" />Faith & Church
          </h2>
          <div className="space-y-4">
            <div>
              <Label>Denomination</Label>
              <Input value={profileData.denomination} onChange={(e) => handleInputChange('denomination', e.target.value)} disabled={!isEditing} placeholder="e.g., Baptist, Catholic, Non-denominational" className="mt-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Church Name</Label>
                <Input value={profileData.churchName} onChange={(e) => handleInputChange('churchName', e.target.value)} disabled={!isEditing} placeholder="e.g., Hillsong Church" />
              </div>
              <div>
                <Label>Church Branch</Label>
                <Input value={profileData.churchBranch} onChange={(e) => handleInputChange('churchBranch', e.target.value)} disabled={!isEditing} placeholder="e.g., NYC Campus" />
              </div>
            </div>
            <div>
              <Label>Faith Journey</Label>
              <Textarea value={profileData.faithJourney} onChange={(e) => handleInputChange('faithJourney', e.target.value)} disabled={!isEditing} placeholder="Share your faith journey..." rows={4} className="mt-1" />
            </div>
            <div>
              <Label>Looking For</Label>
              <select
                value={profileData.lookingFor}
                onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                disabled={!isEditing}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select what you're looking for</option>
                <option value="marriage">Marriage</option>
                <option value="serious_relationship">Serious Relationship</option>
                <option value="friendship">Friendship</option>
                <option value="not_sure">Not Sure Yet</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ID Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5" />ID Verification
            </h2>
            {getVerificationStatusBadge(idVerification.status)}
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Verify your identity to increase trust and unlock premium features.</p>

            {idVerification.status === 'rejected' && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Rejection Reason:</strong> {idVerification.rejectionReason || 'Please resubmit your document'}
                </p>
              </div>
            )}

            {idVerification.status !== 'verified' && (
              <>
                <div>
                  <Label>Document Type</Label>
                  <select
                    value={idVerification.documentType}
                    onChange={(e) => setIdVerification(prev => ({ ...prev, documentType: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1"
                  >
                    <option value="">Select document type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID Card</option>
                  </select>
                </div>

                <div>
                  <Label>Upload Document</Label>
                  <label className="mt-2 flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {idDocument ? `✓ ${idDocument.name}` : 'Click to upload ID document'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF (max 10MB)</p>
                    </div>
                    <input type="file" accept="image/*,.pdf" onChange={handleIdDocumentSelect} className="hidden" />
                  </label>
                </div>

                <Button onClick={handleSubmitIdVerification} disabled={!idDocument || !idVerification.documentType} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />Submit for Verification
                </Button>
              </>
            )}

            {idVerification.status === 'verified' && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-300">Identity Verified</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Verified on {idVerification.verifiedAt ? new Date(idVerification.verifiedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />Security & Verification
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: Mail, label: 'Email Verification', value: profileData.email,
                verified: securitySettings.emailVerified, action: 'Verify Email',
              },
              {
                icon: Smartphone, label: 'Phone Verification', value: profileData.phone || 'No phone added',
                verified: securitySettings.phoneVerified, action: 'Verify Phone', disabled: !profileData.phone,
              },
              {
                icon: Key, label: 'Two-Factor Authentication',
                value: securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled',
                verified: securitySettings.twoFactorEnabled, action: securitySettings.twoFactorEnabled ? 'Manage' : 'Enable 2FA',
              },
              {
                icon: Lock, label: 'Password',
                value: securitySettings.lastPasswordChange
                  ? `Last changed ${new Date(securitySettings.lastPasswordChange).toLocaleDateString()}`
                  : 'Never changed',
                verified: false, action: 'Change Password', showRefresh: true,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  </div>
                </div>
                {item.verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Button variant="outline" size="sm" disabled={(item as any).disabled}>
                    {(item as any).showRefresh && <RefreshCw className="w-3 h-3 mr-1" />}
                    {item.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}