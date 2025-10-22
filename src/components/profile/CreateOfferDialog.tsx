import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface CreateOfferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  offerType: 'buy' | 'sell';
  setOfferType: (type: 'buy' | 'sell') => void;
  amount: string;
  setAmount: (value: string) => void;
  rate: string;
  setRate: (value: string) => void;
  meetingHour: string;
  setMeetingHour: (value: string) => void;
  meetingMinute: string;
  setMeetingMinute: (value: string) => void;
  onSubmit: () => void;
}

const CreateOfferDialog = ({
  isOpen,
  onOpenChange,
  offerType,
  setOfferType,
  amount,
  setAmount,
  rate,
  setRate,
  meetingHour,
  setMeetingHour,
  meetingMinute,
  setMeetingMinute,
  onSubmit
}: CreateOfferDialogProps) => {
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentRate();
    }
  }, [isOpen]);

  const fetchCurrentRate = async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('https://functions.poehali.dev/f429c90b-c275-4b5d-bcd3-d3a69a15dea9');
      const data = await response.json();
      
      if (data.success && data.rate) {
        setCurrentRate(data.rate);
      }
    } catch (error) {
      console.error('Failed to fetch rate:', error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  const useCurrentRate = () => {
    if (currentRate) {
      setRate(currentRate.toFixed(2));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-secondary text-primary hover:bg-secondary/90">
          <Icon name="Plus" className="mr-2" size={20} />
          Создать объявление
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Новое объявление</DialogTitle>
          <DialogDescription>
            Заполните данные для создания объявления
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="offer-type">Тип объявления</Label>
            <Select value={offerType} onValueChange={(value: 'buy' | 'sell') => setOfferType(value)}>
              <SelectTrigger id="offer-type" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Покупка USDT</SelectItem>
                <SelectItem value="sell">Продажа USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Сумма (USDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Например: 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="rate">Курс (₽ за 1 USDT)</Label>
              {currentRate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Рыночный: <span className="font-semibold text-secondary">{currentRate.toFixed(2)} ₽</span>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={useCurrentRate}
                    className="h-7 px-2 text-xs"
                  >
                    Использовать
                  </Button>
                </div>
              )}
              {isLoadingRate && (
                <span className="text-sm text-muted-foreground">Загрузка...</span>
              )}
            </div>
            <Input
              id="rate"
              type="number"
              step="0.01"
              placeholder="Например: 95.50"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="bg-background"
            />
          </div>
          <div>
            <Label>Время встречи</Label>
            <div className="flex gap-2">
              <Select value={meetingHour} onValueChange={setMeetingHour}>
                <SelectTrigger className="flex-1 bg-background">
                  <SelectValue placeholder="Час" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <SelectItem key={hour} value={String(hour).padStart(2, '0')}>
                      {String(hour).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="flex items-center text-2xl font-bold">:</span>
              <Select value={meetingMinute} onValueChange={setMeetingMinute}>
                <SelectTrigger className="flex-1 bg-background">
                  <SelectValue placeholder="Минуты" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {['00', '15', '30', '45'].map(minute => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onSubmit}
              className="flex-1 bg-secondary text-primary hover:bg-secondary/90"
            >
              Создать
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-secondary"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOfferDialog;