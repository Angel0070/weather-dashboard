import type { WeatherData } from '../types';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherProps {
  data: WeatherData;
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{data.name}</h2>
          <p className="text-blue-100 mt-1">{data.sys.country}</p>
        </div>
        <WeatherIcon iconCode={data.weather[0].icon} description={data.weather[0].description} size="lg" />
      </div>
      
      <div className="mt-4">
        <div className="text-6xl font-bold">{temp}°C</div>
        <p className="text-blue-100 mt-1 capitalize">{data.weather[0].description}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-blue-400/30">
        <div className="text-center">
          <div className="text-blue-100 text-sm">🌡️ Ощущается</div>
          <div className="font-semibold">{feelsLike}°C</div>
        </div>
        <div className="text-center">
          <div className="text-blue-100 text-sm">💧 Влажность</div>
          <div className="font-semibold">{data.main.humidity}%</div>
        </div>
        <div className="text-center">
          <div className="text-blue-100 text-sm">🌬️ Ветер</div>
          <div className="font-semibold">{Math.round(data.wind.speed)} м/с</div>
        </div>
      </div>
    </div>
  );
}