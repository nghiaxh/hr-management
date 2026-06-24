import { PageHeader } from '../components/shared/page-header';
import { EmptyState } from '../components/shared/empty-state';
import { useTranslation } from '../context/language-context';
import { Star } from 'lucide-react';

export default function PerformanceReviewsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('performance_reviews.title')}
        description={t('performance_reviews.description')}
      />
      <EmptyState
        icon={Star}
        title={t('performance_reviews.no_reviews')}
        description="Tính năng đánh giá hiệu suất đang được phát triển. Sẽ sớm ra mắt!"
      />
    </div>
  );
}
