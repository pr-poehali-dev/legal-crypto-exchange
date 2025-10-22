import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface TelegramSettingsProps {
  userId: number;
  currentTelegramId: string | null;
  onUpdate: () => void;
}

const TelegramSettings = ({ userId, currentTelegramId, onUpdate }: TelegramSettingsProps) => {
  const { toast } = useToast();
  const [telegramId, setTelegramId] = useState(currentTelegramId || '');
  const [isLoading, setIsLoading] = useState(false);

  console.log('TelegramSettings userId:', userId, 'type:', typeof userId);

  const handleSave = async () => {
    if (!telegramId.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите Telegram ID',
        variant: 'destructive',
      });
      return;
    }

    if (!userId) {
      toast({
        title: 'Ошибка',
        description: 'User ID не найден',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/32fbe1d7-cfb3-446f-84b5-011ff57dc0cf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          telegram_id: telegramId.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Telegram ID сохранён',
        });
        onUpdate();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось сохранить',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Icon name="Bell" size={24} className="text-secondary" />
          Уведомления Telegram
        </CardTitle>
        <CardDescription>
          Получайте уведомления о резервации ваших объявлений
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="telegram-id">Telegram ID</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Чтобы узнать свой ID, напишите боту <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">@userinfobot</a>
          </p>
          <Input
            id="telegram-id"
            type="text"
            placeholder="Например: 123456789"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            className="bg-background"
          />
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="bg-secondary text-primary hover:bg-secondary/90"
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TelegramSettings;