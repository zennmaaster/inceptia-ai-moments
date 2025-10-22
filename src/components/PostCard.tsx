import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Sparkles, Coins } from "lucide-react";
import { useState } from "react";

interface Post {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  prompt?: string;
  timestamp: string;
  likes: number;
  comments: number;
  tokenCost: number;
  isAiGenerated: boolean;
}

const PostCard = ({ post }: { post: Post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.user.avatar}
            alt={post.user.name}
            className="w-12 h-12 rounded-full border-2 border-primary/30"
          />
          <div>
            <div className="font-semibold text-foreground">{post.user.name}</div>
            <div className="text-sm text-muted-foreground">{post.user.username} · {post.timestamp}</div>
          </div>
        </div>

        {post.isAiGenerated && (
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
      {post.image && (
        <div className="relative">
          <img
            src={post.image}
            alt="Post content"
            className="w-full aspect-video object-cover"
          />
          {post.isAiGenerated && post.tokenCost > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-primary/30">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">{post.tokenCost}</span>
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
            className={`gap-2 ${isLiked ? 'text-accent' : 'text-muted-foreground'} hover:text-accent transition-colors`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-accent' : ''}`} />
            <span className="font-semibold">{likeCount}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{post.comments}</span>
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
