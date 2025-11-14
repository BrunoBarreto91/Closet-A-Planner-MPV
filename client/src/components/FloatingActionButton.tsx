import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
      onClick={onClick}
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}
