import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Step2ContactInfoProps {
  name: string;
  phone: string;
  email: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const Step2ContactInfo = ({
  name,
  phone,
  email,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  isSubmitting,
  onBack,
  onSubmit,
}: Step2ContactInfoProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Ваше Имя</Label>
        <Input
          id="name"
          type="text"
          placeholder="Иван Иванов"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Номер телефона *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Почта (необязательно)</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          <Icon name="ArrowLeft" className="mr-2" />
          Назад
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              Отправить
              <Icon name="Send" className="ml-2" size={16} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
