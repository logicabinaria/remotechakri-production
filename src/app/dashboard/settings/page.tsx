"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Upload, Loader2, KeyRound, AlertCircle } from "lucide-react";
import { uploadToCloudinary, CloudinaryUploadOptions } from "@/lib/cloudinary";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  phone_number: string | null;
  is_whatsapp_verified: boolean;
  whatsapp_verified_at: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const userId = session.user.id;
      const userEmail = session.user.email;
      
      // Fetch user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      // If profile doesn't exist, create default profile object
      const userProfile = data || {
        user_id: userId,
        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
        avatar_url: session.user.user_metadata?.avatar_url || null,
        bio: null,
        location: null,
        website: null,
        phone_number: null,
        is_whatsapp_verified: false,
        whatsapp_verified_at: null
      };
      
      // Store user email separately for password change functionality
      setUserEmail(userEmail || '');
      setProfile(userProfile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);
  
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      setSaving(true);
      
      // Update user profile in database - only include fields that exist in the schema
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: profile.user_id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          phone_number: profile.phone_number,
          is_whatsapp_verified: profile.is_whatsapp_verified,
          whatsapp_verified_at: profile.whatsapp_verified_at
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return;
      }
      
      // Update user metadata in auth - only include fields that should be in auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        }
      });
      
      if (authError) {
        console.error('Error updating auth metadata:', authError);
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      // Refresh the page to show updated information across the dashboard
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploading(true);
      
      // Create a canvas element to resize the image to 400x400 pixels
      const img = new window.Image() as HTMLImageElement;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create a promise to handle the image loading and processing
      const processedFile = await new Promise<File>((resolve, reject) => {
        img.onload = () => {
          // Set canvas dimensions to 400x400 for profile photo
          const targetSize = 400;
          canvas.width = targetSize;
          canvas.height = targetSize;
          
          if (ctx) {
            // Calculate dimensions for center crop (to maintain aspect ratio while filling the square)
            const size = Math.min(img.width, img.height);
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;
            
            // Draw image on canvas with cropping to make it square
            ctx.drawImage(
              img,
              offsetX, offsetY, size, size, // Source rectangle (crop)
              0, 0, targetSize, targetSize  // Destination rectangle (resize)
            );
            
            // Convert to WebP with good quality
            canvas.toBlob((blob) => {
              if (blob) {
                // Create a new file with WebP type
                const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
                  type: 'image/webp',
                });
                resolve(webpFile);
              } else {
                reject(new Error('Failed to convert image to WebP'));
              }
            }, 'image/webp', 0.85); // 85% quality for good balance
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Load the image from file
        img.src = URL.createObjectURL(file);
      }).catch(error => {
        console.error('Error processing image:', error);
        // If processing fails, use original file
        return file;
      });
      
      // Configure upload options for Cloudinary
      const options: CloudinaryUploadOptions = {
        folder: process.env.NEXT_PUBLIC_CLOUDINARY_PROFILE_PHOTOS_FOLDER || 'profile_photos',
        maxWidth: 400,
        maxHeight: 400,
        format: 'webp'
      };
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(processedFile, options);
      
      // Update profile state with the secure URL from Cloudinary
      setProfile(prev => prev ? { ...prev, avatar_url: result.secure_url } : null);
      
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });
    } catch (error) {
      console.error('Error in handleFileChange:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    // Validate passwords
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    try {
      setChangingPassword(true);
      
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword
      });
      
      if (signInError) {
        setPasswordError("Current password is incorrect");
        return;
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        setPasswordError(updateError.message);
        return;
      }
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError("An unexpected error occurred");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <Settings className="h-6 w-6 text-primary" />
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div 
                className="relative cursor-pointer group"
                onClick={handleAvatarClick}
              >
                <Avatar className="h-24 w-24 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Click to upload a new profile photo (will be resized to 400x400)
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={profile?.full_name || ''}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile?.bio || ''}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={profile?.location || ''}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={profile?.website || ''}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number (WhatsApp)</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={profile?.phone_number || ''}
                onChange={handleChange}
                placeholder="+1234567890"
                type="tel"
              />
              {profile?.is_whatsapp_verified && (
                <p className="text-sm text-green-500 mt-1">✓ WhatsApp verified</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
      
      {/* Password Change Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <KeyRound className="h-5 w-5 mr-2" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={changingPassword}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changingPassword}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changingPassword}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
