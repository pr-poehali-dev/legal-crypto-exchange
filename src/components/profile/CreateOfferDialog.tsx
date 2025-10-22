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
  meetingTime: string;
  setMeetingTime: (value: string) => void;
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
  meetingTime,
  setMeetingTime,
  onSubmit
}: CreateOfferDialogProps) => {
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
            <Label htmlFor="rate">Курс (₽ за 1 USDT)</Label>
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
            <Label htmlFor="meeting-time">Удобное время для встречи</Label>
            <Input
              id="meeting-time"
              type="text"
              placeholder="Например: Сегодня, 18:00"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="bg-background"
            />
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
