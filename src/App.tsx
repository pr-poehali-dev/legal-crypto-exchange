
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useStatisticsUpdater } from "@/hooks/use-statistics-updater";
import { useReservationNotifications } from "@/hooks/useReservationNotifications";
import ReservationNotificationDialog from "@/components/profile/ReservationNotificationDialog";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Offers from "./pages/Offers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();
  useStatisticsUpdater();
  const { notification, setNotification, offers } = useReservationNotifications();
  
  const handleAccept = async (reservationId: number) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('https://functions.poehali.dev/353673c7-c605-4d46-bb98-56554c376426', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || '',
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          action: 'confirm',
        }),
      });

      if (response.ok) {
        setNotification(null);
        navigate('/profile');
      }
    } catch (error) {
      console.error('Accept error:', error);
    }
  };

  const handleReject = async (reservationId: number) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('https://functions.poehali.dev/353673c7-c605-4d46-bb98-56554c376426', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || '',
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          action: 'reject',
        }),
      });

      if (response.ok) {
        setNotification(null);
      }
    } catch (error) {
      console.error('Reject error:', error);
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