import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { User } from './types';

interface UsersTabProps {
  users: User[];
  onToggleBlock: (userId: number, currentBlocked: boolean) => void;
}

const UsersTab = ({ users, onToggleBlock }: UsersTabProps) => {
  if (users.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Пользователей пока нет</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map(user => (
        <Card key={user.id} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-sm text-muted-foreground">Имя</p>
                  <p className="font-semibold">{user.name}</p>
                  {user.blocked && (
                    <Badge variant="destructive" className="mt-1">Заблокирован</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <p className="font-semibold">{user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Регистрация</p>
                  <p className="font-semibold">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={user.blocked ? 'default' : 'destructive'}
                onClick={() => onToggleBlock(user.id, user.blocked || false)}
                className="ml-4"
              >
                <Icon name={user.blocked ? 'Unlock' : 'Lock'} className="mr-2" size={16} />
                {user.blocked ? 'Разблокировать' : 'Заблокировать'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UsersTab;
