'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Camera, Edit, Save, X, MapPin, Briefcase, Heart, 
  Church, BookOpen, Award, Shield, Loader2, Upload,
  CheckCircle, XCircle, Clock, AlertCircle, Key, Lock,
  Smartphone, Mail, RefreshCw
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
  const { isAuthenticated, currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Profile data state
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
    interests: [] as string[],
    values: [] as string[],
    faithJourney: '',
    churchName: '',
    churchBranch: '',
  });

  // Photo upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // ID Verification state
  const [idVerification, setIdVerification] = useState({
    status: 'pending' as 'pending' | 'submitted' | 'verified' | 'rejected',
    documentType: '',
    submittedAt: null as Date | null,
    verifiedAt: null as Date | null,
    rejectionReason: '',
  });
  const [idDocument, setIdDocument] = useState<File | null>(null);

  // Security state
  const [securitySettings, setSecuritySettings] = useState({
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    lastPasswordChange: null as Date | null,
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadProfileData();
  }, [isAuthenticated, router]);

  const loadProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      
      // Try to fetch full profile from backend
      const userProfile = await usersService.getCurrentUser();
      
      // Update profile data with backend data
      setProfileData({
        first_name: userProfile.first_name || currentUser?.first_name || '',
        last_name: userProfile.last_name || currentUser?.last_name || '',
        username: userProfile.name || currentUser?.name || '',
        email: userProfile.email || currentUser?.email || '',
        age: userProfile.age || currentUser?.age || 25,
        gender: (userProfile.gender || currentUser?.gender || 'male') as 'male' | 'female',
        phone: userProfile.phone || currentUser?.phone || '',
        bio: userProfile.bio || currentUser?.bio || '',
        career: userProfile.career || currentUser?.career || '',
        denomination: userProfile.denomination || currentUser?.denomination || '',
        country: userProfile.location?.country || currentUser?.location?.country || '',
        interests: userProfile.interests || currentUser?.interests || [],
        values: userProfile.values || currentUser?.values || [],
        faithJourney: userProfile.faithJourney || currentUser?.faithJourney || '',
        churchName: userProfile.church?.name || '',
        churchBranch: userProfile.church?.branch || '',
      });

      // Load ID verification status
      if (userProfile.idVerification) {
        setIdVerification({
          status: userProfile.idVerification.status || 'pending',
          documentType: userProfile.idVerification.documentType || '',
          submittedAt: userProfile.idVerification.submittedAt || null,
          verifiedAt: userProfile.idVerification.verifiedAt || null,
          rejectionReason: userProfile.idVerification.rejectionReason || '',
        });
      }

      // Load security verification
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
      toast.error('Using cached profile data. Some features may not work until backend CORS is fixed.');
      
      // Fallback to current user data
      if (currentUser) {
        setProfileData({
          first_name: currentUser.first_name || '',
          last_name: currentUser.last_name || '',
          username: currentUser.name || '',
          email: currentUser.email || '',
          age: currentUser.age || 25,
          gender: currentUser.gender || 'male',
          phone: currentUser.phone || '',
          bio: currentUser.bio || '',
          career: currentUser.career || '',
          denomination: currentUser.denomination || '',
          country: currentUser.location?.country || '',
          interests: currentUser.interests || [],
          values: currentUser.values || [],
          faithJourney: currentUser.faithJourney || '',
          churchName: currentUser.church?.name || '',
          churchBranch: currentUser.church?.branch || '',
        });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocument(file);
      toast.success('Document selected. Click "Submit for Verification" to upload.');
    }
  };

  const handleSubmitIdVerification = async () => {
    if (!idDocument) {
      toast.error('Please select a document first');
      return;
    }

    try {
      toast.info('ID verification feature will be available once backend CORS is fixed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit document');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      console.log('💾 Attempting to save profile...');
      console.log('Data to save:', profileData);

      // Show CORS warning
      toast.info('Note: Backend CORS needs to be configured to allow requests from localhost:3000');

      // Prepare update data - match exact backend format
  const updateData = {
      age: profileData.age || 25,
      bio: profileData.bio || "",
      career: profileData.career || "",
      church_branch: profileData.churchBranch || "",
      church_name: profileData.churchName || "",
      denomination: profileData.denomination || "",
      gender: profileData.gender || "male",
      interests: profileData.interests || [],
      key: "",
      looking_for: "",
      profile_image: ""
    };

      console.log('Sending update:', updateData);

      // Try to update profile
      await usersService.updateProfile(updateData);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Reload profile data
      await loadProfileData();
      
    } catch (error: any) {
      console.error('❌ Save error:', error);
      
      if (error.message?.includes('CORS') || error.message?.includes('Network Error')) {
        toast.error('CORS Error: Ask your backend developer to add "http://localhost:3000" to allowed origins');
      } else {
        toast.error(error.message || 'Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (!isAuthenticated || !currentUser) {
    return null;
  }

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
            <h1 className="text-3xl font-bold text-muted-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                loadProfileData();
              }}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-muted-foreground mb-4">Profile Picture</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover" />
                ) : (
                  currentUser.avatar || '👤'
                )}
              </div>
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-5 h-5 text-primary-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-muted-foreground">
                {profileData.first_name} {profileData.last_name}
              </h3>
              <p className="text-muted-foreground">@{profileData.username}</p>
              {(profileData.country || currentUser?.location?.country) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {profileData.country || currentUser?.location?.country}
                </p>
              )}
              <div className="mt-2">
                <TierBadge tier={currentUser.tier} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={profileData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                value={profileData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Username</Label>
              <Input
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={profileData.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={profileData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Gender</Label>
              <select
                value={profileData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                disabled={!isEditing}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Career</Label>
              <Input
                value={profileData.career}
                onChange={(e) => handleInputChange('career', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Software Engineer"
              />
            </div>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Country</Label>
              <Input
                value={profileData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., USA"
              />
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            About Me
          </h2>

          <div>
            <Label>Bio</Label>
            <Textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </motion.div>

        {/* Faith Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <Church className="w-5 h-5" />
            Faith & Church
          </h2>

          <div className="space-y-4">
            <div>
              <Label>Denomination</Label>
              <Input
                value={profileData.denomination}
                onChange={(e) => handleInputChange('denomination', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Baptist, Catholic, Non-denominational"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Church Name</Label>
                <Input
                  value={profileData.churchName}
                  onChange={(e) => handleInputChange('churchName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., Hillsong Church"
                />
              </div>

              <div>
                <Label>Church Branch</Label>
                <Input
                  value={profileData.churchBranch}
                  onChange={(e) => handleInputChange('churchBranch', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., NYC Campus"
                />
              </div>
            </div>

            <div>
              <Label>Faith Journey</Label>
              <Textarea
                value={profileData.faithJourney}
                onChange={(e) => handleInputChange('faithJourney', e.target.value)}
                disabled={!isEditing}
                placeholder="Share your faith journey..."
                rows={4}
              />
            </div>
          </div>
        </motion.div>

        {/* ID Verification Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-muted-foreground flex items-center gap-2">
              <Award className="w-5 h-5" />
              ID Verification
            </h2>
            {getVerificationStatusBadge(idVerification.status)}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verify your identity to increase trust and unlock premium features
            </p>

            {idVerification.status === 'rejected' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
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
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select document type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID Card</option>
                  </select>
                </div>

                <div>
                  <Label>Upload Document</Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {idDocument ? idDocument.name : 'Click to upload ID document'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG or PDF (max 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleIdDocumentSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmitIdVerification}
                  disabled={!idDocument || !idVerification.documentType}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit for Verification
                </Button>
              </>
            )}

            {idVerification.status === 'verified' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Identity Verified</p>
                    <p className="text-sm text-green-700">
                      Verified on {idVerification.verifiedAt ? new Date(idVerification.verifiedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Security Verification Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-xl font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Verification
          </h2>

          <div className="space-y-3">
            {/* Email Verification */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
              </div>
              {securitySettings.emailVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Button variant="outline" size="sm">Verify Email</Button>
              )}
            </div>

            {/* Phone Verification */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Verification</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData.phone || 'No phone number added'}
                  </p>
                </div>
              </div>
              {securitySettings.phoneVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Button variant="outline" size="sm" disabled={!profileData.phone}>
                  Verify Phone
                </Button>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {securitySettings.twoFactorEnabled ? 'Manage' : 'Enable 2FA'}
              </Button>
            </div>

            {/* Password Change */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    {securitySettings.lastPasswordChange 
                      ? `Last changed ${new Date(securitySettings.lastPasswordChange).toLocaleDateString()}`
                      : 'Never changed'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}