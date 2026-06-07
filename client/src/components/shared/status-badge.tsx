import { useTranslation } from '../../context/language-context';
import { Badge } from '../ui/badge';

const variantMap: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'info' | 'default' | 'outline'> = {
  approved: 'success',
  paid: 'success',
  present: 'success',
  active: 'success',
  pending: 'warning',
  late: 'warning',
  draft: 'secondary',
  rejected: 'destructive',
  absent: 'destructive',
  'half-day': 'info',
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const variant = variantMap[status] || 'secondary';
  const key = `status.${status.replace('-', '_')}`;
  return <Badge variant={variant}>{t(key)}</Badge>;
}
