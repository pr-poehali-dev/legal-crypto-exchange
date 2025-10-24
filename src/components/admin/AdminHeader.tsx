import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onExport: () => void;
  onNavigateHome: () => void;
}

const AdminHeader = ({ onExport, onNavigateHome }: AdminHeaderProps) => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="Shield" size={20} className="text-primary lg:hidden" />
              <Icon name="Shield" size={24} className="text-primary hidden lg:block" />
            </div>
            <h1 className="text-lg lg:text-2xl font-bold text-foreground truncate">Админ-панель</h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <Button onClick={onExport} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs lg:text-sm">
              <Icon name="Download" className="lg:mr-2" size={16} />
              <span className="hidden lg:inline">Экспорт в Excel</span>
            </Button>
            <Button onClick={onNavigateHome} variant="outline" size="sm" className="text-xs lg:text-sm">
              <Icon name="Home" className="lg:mr-2" size={16} />
              <span className="hidden sm:inline">На главную</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;