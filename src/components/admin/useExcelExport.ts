import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { User, Offer, Deal } from './types';

export const useExcelExport = (users: User[], offers: Offer[], deals: Deal[]) => {
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const dealsData = deals.map(deal => ({
      'ID': deal.id,
      'Пользователь': deal.username,
      'Email': deal.email,
      'Телефон': deal.phone,
      'Тип': deal.deal_type === 'buy' ? 'Покупка' : 'Продажа',
      'Количество USDT': deal.amount,
      'Курс ₽': deal.rate,
      'Итого ₽': deal.total,
      'Статус': deal.status === 'completed' ? 'Завершена' : deal.status === 'pending' ? 'В процессе' : 'Отменена',
      'Партнёр': deal.partner_name,
      'Дата создания': new Date(deal.created_at).toLocaleString('ru-RU'),
      'Дата обновления': new Date(deal.updated_at).toLocaleString('ru-RU')
    }));
    const dealsSheet = XLSX.utils.json_to_sheet(dealsData);
    XLSX.utils.book_append_sheet(workbook, dealsSheet, 'Сделки');

    const offersData = offers.map(offer => ({
      'ID': offer.id,
      'Пользователь': offer.username,
      'Телефон': offer.phone,
      'Тип': offer.offer_type === 'buy' ? 'Покупка' : 'Продажа',
      'Количество USDT': offer.amount,
      'Курс ₽': offer.rate,
      'Время встречи': offer.meeting_time,
      'Статус': offer.status === 'active' ? 'Активно' : 'Неактивно',
      'Дата создания': new Date(offer.created_at).toLocaleString('ru-RU')
    }));
    const offersSheet = XLSX.utils.json_to_sheet(offersData);
    XLSX.utils.book_append_sheet(workbook, offersSheet, 'Объявления');

    const usersData = users.map(user => ({
      'ID': user.id,
      'Имя': user.name,
      'Email': user.email,
      'Телефон': user.phone,
      'Статус': user.blocked ? 'Заблокирован' : 'Активен',
      'Дата регистрации': new Date(user.created_at).toLocaleString('ru-RU')
    }));
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Пользователи');

    const statsData = [
      { 'Показатель': 'Всего пользователей', 'Значение': users.length },
      { 'Показатель': 'Всего объявлений', 'Значение': offers.length },
      { 'Показатель': 'Активных объявлений', 'Значение': offers.filter(o => o.status === 'active').length },
      { 'Показатель': 'Всего сделок', 'Значение': deals.length },
      { 'Показатель': 'Завершённых сделок', 'Значение': deals.filter(d => d.status === 'completed').length },
      { 'Показатель': 'Общий объём (₽)', 'Значение': deals.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.total, 0) }
    ];
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Статистика');

    const fileName = `KuzbassExchange_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Данные экспортированы в Excel');
  };

  return { exportToExcel };
};
