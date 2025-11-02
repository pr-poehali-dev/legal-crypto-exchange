import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Offer } from '@/hooks/useProfileData';

interface ReservationNotificationDialogProps {
  notification: {offerId: number, buyerName: string} | null;
  offers: Offer[];
  onClose: () => void;
  onAccept: (reservationId: number) => void;
  onReject: (reservationId: number) => void;
}

const ReservationNotificationDialog = ({ 
  notification, 
  offers, 
  onClose, 
  onAccept, 
  onReject 
}: ReservationNotificationDialogProps) => {
  const handleAccept = () => {
    if (notification) {
      const offer = offers.find(o => o.id === notification.offerId);
      const reservation = offer?.reservations?.find(r => r.buyer_name === notification.buyerName);
      if (reservation) {
        onAccept(reservation.id);
      }
    }
    onClose();
  };

  const handleReject = () => {
    if (notification) {
      const offer = offers.find(o => o.id === notification.offerId);
      const reservation = offer?.reservations?.find(r => r.buyer_name === notification.buyerName);
      if (reservation) {
        onReject(reservation.id);
      }
    }
    onClose();
  };

  return (
    <Dialog open={!!notification} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-accent shadow-xl shadow-accent/20 animate-in zoom-in-95 duration-300">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75"></div>
              <Icon name="Bell" size={24} className="text-white relative z-10" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              🎉 Новая заявка!
            </DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            <span className="font-semibold text-accent">{notification?.buyerName}</span> хочет зарезервировать ваше объявление
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleAccept}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            <Icon name="Check" className="mr-2" />
            Подтвердить
          </Button>
          <Button
            onClick={handleReject}
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
          >
            <Icon name="X" className="mr-2" />
            Отказать
          </Button>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          className="mt-2"
        >
          Посмотрю позже
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationNotificationDialog;