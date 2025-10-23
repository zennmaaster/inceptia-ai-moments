import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import CreatePostButton from "@/components/CreatePostButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Feed = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("for-you");

  // Remove auth guard - users can view feed without login

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', activeTab, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `);

      // Apply filters based on active tab
      if (activeTab === "trending") {
        query = query.order('like_count', { ascending: false });
      } else if (activeTab === "following" && user) {
        // Get posts from users that the current user follows
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        if (follows && follows.length > 0) {
          const followingIds = follows.map(f => f.following_id);
          query = query.in('user_id', followingIds);
        } else {
          // Return empty array if not following anyone
          return [];
        }
        query = query.order('created_at', { ascending: false });
      } else if (activeTab === "recent") {
        query = query.order('created_at', { ascending: false });
      } else {
        // "for-you" - mix of trending and recent
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: true, // Allow fetching posts without authentication
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Feed Tabs */}
        <div className="mb-6 animate-fade-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-card border border-border">
              <TabsTrigger value="for-you" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                For You
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Trending
              </TabsTrigger>
              <TabsTrigger value="following" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Following
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Recent
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Posts Feed */}
        {isLoading ? (
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
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No posts yet. Be the first to create!</p>
          </div>
        )}

        {/* Load More */}
        {posts && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Scroll for more amazing creations...</p>
          </div>
        )}
      </div>

      {/* Floating Create Button - only show if logged in */}
      {user && <CreatePostButton onPostCreated={refetch} />}
    </div>
  );
};

export default Feed;
