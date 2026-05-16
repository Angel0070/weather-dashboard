import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';

// Функция для получения координат города через Nominatim (OpenStreetMap)
const getCoordinates = async (city: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    );
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
};

// Получение описания погоды по коду
const getWeatherDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    0: 'Ясно',
    1: 'В основном ясно',
    2: 'Переменная облачность',
    3: 'Пасмурно',
    45: 'Туман',
    51: 'Морось',
    61: 'Дождь',
    71: 'Снег',
    80: 'Ливень',
  };
  return descriptions[code] || 'Облачно';
};

const getWeatherIcon = (code: number): string => {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45) return '🌫️';
  if (code >= 51 && code < 60) return '🌧️';
  if (code >= 61 && code < 70) return '🌧️';
  if (code >= 71 && code < 80) return '❄️';
  return '☁️';
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCity, setLastCity] = useState('Москва');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const savedCity = localStorage.getItem('lastCity');
    if (savedTheme) setTheme(savedTheme);
    if (savedCity) setLastCity(savedCity);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (lastCity) {
      fetchWeather(lastCity);
    }
  }, [lastCity]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchWeather = async (city: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = await getCoordinates(city);
      if (!coords) {
        throw new Error('Город не найден');
      }
      
      // Текущая погода
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weather_code,windspeed_10m&timezone=auto`
      );
      const weatherData = await weatherRes.json();
      
      setWeather({
        name: city,
        lat: coords.lat,
        lon: coords.lon,
        temp: Math.round(weatherData.current_weather.temperature),
        humidity: weatherData.hourly?.relative_humidity_2m?.[0] || 0,
        windSpeed: Math.round(weatherData.current_weather.windspeed),
        weatherCode: weatherData.current_weather.weathercode,
        description: getWeatherDescription(weatherData.current_weather.weathercode),
        icon: getWeatherIcon(weatherData.current_weather.weathercode),
      });
      
      // Прогноз
      const forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
      );
      const forecastData = await forecastRes.json();
      
      setForecast({
        days: forecastData.daily.time.map((time: string, idx: number) => ({
          date: time,
          dayName: new Date(time).toLocaleDateString('ru-RU', { weekday: 'short' }),
          tempMax: Math.round(forecastData.daily.temperature_2m_max[idx]),
          tempMin: Math.round(forecastData.daily.temperature_2m_min[idx]),
          icon: getWeatherIcon(forecastData.daily.weather_code[idx]),
          description: getWeatherDescription(forecastData.daily.weather_code[idx]),
        })),
      });
      
      setLastCity(city);
      localStorage.setItem('lastCity', city);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  // Определение местоположения пользователя
  const detectLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Ваш браузер не поддерживает геолокацию');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Обратный геокодинг — получаем название города по координатам
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ru`
          );
          const data = await response.json();
          
          let cityName = '';
          if (data.address?.city) cityName = data.address.city;
          else if (data.address?.town) cityName = data.address.town;
          else if (data.address?.village) cityName = data.address.village;
          else cityName = 'Москва';
          
          fetchWeather(cityName);
        } catch (err) {
          fetchWeather('Москва');
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setError('Не удалось определить ваше местоположение');
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-2">
            <div className="text-3xl md:text-4xl">🌤️</div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">Weather Dashboard</h1>
              <p className="text-blue-100 text-xs md:text-sm hidden sm:block">Погода в любой точке мира</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={detectLocation}
              className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur hover:bg-white/30 transition-all duration-200 text-white font-medium flex items-center gap-2"
              title="Определить мой город"
            >
              📍
            </button>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur hover:bg-white/30 transition-all duration-200 text-white font-medium flex items-center gap-2"
            >
              {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-8 md:mb-10">
          <SearchBar onSearch={fetchWeather} isLoading={loading} />
        </div>

        {/* Content */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center bg-white/20 backdrop-blur rounded-2xl p-8">
              <div className="text-5xl mb-4 animate-pulse">⏳</div>
              <p className="text-white text-lg">Загрузка данных...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 backdrop-blur border border-red-400 rounded-2xl p-6 text-center max-w-md mx-auto">
            <div className="text-4xl mb-3">🌍</div>
            <p className="text-white font-medium">{error}</p>
            <p className="text-white/70 text-sm mt-2">Попробуйте другой город</p>
          </div>
        )}

        {!loading && !error && weather && (
          <div className="space-y-6">
            {/* Current Weather Card */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 md:p-8 text-white shadow-2xl border border-white/30">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold drop-shadow">{weather.name}</h2>
                  <p className="text-blue-100 text-lg mt-1">
                    {weather.lat.toFixed(2)}° / {weather.lon.toFixed(2)}°
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-7xl md:text-8xl font-bold drop-shadow">{weather.temp}°C</div>
                  <div className="text-xl mt-2 capitalize flex items-center justify-center gap-2">
                    <span>{weather.icon}</span> {weather.description}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/30">
                <div className="text-center bg-white/10 rounded-xl py-3 px-2 backdrop-blur">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-sm text-blue-100">Влажность</div>
                  <div className="font-bold text-xl">{weather.humidity}%</div>
                </div>
                <div className="text-center bg-white/10 rounded-xl py-3 px-2 backdrop-blur">
                  <div className="text-2xl mb-1">🌬️</div>
                  <div className="text-sm text-blue-100">Ветер</div>
                  <div className="font-bold text-xl">{weather.windSpeed} м/с</div>
                </div>
                <div className="text-center bg-white/10 rounded-xl py-3 px-2 backdrop-blur col-span-2 md:col-span-1">
                  <div className="text-2xl mb-1">🌡️</div>
                  <div className="text-sm text-blue-100">Ощущается как</div>
                  <div className="font-bold text-xl">{weather.temp}°C</div>
                </div>
              </div>
            </div>
            
            {/* Forecast */}
            {forecast && (
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/30">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📅</span> Прогноз на 5 дней
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {forecast.days.map((day: any, idx: number) => (
                    <div key={idx} className="bg-white/10 rounded-xl p-3 text-center hover:bg-white/20 transition-all duration-200">
                      <div className="font-medium text-white">{day.dayName}</div>
                      <div className="text-3xl my-2">{day.icon}</div>
                      <div className="text-lg font-bold text-white">{day.tempMax}°</div>
                      <div className="text-sm text-blue-200">{day.tempMin}°</div>
                      <div className="text-xs text-blue-100 mt-1 truncate">{day.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !weather && (
          <div className="text-center py-20 bg-white/20 backdrop-blur rounded-2xl max-w-md mx-auto">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-white text-lg">Введите название города</p>
            <p className="text-white/70 text-sm mt-2">Чтобы увидеть погоду</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-white/50">
          Данные предоставлены Open-Meteo
        </footer>
      </div>
    </div>
  );
}

export default App;