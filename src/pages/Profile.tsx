import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, UserPlus, UserCheck, Settings } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const profileUserId = userId || user?.id;
  const isOwnProfile = user?.id === profileUserId;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', profileUserId],
    queryFn: async () => {
      if (!profileUserId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileUserId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileUserId,
  });

  // Fetch user's posts
  const { data: posts, isLoading: postsLoading, refetch } = useQuery({
    queryKey: ['user-posts', profileUserId],
    queryFn: async () => {
      if (!profileUserId) return [];
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', profileUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileUserId,
  });

  // Check if current user follows this profile
  const { data: followData, refetch: refetchFollow } = useQuery({
    queryKey: ['follow-status', profileUserId, user?.id],
    queryFn: async () => {
      if (!user || !profileUserId || user.id === profileUserId) return null;
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', profileUserId)
        .single();
      return data;
    },
    enabled: !!user && !!profileUserId && user.id !== profileUserId,
  });

  const isFollowingUser = !!followData;

  const handleFollow = async () => {
    if (!user || !profileUserId) return;

    setIsFollowing(true);

    if (isFollowingUser) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileUserId);

      if (error) {
        toast.error("Failed to unfollow");
      } else {
        toast.success("Unfollowed successfully");
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: profileUserId });

      if (error) {
        toast.error("Failed to follow");
      } else {
        toast.success("Following!");
      }
    }

    setIsFollowing(false);
    refetchFollow();
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-4xl">
              {profile.display_name?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{profile.display_name || 'Anonymous'}</h1>
              {profile.username && (
                <p className="text-muted-foreground mb-2">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-foreground mb-4">{profile.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex gap-6 justify-center md:justify-start">
                <div>
                  <span className="font-bold text-xl">{posts?.length || 0}</span>
                  <span className="text-muted-foreground ml-2">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-xl">{profile.follower_count || 0}</span>
                  <span className="text-muted-foreground ml-2">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-xl">{profile.following_count || 0}</span>
                  <span className="text-muted-foreground ml-2">Following</span>
                </div>
                {isOwnProfile && (
                  <div>
                    <span className="font-bold text-xl text-primary">{profile.token_balance || 0}</span>
                    <span className="text-muted-foreground ml-2">Tokens</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  disabled={isFollowing}
                  className={isFollowingUser ? "gradient-primary text-primary-foreground" : ""}
                >
                  {isFollowingUser ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Posts</h2>
          {postsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PostCard post={post} onUpdate={refetch} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground text-lg">No posts yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {profile && (
        <EditProfileDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          profile={profile}
          onUpdate={refetchProfile}
        />
      )}
    </div>
  );
};

export default Profile;
