import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';
import { PageHeader } from '../components/shared/page-header';
import { Button } from '../components/ui/button';
import { useTranslation } from '../context/language-context';
import { formatDate } from '../lib/utils';
import { toast } from '../hooks/use-toast';
import { Bell, CheckCheck, Mail, MailOpen } from 'lucide-react';
import { cn } from '../lib/utils';

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
    onError: () => toast({ title: t('notifications.failed_mark_read'), variant: 'destructive' }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={t('nav.notifications')}
        description={unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('notifications.all_caught_up')}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
              <CheckCheck className="h-4 w-4 mr-1.5" />{t('notifications.mark_all_read')}
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Bell className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">{t('notifications.no_notifications')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('notifications.up_to_date')}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n: any) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
              className={cn(
                'group flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer',
                n.isRead
                  ? 'bg-card/50 border-transparent hover:bg-accent/30'
                  : 'bg-accent/50 border-border/80 hover:bg-accent'
              )}
            >
              <div className={cn(
                'mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                n.isRead ? 'bg-muted text-muted-foreground' : 'bg-muted-foreground/15 text-foreground'
              )}>
                {n.isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-sm', n.isRead ? 'text-foreground/70' : 'text-foreground font-medium')}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />}
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(n.createdAt)}</span>
                  </div>
                </div>
                {n.message && (
                  <p className={cn('text-xs mt-0.5', n.isRead ? 'text-muted-foreground/60' : 'text-muted-foreground')}>
                    {n.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
