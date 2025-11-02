import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  userId: number;
}

const NotificationSettings = ({ userId }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    const savedSound = localStorage.getItem('notifications_sound');
    const savedVibration = localStorage.getItem('notifications_vibration');
    
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    if (savedVibration !== null) setVibrationEnabled(savedVibration === 'true');
  }, []);

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast({
        title: '❌ Не поддерживается',
        description: 'Ваш браузер не поддерживает уведомления',
        variant: 'destructive',
      });
      return;
    }

    if (permission === 'denied') {
      toast({
        title: '🚫 Разрешение запрещено',
        description: 'Включите уведомления в настройках браузера',
        variant: 'destructive',
      });
      return;
    }

    if (permission === 'default' || permission === 'granted') {
      try {
        const newPermission = await Notification.requestPermission();
        setPermission(newPermission);
        setNotificationsEnabled(newPermission === 'granted');

        if (newPermission === 'granted') {
          toast({
            title: '✅ Уведомления включены',
            description: 'Вы будете получать уведомления о новых бронях',
          });
          
          new Notification('🎉 Уведомления работают!', {
            body: 'Теперь вы не пропустите ни одной брони',
            icon: '/favicon.ico',
          });
        } else if (newPermission === 'denied') {
          toast({
            title: '🚫 Разрешение отклонено',
            description: 'Вы можете изменить это в настройках браузера',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Notification error:', error);
        toast({
          title: '❌ Ошибка',
          description: 'Не удалось запросить разрешение на уведомления',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notifications_sound', String(enabled));
    toast({
      title: enabled ? '🔊 Звук включен' : '🔇 Звук выключен',
      description: enabled ? 'Уведомления будут со звуком' : 'Уведомления будут беззвучными',
      duration: 2000,
    });
  };

  const handleToggleVibration = (enabled: boolean) => {
    setVibrationEnabled(enabled);
    localStorage.setItem('notifications_vibration', String(enabled));
    
    if (enabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    toast({
      title: enabled ? '📳 Вибрация включена' : '📴 Вибрация выключена',
      description: enabled ? 'Устройство будет вибрировать при уведомлениях' : 'Вибрация отключена',
      duration: 2000,
    });
  };

  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('🔔 Тестовое уведомление', {
        body: 'Так будут выглядеть уведомления о новых бронях',
        icon: '/favicon.ico',
        vibrate: vibrationEnabled ? [200, 100, 200, 100, 400] : undefined,
      });

      if (soundEnabled) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.3;
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
          console.error('Sound test error:', error);
        }
      }

      toast({
        title: '✅ Тест успешен',
        description: 'Уведомление отправлено',
        duration: 2000,
      });
    } else {
      toast({
        title: '⚠️ Включите уведомления',
        description: 'Сначала разрешите уведомления в браузере',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bell" size={20} />
          Уведомления
        </CardTitle>
        <CardDescription>
          Управление push-уведомлениями о новых бронях
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            <Icon 
              name={notificationsEnabled ? "BellRing" : "BellOff"} 
              size={20} 
              className="mt-0.5"
            />
            <div>
              <p className="font-medium">Push-уведомления</p>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' 
                  ? 'Получайте уведомления о новых бронях'
                  : permission === 'denied'
                  ? 'Разрешение отклонено в браузере'
                  : 'Включите для получения уведомлений'
                }
              </p>
            </div>
          </div>
          <Button
            onClick={handleToggleNotifications}
            variant={notificationsEnabled ? "default" : "outline"}
            disabled={permission === 'denied'}
          >
            {notificationsEnabled ? 'Включено' : 'Включить'}
          </Button>
        </div>

        {notificationsEnabled && (
          <>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Volume2" size={20} className="mt-0.5" />
                <div>
                  <p className="font-medium">Звук уведомлений</p>
                  <p className="text-sm text-muted-foreground">
                    Проигрывать звук при новых бронях
                  </p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={handleToggleSound}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Smartphone" size={20} className="mt-0.5" />
                <div>
                  <p className="font-medium">Вибрация</p>
                  <p className="text-sm text-muted-foreground">
                    Вибрировать при новых уведомлениях (на мобильных)
                  </p>
                </div>
              </div>
              <Switch
                checked={vibrationEnabled}
                onCheckedChange={handleToggleVibration}
              />
            </div>

            <Button
              variant="outline"
              onClick={testNotification}
              className="w-full"
            >
              <Icon name="TestTube2" size={16} className="mr-2" />
              Проверить уведомления
            </Button>
          </>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex gap-3">
              <Icon name="AlertCircle" size={20} className="text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">Уведомления заблокированы</p>
                <p className="text-muted-foreground">
                  Чтобы включить уведомления, разрешите их в настройках браузера:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>Нажмите на иконку замка в адресной строке</li>
                  <li>Найдите "Уведомления" и измените на "Разрешить"</li>
                  <li>Обновите страницу</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
