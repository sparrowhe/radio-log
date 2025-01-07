import { Button } from '@/components/ui/button';

interface LoTWSyncProps {
  isLoading: boolean;
}

export function LoTWSync({ isLoading }: LoTWSyncProps) {
  return (
    <div>
      <Button disabled={true}>
        {isLoading ? 'Syncing with LoTW...' : 'Synced with LoTW'}
      </Button>
    </div>
  );
}

