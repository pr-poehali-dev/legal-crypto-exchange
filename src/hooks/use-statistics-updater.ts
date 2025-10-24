import { useEffect } from 'react';
import func2url from '../../backend/func2url.json';

export const useStatisticsUpdater = () => {
  useEffect(() => {
    const updateStatistics = async () => {
      try {
        await fetch(func2url['update-statistics'], {
          method: 'POST',
        });
        console.log('Statistics updated successfully');
      } catch (error) {
        console.error('Failed to update statistics:', error);
      }
    };

    const scheduleNextUpdate = () => {
      const now = new Date();
      
      const moscowOffset = 3 * 60 * 60 * 1000;
      const localOffset = now.getTimezoneOffset() * 60 * 1000;
      const offsetDiff = moscowOffset + localOffset;
      
      const moscowTime = new Date(now.getTime() + offsetDiff);
      
      const nextMidnight = new Date(moscowTime);
      nextMidnight.setHours(24, 0, 0, 0);
      
      const nextMidnightLocal = new Date(nextMidnight.getTime() - offsetDiff);
      
      const timeUntilMidnight = nextMidnightLocal.getTime() - now.getTime();
      
      console.log(`Next statistics update scheduled in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes`);
      
      return setTimeout(() => {
        updateStatistics();
        scheduleNextUpdate();
      }, timeUntilMidnight);
    };

    const timeoutId = scheduleNextUpdate();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);
};
