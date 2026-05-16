import type { ForecastData } from '../types';
import { WeatherIcon } from './WeatherIcon';

interface ForecastProps {
  data: ForecastData;
}

export function Forecast({ data }: ForecastProps) {
  // Берём прогноз на каждый день в полдень (12:00)
  const dailyForecasts = data.list.filter((item) => item.dt_txt.includes('12:00:00')).slice(0, 5);
  
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        📅 Прогноз на 5 дней
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {dailyForecasts.map((item) => (
          <div key={item.dt} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <div className="font-medium text-gray-700 dark:text-gray-300">
              {getDayName(item.dt_txt)}
            </div>
            <WeatherIcon iconCode={item.weather[0].icon} description={item.weather[0].description} size="md" />
            <div className="text-lg font-bold text-gray-800 dark:text-white mt-1">
              {Math.round(item.main.temp)}°C
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
              {item.weather[0].description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}