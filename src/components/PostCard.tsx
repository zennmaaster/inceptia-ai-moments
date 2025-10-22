import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Sparkles, Coins } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

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
  const [isLiking, setIsLiking] = useState(false);

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

  const isLiked = !!userLike;

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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
            {post.profiles.display_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-semibold text-foreground">{post.profiles.display_name || 'Anonymous'}</div>
            <div className="text-sm text-muted-foreground">{timeAgo(post.created_at)}</div>
          </div>
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
        <div className="relative">
          <img
            src={post.media_url}
            alt="Post content"
            className="w-full aspect-video object-cover"
          />
          {post.is_ai_generated && post.token_cost > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-primary/30">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">{post.token_cost}</span>
            </div>
          )}
        </div>
      )}

      {/* AI Prompt */}
      {post.prompt && (
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

          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{post.comment_count}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
            Similars
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
