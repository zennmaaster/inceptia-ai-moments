import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Sparkles, Coins, UserPlus, UserCheck, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    content: string;
    prompt?: string;
    media_url?: string;
    media_type?: string;
    token_cost: number;
    is_ai_generated: boolean;
    like_count: number;
    comment_count: number;
    created_at: string;
    profiles: {
      display_name: string;
      avatar_url?: string;
    };
  };
  onUpdate?: () => void;
}

const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  // Check if current user has liked this post
  const { data: userLike, refetch: refetchLike } = useQuery({
    queryKey: ['like', post.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Check if current user is following the post author
  const { data: followData, refetch: refetchFollow } = useQuery({
    queryKey: ['follow', post.user_id, user?.id],
    queryFn: async () => {
      if (!user || user.id === post.user_id) return null;
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', post.user_id)
        .single();
      return data;
    },
    enabled: !!user && user.id !== post.user_id,
  });

  const isLiked = !!userLike;
  const isFollowingUser = !!followData;

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    setIsLiking(true);

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id);

      if (error) {
        toast.error("Failed to unlike post");
      }
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: user.id });

      if (error) {
        toast.error("Failed to like post");
      }
    }

    setIsLiking(false);
    refetchLike();
    onUpdate?.();
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }

    if (user.id === post.user_id) return;

    setIsFollowing(true);

    if (isFollowingUser) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', post.user_id);

      if (error) {
        toast.error("Failed to unfollow");
      } else {
        toast.success("Unfollowed successfully");
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: post.user_id });

      if (error) {
        toast.error("Failed to follow");
      } else {
        toast.success("Following!");
      }
    }

    setIsFollowing(false);
    refetchFollow();
    onUpdate?.();
  };

  const handleSimilarClick = () => {
    if (post.prompt) {
      navigate(`/search?q=${encodeURIComponent(post.prompt)}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.profiles.display_name}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReply = () => {
    if (!user) {
      toast.error("Please sign in to reply");
      navigate("/auth");
      return;
    }
    toast.info("Reply feature coming soon!");
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold cursor-pointer"
            onClick={() => navigate(`/profile/${post.user_id}`)}
          >
            {post.profiles.display_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-foreground">{post.profiles.display_name || 'Anonymous'}</div>
            <div className="text-sm text-muted-foreground">{timeAgo(post.created_at)}</div>
          </div>
          
          {user && user.id !== post.user_id && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFollow}
              disabled={isFollowing}
              className={isFollowingUser ? "border-primary text-primary" : ""}
            >
              {isFollowingUser ? (
                <>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>

        {post.is_ai_generated && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">AI</span>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-foreground leading-relaxed">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.media_url && (
        <div className="relative cursor-pointer" onClick={() => setIsImageEnlarged(true)}>
          <img
            src={post.media_url}
            alt="Post content"
            className="w-full aspect-video object-cover hover:opacity-90 transition-opacity"
          />
          {post.is_ai_generated && post.token_cost > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-primary/30">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">{post.token_cost}</span>
            </div>
          )}
        </div>
      )}

      {/* AI Prompt - only show if there's actual user content/caption */}
      {post.prompt && post.content && !post.content.startsWith('Generated with AI:') && (
        <div className="px-4 py-3 bg-muted/30 border-t border-border">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic">"{post.prompt}"</p>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`gap-2 ${isLiked ? 'text-accent' : 'text-muted-foreground'} hover:text-accent transition-colors`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-accent' : ''}`} />
            <span className="font-semibold">{post.like_count}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-primary"
            onClick={handleReply}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{post.comment_count}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {post.prompt && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary hover:text-primary/80"
              onClick={handleSimilarClick}
            >
              Similars
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Image Enlarge Dialog */}
      <Dialog open={isImageEnlarged} onOpenChange={setIsImageEnlarged}>
        <DialogContent className="max-w-7xl w-full p-0 bg-transparent border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background"
              onClick={() => setIsImageEnlarged(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            {post.media_url && (
              <img
                src={post.media_url}
                alt="Post content enlarged"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostCard;
