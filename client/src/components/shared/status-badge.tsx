import { Badge } from '../ui/badge';

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="secondary" className="text-muted-foreground">{status}</Badge>;
}
