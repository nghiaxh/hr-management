import { Badge } from '../ui/badge';

const statusMap: Record<string, 'warning' | 'success' | 'destructive' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  present: 'success',
  late: 'warning',
  absent: 'destructive',
  'half-day': 'info',
  draft: 'warning',
  paid: 'success',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
}
