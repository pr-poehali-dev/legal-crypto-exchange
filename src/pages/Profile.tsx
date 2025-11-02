import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/sections/Navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import CreateOfferDialog from '@/components/profile/CreateOfferDialog';
import OffersList from '@/components/profile/OffersList';
import TelegramSettings from '@/components/profile/TelegramSettings';
import ReservationNotificationDialog from '@/components/profile/ReservationNotificationDialog';
import { useProfileData } from '@/hooks/useProfileData';
import { useOfferForm } from '@/hooks/useOfferForm';
import { useOfferActions } from '@/hooks/useOfferActions';

const Profile = () => {
  const navigate = useNavigate();
  const {
    user,
    deals,
    offers,
    newReservationNotification,
    setNewReservationNotification,
    loadDeals,
    loadOffers,
    loadUserData
  } = useProfileData();

  const refreshData = () => {
    if (user?.id) {
      loadOffers(user.id);
      loadDeals(user.id);
    }
  };

  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    offerType,
    setOfferType,
    amount,
    setAmount,
    rate,
    setRate,
    meetingTime,
    setMeetingTime,
    meetingTimeEnd,
    setMeetingTimeEnd,
    city,
    setCity,
    selectedOffices,
    setSelectedOffices,
    editingOffer,
    resetForm,
    handleEditOffer,
    handleCreateOffer
  } = useOfferForm(user?.id, refreshData);

  const {
    handleUpdateOfferStatus,
    handleCancelReservation,
    handleDeleteOffer,
    handleManageReservation
  } = useOfferActions(user?.id, refreshData);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <ProfileHeader onLogout={handleLogout} />
            <CreateOfferDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetForm();
              }}
              offerType={offerType}
              setOfferType={setOfferType}
              amount={amount}
              setAmount={setAmount}
              rate={rate}
              setRate={setRate}
              meetingTime={meetingTime}
              setMeetingTime={setMeetingTime}
              meetingTimeEnd={meetingTimeEnd}
              setMeetingTimeEnd={setMeetingTimeEnd}
              city={city}
              setCity={setCity}
              selectedOffices={selectedOffices}
              setSelectedOffices={setSelectedOffices}
              onSubmit={handleCreateOffer}
              isEditing={!!editingOffer}
            />
          </div>

          <ProfileStats
            username={user.username}
            phone={user.phone}
            deals={deals}
            offers={offers}
            userId={user.id}
          />

          <TelegramSettings
            userId={user.id}
            currentTelegramId={user.telegram_id}
            onUpdate={() => loadUserData(user.id)}
          />

          <OffersList
            offers={offers}
            deals={deals}
            onUpdateStatus={handleUpdateOfferStatus}
            onEditOffer={handleEditOffer}
            onDeleteOffer={handleDeleteOffer}
            onCancelReservation={handleCancelReservation}
            onManageReservation={handleManageReservation}
            formatDate={formatDate}
          />
        </div>
      </div>

      <ReservationNotificationDialog
        notification={newReservationNotification}
        offers={offers}
        onClose={() => setNewReservationNotification(null)}
        onAccept={(reservationId) => handleManageReservation(reservationId, 'accept')}
        onReject={(reservationId) => handleManageReservation(reservationId, 'reject')}
      />
    </div>
  );
};

export default Profile;