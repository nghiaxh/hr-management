import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';
import { PageHeader } from '../components/shared/page-header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useTranslation } from '../context/language-context';
import { formatDate } from '../lib/utils';
import { toast } from '../hooks/use-toast';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast({ title: 'Failed to mark as read', variant: 'destructive' }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Notifications"
        action={
          notifications.some((n: any) => !n.isRead) ? (
            <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
              <CheckCheck className="h-4 w-4 mr-1" />Mark all read
            </Button>
          ) : undefined
        }
      />
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n: any) => (
            <Card key={n._id} className={`cursor-pointer transition-colors ${!n.isRead ? 'border-primary/30 bg-primary/5' : ''}`} onClick={() => !n.isRead && markReadMutation.mutate(n._id)}>
              <CardContent className="flex items-start gap-3 py-3">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.isRead && <span className="text-[10px] text-primary font-medium">New</span>}
                  </div>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
