import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import DealsTab from '@/components/admin/DealsTab';
import OffersTab from '@/components/admin/OffersTab';
import UsersTab from '@/components/admin/UsersTab';
import { useAdminData } from '@/components/admin/useAdminData';
import { useExcelExport } from '@/components/admin/useExcelExport';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deals');
  
  const {
    users,
    offers,
    deals,
    isLoading,
    deleteOffer,
    completeDeal,
    toggleUserBlock,
    toggleOfferStatus
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
        onExport={exportToExcel}
        onNavigateHome={() => navigate('/')}
      />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <AdminStats users={users} offers={offers} deals={deals} />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-card border border-border mb-6">
              <TabsTrigger value="deals" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="Handshake" className="mr-2" size={20} />
                Сделки
              </TabsTrigger>
              <TabsTrigger value="offers" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="MessageSquare" className="mr-2" size={20} />
                Объявления
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="Users" className="mr-2" size={20} />
                Пользователи
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="space-y-4">
              <DealsTab deals={deals} onCompleteDeal={completeDeal} />
            </TabsContent>

            <TabsContent value="offers" className="space-y-4">
              <OffersTab 
                offers={offers} 
                onToggleStatus={toggleOfferStatus}
                onDelete={deleteOffer}
              />
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <UsersTab users={users} onToggleBlock={toggleUserBlock} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;