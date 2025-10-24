import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Icon from '@/components/ui/icon';

interface PeriodFilterProps {
  value: string;
  onPeriodChange: (period: string, startDate?: string, endDate?: string) => void;
  className?: string;
}

const PeriodFilter = ({ value, onPeriodChange, className = '' }: PeriodFilterProps) => {
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handlePeriodSelect = (period: string) => {
    if (period === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onPeriodChange(period);
    }
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      onPeriodChange(
        'custom',
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      setShowCustom(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={value} onValueChange={handlePeriodSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Выберите период" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_time">За всё время</SelectItem>
          <SelectItem value="today">Сегодня</SelectItem>
          <SelectItem value="yesterday">Вчера</SelectItem>
          <SelectItem value="week">За неделю</SelectItem>
          <SelectItem value="custom">Выбрать даты</SelectItem>
        </SelectContent>
      </Select>

      {showCustom && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Icon name="Calendar" size={16} className="mr-2" />
              {startDate && endDate
                ? `${format(startDate, 'dd.MM.yy')} - ${format(endDate, 'dd.MM.yy')}`
                : 'Выбрать даты'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Начало периода</p>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={ru}
                  disabled={(date) => date > new Date()}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Конец периода</p>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={ru}
                  disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                />
              </div>
              <Button
                onClick={handleCustomApply}
                disabled={!startDate || !endDate}
                className="w-full"
              >
                Применить
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default PeriodFilter;