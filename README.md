# 🌤️ Weather Dashboard

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite)](https://vitejs.dev/)

**Weather Dashboard** — современное погодное приложение с автокомплитом городов, геолокацией и тёмной темой.

🔗 **Демо:** *[будет после деплоя]*

---

## ✨ Функционал

- 🌍 **Поиск города** — автокомплит через Open-Meteo Geocoding API (все города мира)
- 📍 **Геолокация** — определение погоды по вашему местоположению
- 🌡️ **Текущая погода** — температура, влажность, ветер
- 📅 **Прогноз на 5 дней** — с иконками и описанием
- 🌙 **Тёмная тема** — переключается одной кнопкой
- 📱 **Адаптивный дизайн** — работает на телефонах и десктопе
- 💾 **LocalStorage** — сохраняет последний город и тему

---

## 🛠 Технологии

| Технология | Назначение |
|------------|------------|
| **React 18** | Библиотека для интерфейсов |
| **TypeScript** | Типизация и надёжность |
| **TailwindCSS** | Стилизация |
| **Vite** | Сборка проекта |
| **Open-Meteo API** | Погодные данные и геокодинг |
| **Nominatim API** | Обратный геокодинг |

---

## 🌐 API

Open-Meteo — бесплатный погодный API без ключа

Open-Meteo Geocoding — поиск городов по названию

Nominatim — определение города по координатам
---

## 🚀 Запуск локально

### Требования
- Node.js 18+
- npm

### Установка

```bash
# Клонируем репозиторий
git clone https://github.com/ТВОЙ_ЛОГИН/weather-dashboard.git
cd weather-dashboard/frontend

# Устанавливаем зависимости
npm install

# Запускаем dev-сервер
npm run dev