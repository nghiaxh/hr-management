import { useQuery } from '@tanstack/react-query';
import { performanceReviewsApi } from '../../api/performance-reviews';
import { PageHeader } from '../../components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatusBadge } from '../../components/shared/status-badge';
import { Star, MessageSquare, Target } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useTranslation } from '../../context/language-context';

export default function MyReviewsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: () => performanceReviewsApi.getAll(),
  });

  if (isError) {
    return <div className="flex flex-col items-center justify-center min-h-64 gap-2 text-center p-8"><p className="text-sm text-destructive">{(queryError as any)?.response?.data?.message || t('performance_reviews.load_failed')}</p></div>;
  }

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">{t('performance_reviews.loading')}</div>;

  const reviews = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title={t('performance_reviews.my_title')} description={t('performance_reviews.description')} />

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t('performance_reviews.no_reviews')}</div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review: any) => (
            <Card key={review._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{review.period}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('performance_reviews.reviewed_by')} {review.reviewerId?.name || review.reviewerId?.email || t('performance_reviews.na')} &middot; {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={review.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{review.rating}/5</span>
                  </div>
                )}
                {review.comments && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <MessageSquare className="h-4 w-4" /> {t('performance_reviews.comments')}
                    </div>
                    <p className="text-sm">{review.comments}</p>
                  </div>
                )}
                {review.goals && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Target className="h-4 w-4" /> {t('performance_reviews.goals')}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{review.goals}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
