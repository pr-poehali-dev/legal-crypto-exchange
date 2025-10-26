import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface RegisterDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const RegisterDialog = ({ isOpen, setIsOpen }: RegisterDialogProps) => {
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneClean = phone.replace(/[^\d+]/g, '');
    return phoneClean.length >= 10 && phoneClean.length <= 12;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    console.log('Register data:', registerData);

    if (registerData.first_name.trim().length < 2) {
      setErrorMessage('Имя должно содержать минимум 2 символа');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (registerData.last_name.trim().length < 2) {
      setErrorMessage('Фамилия должна содержать минимум 2 символа');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(registerData.email)) {
      setErrorMessage('Введите корректный email адрес');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(registerData.phone)) {
      setErrorMessage('Введите корректный номер телефона (формат: +7XXXXXXXXXX)');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage('Пароль должен содержать минимум 6 символов');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/0ff8de54-89bc-48dd-867a-b014941a6c41', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setRegisterData({ first_name: '', last_name: '', email: '', phone: '', password: '' });
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Ошибка регистрации. Попробуйте снова.');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-secondary text-primary hover:bg-secondary/90 hidden lg:inline-flex text-xs lg:text-sm">
          Регистрация
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Регистрация</DialogTitle>
          <DialogDescription>
            Создайте аккаунт для безопасных сделок с USDT
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="first_name">Имя</Label>
            <Input 
              id="first_name" 
              placeholder="Иван" 
              className="bg-background border-border"
              value={registerData.first_name}
              onChange={(e) => setRegisterData({...registerData, first_name: e.target.value})}
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="last_name">Фамилия</Label>
            <Input 
              id="last_name" 
              placeholder="Иванов" 
              className="bg-background border-border"
              value={registerData.last_name}
              onChange={(e) => setRegisterData({...registerData, last_name: e.target.value})}
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="ivan@example.com" 
              className="bg-background border-border"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              required
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              title="Введите корректный email адрес"
            />
          </div>
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input 
              id="phone" 
              type="tel"
              placeholder="+7 (999) 123-45-67" 
              className="bg-background border-border"
              value={registerData.phone}
              onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
              required
              pattern="[\+]?[0-9\s\-\(\)]{10,15}"
              title="Введите корректный номер телефона (формат: +7XXXXXXXXXX)"
            />
          </div>
          <div>
            <Label htmlFor="password">Пароль (минимум 6 символов)</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Минимум 6 символов" 
              className="bg-background border-border"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              required
              minLength={6}
              maxLength={100}
            />
          </div>
          {submitStatus === 'success' && (
            <div className="text-accent text-sm">
              ✅ Регистрация успешна! Теперь вы можете войти в систему.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="text-red-500 text-sm">
              ❌ {errorMessage || 'Ошибка регистрации. Попробуйте снова.'}
            </div>
          )}
          <Button 
            type="submit"
            className="w-full bg-secondary text-primary hover:bg-secondary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;