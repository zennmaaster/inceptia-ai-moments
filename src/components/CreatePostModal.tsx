import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Coins, Image, Video, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [postType, setPostType] = useState<"text" | "ai">("text");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isCreating, setIsCreating] = useState(false);

  const tokenCost = mediaType === "image" ? 100 : 500;

  const handleCreate = async () => {
    if (!user) {
      toast.error("Please sign in to create posts");
      return;
    }

    if (postType === "ai" && !prompt.trim()) {
      toast.error("Please enter a prompt for AI generation");
      return;
    }

    if (postType === "text" && !content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setIsCreating(true);

    try {
      if (postType === "text") {
        // Create text post directly
        const { error } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            content: content,
            is_ai_generated: false,
            token_cost: 0,
          });

        if (error) throw error;
        
        toast.success("Post created successfully!");
        setContent("");
        onPostCreated?.();
      } else {
        // Call edge function for AI generation
        const { data, error } = await supabase.functions.invoke('generate-ai-content', {
          body: {
            prompt: prompt,
            mediaType: mediaType,
            content: content || `Generated with AI: "${prompt}"`
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          if (error.message.includes('402')) {
            toast.error("Insufficient tokens. Please purchase more tokens.");
          } else {
            throw error;
          }
          return;
        }

        if (data.error) {
          if (data.error.includes('Insufficient tokens')) {
            toast.error(`Insufficient tokens. You need ${data.required} tokens but only have ${data.balance}.`);
          } else {
            toast.error(data.error);
          }
          return;
        }

        toast.success(`🎉 AI content generated! ${data.tokensSpent} tokens spent. ${data.remainingTokens} remaining.`);
        setContent("");
        setPrompt("");
        onPostCreated?.();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Post</DialogTitle>
        </DialogHeader>

        <Tabs value={postType} onValueChange={(v) => setPostType(v as "text" | "ai")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Text Post
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Enhanced
            </TabsTrigger>
          </TabsList>

          {/* Text Post */}
          <TabsContent value="text" className="space-y-4">
            <div>
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 mt-2 bg-background"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Free to post</p>
              <Button 
                onClick={handleCreate} 
                disabled={isCreating || !content.trim()}
                className="gradient-primary text-primary-foreground"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </TabsContent>

          {/* AI-Enhanced Post */}
          <TabsContent value="ai" className="space-y-4">
            <div>
              <Textarea
                placeholder="Add a caption for your AI creation... (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-24 mt-2 bg-background"
              />
            </div>

            <div>
              <Textarea
                placeholder="Describe what you want to create... (e.g., 'A magical forest with glowing mushrooms at sunset')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-24 mt-2 bg-background"
              />
            </div>

            <div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Button
                  variant={mediaType === "image" ? "default" : "outline"}
                  onClick={() => setMediaType("image")}
                  className={mediaType === "image" ? "gradient-primary text-primary-foreground" : ""}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button
                  variant={mediaType === "video" ? "default" : "outline"}
                  onClick={() => setMediaType("video")}
                  className={mediaType === "video" ? "gradient-primary text-primary-foreground" : ""}
                  disabled
                  title="Video generation coming soon"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video (Soon)
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">{tokenCost} tokens</span>
              </div>
              <Button 
                onClick={handleCreate} 
                className="gradient-primary text-primary-foreground"
                disabled={!prompt.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate & Post
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
