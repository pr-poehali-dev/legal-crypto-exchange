
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useStatisticsUpdater } from "@/hooks/use-statistics-updater";
import { useReservationNotifications } from "@/hooks/useReservationNotifications";
import { useToast } from "@/hooks/use-toast";
import ReservationNotificationDialog from "@/components/profile/ReservationNotificationDialog";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Offers from "./pages/Offers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  useStatisticsUpdater();
  const { notification, setNotification, offers } = useReservationNotifications();
  
  const handleAccept = async (reservationId: number) => {
    console.log('🚀 handleAccept CALLED with reservationId:', reservationId);
    try {
      const savedUser = localStorage.getItem('user');
      console.log('savedUser:', savedUser);
      if (!savedUser) {
        console.error('No saved user found!');
        return;
      }
      
      const userData = JSON.parse(savedUser);
      const userId = userData.id;
      
      console.log('Accepting reservation:', { reservationId, userId });
      
      const response = await fetch('https://functions.poehali.dev/353673c7-c605-4d46-bb98-56554c376426', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          action: 'accept',
        }),
      });

      const data = await response.json();
      console.log('Accept response:', data);

      if (response.ok && data.success) {
        toast({
          title: '✅ Бронь подтверждена',
          description: 'Бронирование успешно подтверждено',
        });
        setNotification(null);
        navigate('/profile');
      } else {
        console.error('Accept failed:', data);
        toast({
          title: '❌ Ошибка',
          description: data.error || 'Не удалось подтвердить бронь',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Accept error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось обработать запрос',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (reservationId: number) => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);
      const userId = userData.id;
      
      console.log('Rejecting reservation:', { reservationId, userId });
      
      const response = await fetch('https://functions.poehali.dev/353673c7-c605-4d46-bb98-56554c376426', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          action: 'reject',
        }),
      });

      const data = await response.json();
      console.log('Reject response:', data);

      if (response.ok && data.success) {
        toast({
          title: '✅ Бронь отклонена',
          description: 'Бронирование успешно отклонено',
        });
        setNotification(null);
      } else {
        console.error('Reject failed:', data);
        toast({
          title: '❌ Ошибка',
          description: data.error || 'Не удалось отклонить бронь',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось обработать запрос',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/offers" element={<Offers />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <ReservationNotificationDialog
        notification={notification}
        offers={offers}
        onClose={() => setNotification(null)}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;