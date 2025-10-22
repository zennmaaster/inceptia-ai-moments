import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreatePostModal from "./CreatePostModal";

const CreatePostButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full gradient-primary text-primary-foreground shadow-elevated glow-primary hover:scale-110 transition-all duration-300 z-50"
      >
        <Plus className="w-8 h-8" />
      </Button>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default CreatePostButton;
