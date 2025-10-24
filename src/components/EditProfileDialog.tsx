import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    display_name?: string;
    username?: string;
    bio?: string;
  };
  onUpdate: () => void;
}

const EditProfileDialog = ({ isOpen, onClose, profile, onUpdate }: EditProfileDialogProps) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [username, setUsername] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    // Validate inputs
    try {
      const profileSchema = z.object({
        display_name: z.string().trim().min(1, "Display name cannot be empty").max(50, "Display name must be less than 50 characters"),
        username: z.string().trim().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        bio: z.string().trim().max(500, "Bio must be less than 500 characters").optional(),
      });
      
      profileSchema.parse({ 
        display_name: displayName, 
        username, 
        bio 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          username: username,
          bio: bio,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="mt-2 min-h-24"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              className="gradient-primary text-primary-foreground"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
