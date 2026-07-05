import { useTranslation } from '../context/language-context';
import { useTheme } from '../hooks/use-theme';
import { PageHeader } from '../components/shared/page-header';
import { Card, CardContent } from '../components/ui/card';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings')} />

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-medium">{t('settings.theme')}</h3>
          <div className="flex gap-3">
            <button
              onClick={() => { if (theme !== 'light') toggleTheme(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={theme === 'light'}
            >
              <Sun className="h-4 w-4" />
              {t('settings.light')}
            </button>
            <button
              onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={theme === 'dark'}
            >
              <Moon className="h-4 w-4" />
              {t('settings.dark')}
            </button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
