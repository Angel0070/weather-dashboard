import { useState, FormEvent, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

interface CitySuggestion {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Функция поиска городов через API
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      // Open-Meteo Geocoding API — бесплатно, без ключа, работает в РФ
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=ru&format=json`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const cities: CitySuggestion[] = data.results.map((item: any) => ({
          name: item.name,
          country: item.country,
          admin1: item.admin1,
          latitude: item.latitude,
          longitude: item.longitude,
        }));
        setSuggestions(cities);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce для поиска (ждём паузу в вводе)
  const handleInputChange = (value: string) => {
    setInput(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchCities(value);
    }, 400);
  };

  const handleSuggestionClick = (city: CitySuggestion) => {
    setInput(city.name);
    setShowSuggestions(false);
    onSearch(city.name);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Введите город (например, Москва, Владивосток)"
          className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || isSearching}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-all duration-200"
        >
          {isLoading ? '⏳' : '🔍 Поиск'}
        </button>
      </form>

      {/* Автокомплит выпадающий список */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
          {suggestions.map((city, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(city)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl text-gray-700 dark:text-gray-300"
            >
              <div>
                <span className="mr-2">📍</span> 
                <span className="font-medium">{city.name}</span>
                {city.admin1 && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                    , {city.admin1}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 ml-6">
                {city.country}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Индикатор поиска */}
      {isSearching && input.length >= 2 && (
        <div className="absolute right-14 top-3.5">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}