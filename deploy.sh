#!/bin/bash

# 🎸 Скрипт автоматического деплоя сайта группы "Световой год"
# Использование: ./deploy.sh

set -e  # Остановка при ошибке

echo "🎸 Начинаем деплой сайта 'Световой год'..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Конфигурация
REPO_DIR="$HOME/WebProg"
WEB_DIR="/var/www/rock.brewbug.su"
SERVICE_NAME="svetovoy-god"

# Функция для вывода статуса
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Обновляем код из Git
echo "📥 Получаем обновления из Git..."
cd "$REPO_DIR"
git fetch origin
git pull origin dev
print_status "Код обновлен"

# 2. Обновляем зависимости Node.js
echo "📦 Обновляем зависимости..."
npm install --production
print_status "Зависимости обновлены"

# 3. Исправляем URL в React компонентах для продакшена
echo "🔧 Настраиваем API URL для продакшена..."
sed -i "s|http://localhost:3000/api/|/api/|g" react-components.js
print_status "API URL настроен"

# 4. Копируем фронтенд файлы
echo "📂 Копируем файлы фронтенда..."
sudo cp -f *.html "$WEB_DIR/"
sudo cp -f *.css "$WEB_DIR/"
sudo cp -f *.js "$WEB_DIR/"

# Копируем папку assets если существует
if [ -d "assets" ]; then
    sudo cp -rf assets/ "$WEB_DIR/"
    print_status "Ассеты скопированы"
fi

# Устанавливаем права
sudo chown -R www-data:www-data "$WEB_DIR"
sudo chmod -R 755 "$WEB_DIR"
print_status "Фронтенд обновлен"

# 5. Перезапускаем бэкенд
echo "🔄 Перезапускаем бэкенд..."
if pm2 list | grep -q "$SERVICE_NAME"; then
    pm2 restart "$SERVICE_NAME"
    print_status "Бэкенд перезапущен"
else
    print_warning "Запускаем бэкенд впервые..."
    pm2 start server.js --name "$SERVICE_NAME"
    pm2 save
    pm2 startup
    print_status "Бэкенд запущен"
fi

# 6. Перезагружаем nginx
echo "🌐 Перезагружаем nginx..."
sudo nginx -t
sudo systemctl reload nginx
print_status "Nginx перезагружен"

# 7. Проверяем статус сервисов
echo "🔍 Проверяем статус сервисов..."
echo "Nginx:"
sudo systemctl is-active nginx && print_status "Nginx работает" || print_error "Nginx не работает"

echo "Node.js бэкенд:"
pm2 show "$SERVICE_NAME" > /dev/null 2>&1 && print_status "Бэкенд работает" || print_error "Бэкенд не работает"

# 8. Показываем логи
echo "📋 Последние логи бэкенда:"
pm2 logs "$SERVICE_NAME" --lines 5 --nostream

echo ""
echo "🎉 Деплой завершен!"
echo "🌐 Сайт доступен по адресу: http://$(hostname -I | awk '{print $1}')"
echo "📊 Мониторинг: pm2 monit"
echo "📋 Логи: pm2 logs $SERVICE_NAME"