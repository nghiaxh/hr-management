import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';
import { PageHeader } from '../components/shared/page-header';
import { Button } from '../components/ui/button';
import { useTranslation } from '../context/language-context';
import { formatDate } from '../lib/utils';
import { toast } from '../hooks/use-toast';
import { Bell, Check, Envelope, EnvelopeOpen } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import type { Notification } from '../types';

export default function NotificationsListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, isError, error: queryError } = useQuery({
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); toast({ title: t('notifications.marked_all_read') }); },
    onError: () => toast({ title: t('notifications.failed_mark_all'), variant: 'destructive' }),
  });

  if (isError) {
    return <div className="flex flex-col items-center justify-center min-h-64 gap-2 text-center p-8"><p className="text-sm text-danger">{(queryError as { response?: { data?: { message?: string } } })?.response?.data?.message || t('notifications.load_failed')}</p></div>;
  }

  if (isLoading) return <div className="text-center py-8 text-muted">{t('common.loading')}</div>;

  const unreadCount = (notifications as Notification[]).filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
              <Check className="h-4 w-4 mr-1.5" />{t('notifications.mark_all_read')}
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted">
          <div className="h-12 w-12 rounded-full bg-surface-tertiary flex items-center justify-center mb-3">
            <Bell className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">{t('notifications.no_notifications')}</p>
          <p className="text-xs text-muted mt-1">{t('notifications.up_to_date')}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n: Notification) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
              className={cn(
                'group flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer',
                n.isRead
                  ? 'bg-surface-secondary/40 border-transparent hover:bg-surface-secondary'
                  : 'bg-surface border-border hover:bg-surface-secondary'
              )}
            >
              <div className={cn(
                'mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                n.isRead ? 'bg-surface-tertiary text-muted' : 'bg-foreground/10 text-foreground'
              )}>
                {n.isRead ? <EnvelopeOpen className="h-4 w-4" /> : <Envelope className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-sm', n.isRead ? 'text-muted' : 'text-foreground font-medium')}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-accent" />}
                    <span className="text-[11px] text-muted whitespace-nowrap">{formatDate(n.createdAt)}</span>
                  </div>
                </div>
                {n.message && (
                  <p className="text-xs mt-0.5 text-muted">
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
