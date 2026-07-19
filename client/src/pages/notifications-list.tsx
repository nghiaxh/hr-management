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
    return <div className="flex flex-col items-center justify-center min-h-64 gap-2 text-center p-8"><p className="text-sm text-error">{(queryError as any)?.response?.data?.message || t('notifications.load_failed')}</p></div>;
  }

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
        <div className="flex flex-col items-center py-16 text-base-content/60">
          <div className="h-12 w-12 rounded-full bg-base-300 flex items-center justify-center mb-3">
            <Bell className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">{t('notifications.no_notifications')}</p>
          <p className="text-xs text-base-content/60 mt-1">{t('notifications.up_to_date')}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
              className={cn(
                'group flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer',
                n.isRead
                  ? 'bg-base-200/50 border-transparent hover:bg-base-300/30'
                  : 'bg-base-300/50 border-base-300/80 hover:bg-base-300'
              )}
            >
              <div className={cn(
                'mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                n.isRead ? 'bg-base-300 text-base-content/60' : 'bg-base-content/15 text-base-content'
              )}>
                {n.isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-sm', n.isRead ? 'text-base-content/70' : 'text-base-content font-medium')}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-base-content/50" />}
                    <span className="text-[11px] text-base-content/60 whitespace-nowrap">{formatDate(n.createdAt)}</span>
                  </div>
                </div>
                {n.message && (
                  <p className={cn('text-xs mt-0.5', n.isRead ? 'text-base-content/60' : 'text-base-content/60')}>
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
