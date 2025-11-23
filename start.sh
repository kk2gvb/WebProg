#!/bin/bash

echo "🎸 Запуск сервера группы Световой год..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js для запуска сервера."
    exit 1
fi

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

# Запускаем сервер
echo "🚀 Запускаем сервер на порту 3000..."
node server.js