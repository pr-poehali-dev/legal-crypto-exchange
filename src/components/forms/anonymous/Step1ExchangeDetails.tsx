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
  availableSlots: string[];
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
  availableSlots,
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
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                Нет доступных слотов
              </div>
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          <Icon name="Info" size={12} className="inline mr-1" />
          Доступны только свободные временные слоты
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