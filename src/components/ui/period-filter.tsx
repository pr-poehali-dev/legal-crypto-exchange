import { useState, useEffect } from 'react';
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
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (value === 'custom' && !startDate && !endDate) {
      setTimeout(() => setIsPopoverOpen(true), 100);
    }
  }, [value]);

  const handlePeriodSelect = (period: string) => {
    if (period === 'custom') {
      onPeriodChange(period);
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
      setIsPopoverOpen(false);
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
      setIsPopoverOpen(false);
    }
  };
  
  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
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

      {value === 'custom' && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Icon name="Calendar" size={16} className="mr-2" />
              {startDate && endDate
                ? `${format(startDate, 'dd.MM.yy')} - ${format(endDate, 'dd.MM.yy')}`
                : 'Выбрать период'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">От (начало)</p>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={ru}
                    disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">До (конец)</p>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={ru}
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                    className="rounded-md border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCustomApply}
                  disabled={!startDate || !endDate}
                  className="flex-1"
                >
                  Применить период
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Сбросить
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default PeriodFilter;