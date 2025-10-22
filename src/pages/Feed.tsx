import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import CreatePostButton from "@/components/CreatePostButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Feed = () => {
  // Example posts data
  const posts = [
    {
      id: "1",
      user: {
        name: "Alex Rivera",
        username: "@alexr",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      content: "Just generated this cyberpunk cityscape! 🌃✨",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
      prompt: "Neon-lit cyberpunk city at night, flying cars, holographic billboards",
      timestamp: "2h ago",
      likes: 234,
      comments: 45,
      tokenCost: 100,
      isAiGenerated: true,
    },
    {
      id: "2",
      user: {
        name: "Maya Chen",
        username: "@mayac",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
      },
      content: "Finally hit 5000 tokens! Time to create something epic 🚀",
      timestamp: "4h ago",
      likes: 89,
      comments: 12,
      tokenCost: 0,
      isAiGenerated: false,
    },
    {
      id: "3",
      user: {
        name: "Jordan Lee",
        username: "@jordanl",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
      },
      content: "My first Mythic tier video! Worth every token 💎",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
      prompt: "Majestic dragon flying over ancient mountains, cinematic style",
      timestamp: "6h ago",
      likes: 567,
      comments: 89,
      tokenCost: 500,
      isAiGenerated: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Feed Tabs */}
        <div className="mb-6 animate-fade-in">
          <Tabs defaultValue="for-you" className="w-full">
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
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">Scroll for more amazing creations...</p>
        </div>
      </div>

      {/* Floating Create Button */}
      <CreatePostButton />
    </div>
  );
};

export default Feed;
