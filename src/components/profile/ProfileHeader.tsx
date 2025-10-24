import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProfileHeaderProps {
  onLogout: () => void;
}

const ProfileHeader = ({ onLogout }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Личный кабинет</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Управление профилем и история сделок</p>
      </div>
      <div className="flex gap-3">
        <Button 
          onClick={onLogout}
          variant="outline"
          className="border-secondary text-secondary hover:bg-secondary/10 text-sm sm:text-base"
        >
          <Icon name="LogOut" className="mr-2" size={18} />
          Выйти
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;