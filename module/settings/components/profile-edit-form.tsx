'use client';

import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { updateUserProfile } from '../actions';
import { useUnsavedChanges } from '@/hooks/unsaved-changes/use-spa-interceptor';

interface ProfileEditFormProps {
  profile: {
    name: string;
    email: string;
  };
  onCancel: () => void;
}

function validateEmail(email: string): string | null {
  if (!email) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
}

export function ProfileEditForm({ profile, onCancel }: ProfileEditFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const initialRef = useRef({ name: profile.name, email: profile.email });

  const hasUnsavedChanges = name !== initialRef.current.name || email !== initialRef.current.email;
  useUnsavedChanges(hasUnsavedChanges);

  const emailError = email ? validateEmail(email) : null;

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      return await updateUserProfile(data);
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        initialRef.current = { name, email };
        toast.success('Profile updated successfully');
        onCancel();
      } else {
        toast.error('Failed to update profile', {
          description: result?.error || 'An unexpected error occurred.',
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to update profile', {
        description: error.message || 'An error occurred while updating your profile.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      toast.error('Please fix the validation errors before saving');
      return;
    }
    updateMutation.mutate({ name, email });
  };

  const handleReset = () => {
    setName(initialRef.current.name);
    setEmail(initialRef.current.email);
  };

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>Edit Profile Settings</CardTitle>
        <CardDescription>Update your account details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={updateMutation.isPending}
              aria-invalid={!!emailError}
            />
            {emailError && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1" role="alert">
                <AlertTriangle className="h-3 w-3" />
                {emailError}
              </p>
            )}
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>You have unsaved changes</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={updateMutation.isPending}
              >
                Reset
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending || !hasUnsavedChanges || !!emailError}
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
