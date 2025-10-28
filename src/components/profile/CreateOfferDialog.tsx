import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  meetingTime: string;
  setMeetingTime: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  selectedOffices: string[];
  setSelectedOffices: (offices: string[]) => void;
  onSubmit: () => void;
  isEditing?: boolean;
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
  meetingTime,
  setMeetingTime,
  city,
  setCity,
  selectedOffices,
  setSelectedOffices,
  onSubmit,
  isEditing = false
}: CreateOfferDialogProps) => {
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rubles, setRubles] = useState<string>('');
  const [lastEditedField, setLastEditedField] = useState<'usdt' | 'rubles'>('usdt');

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
      calculateRubles(amount, currentRate.toFixed(2));
    }
  };

  const calculateRubles = (usdtAmount: string, exchangeRate: string) => {
    const usdt = parseFloat(usdtAmount);
    const rateNum = parseFloat(exchangeRate);
    if (!isNaN(usdt) && !isNaN(rateNum) && usdt > 0 && rateNum > 0) {
      setRubles((usdt * rateNum).toFixed(2));
    } else {
      setRubles('');
    }
  };

  const calculateUsdt = (rublesAmount: string, exchangeRate: string) => {
    const rub = parseFloat(rublesAmount);
    const rateNum = parseFloat(exchangeRate);
    if (!isNaN(rub) && !isNaN(rateNum) && rub > 0 && rateNum > 0) {
      setAmount((rub / rateNum).toFixed(2));
    } else {
      setAmount('');
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setLastEditedField('usdt');
    calculateRubles(value, rate);
  };

  const handleRublesChange = (value: string) => {
    setRubles(value);
    setLastEditedField('rubles');
    calculateUsdt(value, rate);
  };

  const handleRateChange = (value: string) => {
    setRate(value);
    if (lastEditedField === 'usdt') {
      calculateRubles(amount, value);
    } else {
      calculateUsdt(rubles, value);
    }
  };

  const cityOffices: Record<string, string[]> = {
    'Москва': [
      'ул. Нефтезаводская, д.9/2, 12 этаж',
      'ул. Кирова, д.19/3, 33 этаж',
      'ул. Московская, д.159, 1 этаж'
    ],
    'Санкт-Петербург': [
      'Невский проспект, д.190, 23 этаж',
      'ул. Московская, д.459, 3 этаж',
      'ул. Центральная, д.166, 17 этаж'
    ],
    'Сочи': [
      'ул. Солнечная, д.78, 1 этаж',
      'ул. Виноградная, д.99, 8 этаж',
      'ул. Пляжная, д.1, 77 этаж'
    ],
    'Омск': [
      'ул. Ленина, д.99, 19 этаж',
      'ул. Химик, д.11, 5 этаж'
    ]
  };

  const currentCityOffices = cityOffices[city] || [];

  const handleOfficeToggle = (office: string) => {
    if (selectedOffices.includes(office)) {
      setSelectedOffices(selectedOffices.filter(o => o !== office));
    } else {
      setSelectedOffices([...selectedOffices, office]);
    }
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Generate all time slots from 9:00 to 21:00 with 15-minute intervals
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeSlot = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        // Filter out past times
        const isPastTime = hour < currentHour || (hour === currentHour && minute <= currentMinute);
        
        if (!isPastTime) {
          slots.push(timeSlot);
        }
      }
    }
    
    return slots;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-secondary text-primary hover:bg-secondary/90">
          <Icon name="Plus" className="mr-2" size={20} />
          Создать объявление
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isEditing ? 'Редактировать объявление' : 'Новое объявление'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Измените данные объявления' : 'Заполните данные для создания объявления'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pb-4">
          <div>
            <Label htmlFor="offer-type">Тип объявления</Label>
            <Select value={offerType} onValueChange={(value: 'buy' | 'sell') => setOfferType(value)}>
              <SelectTrigger id="offer-type" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Покупка USDT</span>
                    <span className="text-xs text-muted-foreground">Вы отдаёте рубли, получаете USDT</span>
                  </div>
                </SelectItem>
                <SelectItem value="sell">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Продажа USDT</span>
                    <span className="text-xs text-muted-foreground">Вы отдаёте USDT, получаете рубли</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Сумма (USDT)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="1000"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="rubles">Сумма (₽)</Label>
              <Input
                id="rubles"
                type="number"
                step="0.01"
                placeholder="95500"
                value={rubles}
                onChange={(e) => handleRublesChange(e.target.value)}
                className="bg-background"
              />
            </div>
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
              placeholder="95.50"
              value={rate}
              onChange={(e) => handleRateChange(e.target.value)}
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="city">Город</Label>
            <Select value={city} onValueChange={(value) => {
              setCity(value);
              setSelectedOffices([]);
            }}>
              <SelectTrigger id="city" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Москва">Москва</SelectItem>
                <SelectItem value="Санкт-Петербург">Санкт-Петербург</SelectItem>
                <SelectItem value="Сочи">Сочи</SelectItem>
                <SelectItem value="Омск">Омск</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Выберите офисы для встречи</Label>
            <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto bg-background/50 rounded-lg p-3">
              {currentCityOffices.map((office) => (
                <div key={office} className="flex items-start space-x-2">
                  <Checkbox
                    id={office}
                    checked={selectedOffices.includes(office)}
                    onCheckedChange={() => handleOfficeToggle(office)}
                  />
                  <label
                    htmlFor={office}
                    className="text-sm leading-relaxed cursor-pointer select-none"
                  >
                    {office}
                  </label>
                </div>
              ))}
            </div>
            {selectedOffices.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">Выберите хотя бы один офис</p>
            )}
          </div>
          <div>
            <Label>Время встречи</Label>
            <Select value={meetingTime} onValueChange={setMeetingTime}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Выберите время" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {generateTimeSlots().map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              <Icon name="Info" size={12} className="inline mr-1" />
              Обратите внимание: курс обмена актуален в течение трех часов и может измениться
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onSubmit}
              className="flex-1 bg-secondary text-primary hover:bg-secondary/90"
            >
              {isEditing ? 'Сохранить' : 'Создать'}
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