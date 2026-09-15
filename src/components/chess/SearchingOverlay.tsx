import React from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchingOverlayProps {
  queuePosition: number;
  onCancel: () => void;
}

export const SearchingOverlay: React.FC<SearchingOverlayProps> = ({ queuePosition, onCancel }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-6 bg-card/60 backdrop-blur-sm border rounded-3xl shadow-lg">
      <div className="relative">
        <div className="text-7xl animate-bounce">♞</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-primary/20 rounded-full animate-pulse" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Finding Opponent...</h2>
        {queuePosition > 0 && (
          <p className="text-xs text-muted-foreground">
            Queue position: <span className="font-mono font-bold text-foreground">{queuePosition}</span>
          </p>
        )}
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Searching for players with matching clock...</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onCancel}
        className="gap-2 rounded-xl text-xs font-semibold px-6"
      >
        <X className="h-4 w-4" />
        Cancel Search
      </Button>
    </div>
  );
};

export default SearchingOverlay;