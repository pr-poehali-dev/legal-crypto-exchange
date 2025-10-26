import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface RegisteredResponseFormProps {
  offerId: number;
  userId: number;
  username: string;
  offerOffices?: string[];
  offerCity?: string;
  onSuccess?: () => void;
}

const MOSCOW_OFFICES = [
  'Москва, ул. Арбат, 10',
  'Москва, Тверская ул., 15',
  'Москва, ул. Ленина, 25',
];

const CITIES_OFFICES: Record<string, string[]> = {
  'Москва': MOSCOW_OFFICES,
  'Санкт-Петербург': [
    'Санкт-Петербург, Невский пр., 28',
    'Санкт-Петербург, ул. Рубинштейна, 15',
  ],
  'Сочи': [
    'Сочи, ул. Навагинская, 12',
    'Сочи, Курортный пр., 75',
  ],
  'Омск': [
    'Омск, ул. Ленина, 18',
    'Омск, пр. Мира, 32',
  ],
};

const RegisteredResponseForm = ({ 
  offerId, 
  userId, 
  username, 
  offerOffices = [], 
  offerCity = 'Москва', 
  onSuccess 
}: RegisteredResponseFormProps) => {
  const { toast } = useToast();
  const [selectedOffice, setSelectedOffice] = useState('');
  const [meetingHour, setMeetingHour] = useState('');
  const [meetingMinute, setMeetingMinute] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableOffices = CITIES_OFFICES[offerCity] || MOSCOW_OFFICES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingHour || !meetingMinute) {
      toast({
        title: 'Ошибка',
        description: 'Выберите время встречи',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedOffice) {
      toast({
        title: 'Ошибка',
        description: 'Выберите офис для встречи',
        variant: 'destructive',
      });
      return;
    }

    const finalOffice = selectedOffice;
    const meetingTime = `${meetingHour}:${meetingMinute}`;

    setIsSubmitting(true);

    try {
      const response = await fetch('https://functions.poehali.dev/9c031941-05ab-46ce-9781-3bd0b4c6974f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          user_id: userId,
          username: username,
          meeting_office: finalOffice,
          meeting_time: meetingTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Мы получили ваш отклик и свяжемся с вами для подтверждения встречи.',
        });
        setSelectedOffice('');
        setMeetingHour('');
        setMeetingMinute('');
        onSuccess?.();
      } else {
        console.error('Reserve offer error:', data);
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить отклик',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reserve offer fetch error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить отклик. Проверьте подключение к интернету.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Label>Адрес офиса для встречи</Label>
        <Select value={selectedOffice} onValueChange={setSelectedOffice} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите офис" />
          </SelectTrigger>
          <SelectContent>
            {offerOffices.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Офисы из объявления:
                </div>
                {offerOffices.map((office, idx) => (
                  <SelectItem key={`offer-${idx}`} value={office}>{office}</SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                  Наши офисы:
                </div>
              </>
            )}
            {availableOffices.map((office, idx) => (
              <SelectItem key={idx} value={office}>{office}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Выберите время встречи</Label>
        <div className="flex gap-2">
          <Select value={meetingHour} onValueChange={setMeetingHour} disabled={isSubmitting}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Часы" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                  {hour.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-2xl font-bold flex items-center">:</span>
          <Select value={meetingMinute} onValueChange={setMeetingMinute} disabled={isSubmitting}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Минуты" />
            </SelectTrigger>
            <SelectContent>
              {['00', '15', '30', '45'].map((minute) => (
                <SelectItem key={minute} value={minute}>{minute}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Icon name="Loader2" className="mr-2 animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            <Icon name="Handshake" className="mr-2" />
            Откликнуться
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        * Мы получим ваш отклик и свяжемся с вами для подтверждения встречи.
      </p>
    </form>
  );
};

export default RegisteredResponseForm;