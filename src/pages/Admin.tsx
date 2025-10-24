import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import DealsOffersTab from '@/components/admin/DealsOffersTab';
import UsersTab from '@/components/admin/UsersTab';
import { useAdminData } from '@/components/admin/useAdminData';
import { useExcelExport } from '@/components/admin/useExcelExport';
import { Offer, User } from '@/components/admin/types';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deals-offers');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  const {
    users,
    offers,
    deals,
    isLoading,
    deleteOffer,
    completeDeal,
    toggleUserBlock,
    toggleOfferStatus,
    completeOffer,
    clearAllOffers
  } = useAdminData();

  const { exportToExcel } = useExcelExport(users, offers, deals);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        onExport={() => exportToExcel(filteredOffers.length > 0 ? filteredOffers : undefined, filteredUsers.length > 0 ? filteredUsers : undefined)}
        onNavigateHome={() => navigate('/')}
        onClearAllOffers={clearAllOffers}
      />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <AdminStats users={users} offers={offers} deals={deals} />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-card border border-border mb-6">
              <TabsTrigger value="deals-offers" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="FileText" className="mr-2" size={20} />
                Объявления
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="Users" className="mr-2" size={20} />
                Пользователи
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals-offers" className="space-y-4">
              <DealsOffersTab 
                offers={offers}
                deals={deals}
                onToggleStatus={toggleOfferStatus}
                onDelete={deleteOffer}
                onCompleteDeal={completeDeal}
                onCompleteOffer={completeOffer}
                onFilteredOffersChange={setFilteredOffers}
              />
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <UsersTab 
                users={users} 
                offers={offers}
                deals={deals}
                onToggleBlock={toggleUserBlock}
                onFilteredUsersChange={setFilteredUsers}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;