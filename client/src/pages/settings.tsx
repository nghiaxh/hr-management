import { useTranslation } from '../context/language-context';
import { useTheme } from '../hooks/use-theme';
import { PageHeader } from '../components/shared/page-header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { isDark, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings')} />

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-medium">{t('settings.theme')}</h3>
          <div className="flex gap-3">
            <Button
              variant={!isDark ? 'primary' : 'outline'}
              onPress={() => setTheme('light')}
              aria-pressed={!isDark}
            >
              <Sun className="h-4 w-4 mr-2" />
              {t('settings.light')}
            </Button>
            <Button
              variant={isDark ? 'primary' : 'outline'}
              onPress={() => setTheme('dark')}
              aria-pressed={isDark}
            >
              <Moon className="h-4 w-4 mr-2" />
              {t('settings.dark')}
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
