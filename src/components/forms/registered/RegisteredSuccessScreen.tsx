import Icon from '@/components/ui/icon';

export const RegisteredSuccessScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center animate-pulse">
          <Icon name="Clock" size={48} className="text-secondary" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-secondary">Ожидайте подтверждения</h3>
        <p className="text-muted-foreground max-w-sm">
          Ваша заявка успешно отправлена. Владелец объявления получил уведомление и свяжется с вами в ближайшее время.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name="CheckCircle2" size={16} className="text-success" />
        <span>Заявка отправлена</span>
      </div>
    </div>
  );
};
