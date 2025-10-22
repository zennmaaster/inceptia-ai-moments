import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Coins, Image, Video } from "lucide-react";
import { useState } from "react";

const CreatePostModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [postType, setPostType] = useState<"text" | "ai">("text");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const tokenCost = mediaType === "image" ? 100 : 500;

  const handleCreate = () => {
    // TODO: Implement post creation logic
    console.log({ postType, content, prompt, mediaType });
    onClose();
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
              <Label htmlFor="content">What's on your mind?</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 mt-2 bg-background"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Free to post</p>
              <Button onClick={handleCreate} className="gradient-primary text-primary-foreground">
                Post
              </Button>
            </div>
          </TabsContent>

          {/* AI-Enhanced Post */}
          <TabsContent value="ai" className="space-y-4">
            <div>
              <Label htmlFor="ai-content">Caption (optional)</Label>
              <Textarea
                id="ai-content"
                placeholder="Add a caption for your AI creation..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-24 mt-2 bg-background"
              />
            </div>

            <div>
              <Label htmlFor="prompt">AI Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to create... (e.g., 'A magical forest with glowing mushrooms at sunset')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-24 mt-2 bg-background"
              />
            </div>

            <div>
              <Label>Media Type</Label>
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
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
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
                disabled={!prompt}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate & Post
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
