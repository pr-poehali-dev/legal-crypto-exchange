import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RegisteredBookingFormProps {
  currentRate: number;
  offerAmount: number;
  rubAmount: string;
  usdtAmount: string;
  onRubChange: (value: string) => void;
  onUsdtChange: (value: string) => void;
  firstOfferOffice: string;
  offerCity: string;
  useOfferOffice: boolean;
  onUseOfferOfficeChange: (checked: boolean) => void;
  customOffice: string;
  onCustomOfficeChange: (value: string) => void;
  cityOffices: string[];
  selectedTimeSlot: string;
  onTimeSlotChange: (value: string) => void;
  availableSlots: string[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisteredBookingForm = ({
  currentRate,
  offerAmount,
  rubAmount,
  usdtAmount,
  onRubChange,
  onUsdtChange,
  firstOfferOffice,
  offerCity,
  useOfferOffice,
  onUseOfferOfficeChange,
  customOffice,
  onCustomOfficeChange,
  cityOffices,
  selectedTimeSlot,
  onTimeSlotChange,
  availableSlots,
  isSubmitting,
  onSubmit,
}: RegisteredBookingFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Адрес для встречи</Label>
        {firstOfferOffice && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="use-offer-office"
                checked={useOfferOffice}
                onCheckedChange={(checked) => onUseOfferOfficeChange(checked === true)}
                disabled={isSubmitting}
              />
              <Label htmlFor="use-offer-office" className="text-sm leading-relaxed cursor-pointer font-normal">
                {offerCity}, {firstOfferOffice}
              </Label>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Checkbox
              id="use-custom-office"
              checked={!useOfferOffice}
              onCheckedChange={(checked) => onUseOfferOfficeChange(checked !== true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="use-custom-office" className="text-sm leading-relaxed cursor-pointer font-normal">
              Укажите свой адрес
            </Label>
          </div>
          {!useOfferOffice && (
            <Select value={customOffice} onValueChange={onCustomOfficeChange} disabled={isSubmitting}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Выберите адрес" />
              </SelectTrigger>
              <SelectContent>
                {cityOffices.map((office, idx) => (
                  <SelectItem key={idx} value={office}>{office}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time-slot">Выберите время встречи</Label>
        <Select value={selectedTimeSlot} onValueChange={onTimeSlotChange} disabled={isSubmitting}>
          <SelectTrigger id="time-slot">
            <SelectValue placeholder="Выберите время" />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            Отправить заявку
            <Icon name="Send" className="ml-2" size={16} />
          </>
        )}
      </Button>
    </form>
  );
};
