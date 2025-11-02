import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Step1ExchangeDetailsProps {
  currentRate: number;
  offerAmount: number;
  rubAmount: string;
  usdtAmount: string;
  onRubChange: (value: string) => void;
  onUsdtChange: (value: string) => void;
  firstOfferOffice: string;
  meetingTime: string;
  onMeetingTimeChange: (value: string) => void;
  occupiedTimes: Set<string>;
  onNextStep: () => void;
}

export const Step1ExchangeDetails = ({
  currentRate,
  offerAmount,
  rubAmount,
  usdtAmount,
  onRubChange,
  onUsdtChange,
  firstOfferOffice,
  meetingTime,
  onMeetingTimeChange,
  occupiedTimes,
  onNextStep,
}: Step1ExchangeDetailsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Текущий курс</Label>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            1 USDT = {currentRate.toFixed(2)} ₽
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Сумма обмена</Label>
          <span className="text-xs text-muted-foreground">
            Макс: {offerAmount} USDT ({(offerAmount * currentRate).toFixed(2)} ₽)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rub-amount" className="text-xs text-muted-foreground">В рублях (₽)</Label>
            <Input
              id="rub-amount"
              type="number"
              step="0.01"
              min="0"
              max={(offerAmount * currentRate).toFixed(2)}
              placeholder="0.00"
              value={rubAmount}
              onChange={(e) => onRubChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="usdt-amount" className="text-xs text-muted-foreground">В USDT</Label>
            <Input
              id="usdt-amount"
              type="number"
              step="0.01"
              min="0"
              max={offerAmount}
              placeholder="0.00"
              value={usdtAmount}
              onChange={(e) => onUsdtChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Адрес для встречи</Label>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            {firstOfferOffice}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Выберите время встречи</Label>
        <Select value={meetingTime} onValueChange={onMeetingTimeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите время" />
          </SelectTrigger>
          <SelectContent>
            <TooltipProvider>
              {Array.from({ length: 13 }, (_, i) => i + 9).flatMap((hour) => 
                ['00', '15', '30', '45'].map((minute) => {
                  if (hour > 21) return null;
                  if (hour === 21 && minute !== '00') return null;
                  
                  const now = new Date();
                  const currentHour = now.getHours();
                  const currentMinute = now.getMinutes();
                  const slotHour = hour;
                  const slotMinute = parseInt(minute);
                  
                  if (slotHour < currentHour) return null;
                  if (slotHour === currentHour && slotMinute <= currentMinute) return null;
                  
                  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                  const isOccupied = occupiedTimes.has(time);
                  
                  return (
                    <Tooltip key={time} delayDuration={200}>
                      <TooltipTrigger asChild>
                        <SelectItem value={time} disabled={isOccupied}>
                          {time} {isOccupied && '(Забронировано)'}
                        </SelectItem>
                      </TooltipTrigger>
                      {isOccupied && (
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="text-xs">
                            <p className="font-semibold">Это время уже занято для выбранного офиса</p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })
              ).filter(Boolean)}
            </TooltipProvider>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          <Icon name="Info" size={12} className="inline mr-1" />
          Обратите внимание: курс обмена актуален в течение трех часов и может измениться
        </p>
      </div>

      <Button 
        type="button"
        onClick={onNextStep}
        className="w-full"
      >
        Далее
        <Icon name="ArrowRight" className="ml-2" />
      </Button>
    </div>
  );
};