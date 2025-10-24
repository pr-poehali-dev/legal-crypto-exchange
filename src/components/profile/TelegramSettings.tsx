import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

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
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-between mb-4">
              <span className="flex items-center gap-2">
                <Icon name="HelpCircle" size={16} />
                Как настроить уведомления?
              </span>
              <Icon name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} size={16} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-primary text-xs font-bold">1</span>
                Откройте бота
              </p>
              <p className="text-sm text-muted-foreground pl-8">
                Перейдите в Telegram и откройте <a href="https://t.me/cryptochange131231_bot" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-medium">@cryptochange131231_bot</a>
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-primary text-xs font-bold">2</span>
                Запустите бота
              </p>
              <p className="text-sm text-muted-foreground pl-8">
                Нажмите кнопку <span className="font-mono bg-background px-2 py-0.5 rounded">Start</span> или напишите команду <span className="font-mono bg-background px-2 py-0.5 rounded">/start</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-primary text-xs font-bold">3</span>
                Получите Telegram ID
              </p>
              <p className="text-sm text-muted-foreground pl-8">
                Бот пришлёт вам ваш Telegram ID. Скопируйте его и вставьте в поле ниже.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div>
          <Label htmlFor="telegram-id">Telegram ID</Label>
          <Input
            id="telegram-id"
            type="text"
            placeholder="Например: 123456789"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            className="bg-background mt-2"
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