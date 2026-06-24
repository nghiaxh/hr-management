import { PageHeader } from '../components/shared/page-header';
import { EmptyState } from '../components/shared/empty-state';
import { useTranslation } from '../context/language-context';
import { Briefcase } from 'lucide-react';

export default function RecruitmentPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('recruitment.job_postings')}
        description="Quản lý tin tuyển dụng và ứng viên"
      />
      <EmptyState
        icon={Briefcase}
        title={t('recruitment.no_jobs')}
        description="Tính năng tuyển dụng đang được phát triển. Sẽ sớm ra mắt!"
      />
    </div>
  );
}
