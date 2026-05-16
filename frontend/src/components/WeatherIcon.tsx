interface WeatherIconProps {
  iconCode: string;
  description: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function WeatherIcon({ iconCode, description, size = 'md' }: WeatherIconProps) {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
  return (
    <img 
      src={iconUrl} 
      alt={description}
      className={`${sizes[size]} object-contain`}
      loading="lazy"
    />
  );
}