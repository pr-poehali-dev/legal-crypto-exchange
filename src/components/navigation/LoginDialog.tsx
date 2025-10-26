import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LoginDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: (user: any) => void;
}

export const LoginDialog = ({ isOpen, setIsOpen, onSuccess }: LoginDialogProps) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://functions.poehali.dev/42eabe98-7376-4ced-87c2-b0b8a64ec658', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok && data.user) {
        onSuccess(data.user);
        setSubmitStatus('success');
        setLoginData({ email: '', password: '' });
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 1000);
      } else {
        setSubmitStatus('error');
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
        <Button variant="outline" size="sm" className="border-secondary/50 bg-secondary/5 hover:bg-secondary/10 hidden lg:inline-flex text-xs lg:text-sm">
          Вход
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Вход в аккаунт</DialogTitle>
          <DialogDescription>
            Войдите в систему для управления своими объявлениями
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input 
              id="login-email" 
              type="email" 
              placeholder="ivan@example.com" 
              className="bg-background border-border"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="login-password">Пароль</Label>
            <Input 
              id="login-password" 
              type="password" 
              placeholder="Введите пароль" 
              className="bg-background border-border"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required
            />
          </div>
          {submitStatus === 'success' && (
            <div className="text-accent text-sm">
              ✅ Вход выполнен успешно!
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="text-red-500 text-sm">
              ❌ Неверный email или пароль
            </div>
          )}
          <Button 
            type="submit"
            className="w-full bg-secondary text-primary hover:bg-secondary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
