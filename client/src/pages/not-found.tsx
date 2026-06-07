import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTranslation } from '../context/language-context';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">{t('not_found.title')}</p>
      <Link to="/dashboard"><Button>{t('not_found.go_dashboard')}</Button></Link>
    </div>
  );
}
