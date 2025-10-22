import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProfileHeaderProps {
  onLogout: () => void;
}

const ProfileHeader = ({ onLogout }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Личный кабинет</h1>
        <p className="text-muted-foreground">Управление профилем и история сделок</p>
      </div>
      <div className="flex gap-3">
        <Button 
          onClick={onLogout}
          variant="outline"
          className="border-secondary text-secondary hover:bg-secondary/10"
        >
          <Icon name="LogOut" className="mr-2" size={20} />
          Выйти
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
