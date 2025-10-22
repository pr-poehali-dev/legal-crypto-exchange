import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onExport: () => void;
  onNavigateHome: () => void;
}

const AdminHeader = ({ onExport, onNavigateHome }: AdminHeaderProps) => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onExport} className="bg-green-600 hover:bg-green-700 text-white">
              <Icon name="Download" className="mr-2" size={16} />
              Экспорт в Excel
            </Button>
            <Button onClick={onNavigateHome} variant="outline">
              <Icon name="Home" className="mr-2" size={16} />
              На главную
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;
