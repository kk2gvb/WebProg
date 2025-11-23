#!/bin/bash

# 🎸 Скрипт первоначальной настройки сервера для сайта "Световой год"
# Запускать ОДИН РАЗ на чистом сервере

set -e

echo "🎸 Первоначальная настройка сервера для 'Световой год'..."

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Обновляем систему
echo "🔄 Обновляем систему..."
sudo apt update && sudo apt upgrade -y
print_status "Система обновлена"

# 2. Устанавливаем необходимые пакеты
echo "📦 Устанавливаем пакеты..."
sudo apt install -y nginx nodejs npm git curl
print_status "Пакеты установлены"

# 3. Устанавливаем PM2 глобально
echo "🚀 Устанавливаем PM2..."
sudo npm install -g pm2
print_status "PM2 установлен"

# 4. Создаем директорию для сайта
echo "📁 Создаем директории..."
sudo mkdir -p /var/www/rock.brewbug.su
sudo chown -R www-data:www-data /var/www/rock.brewbug.su
print_status "Директории созданы"

# 5. Клонируем репозиторий (нужно будет ввести данные Git)
echo "📥 Клонируем репозиторий..."
if [ ! -d "$HOME/WebProg" ]; then
    print_warning "Введите URL вашего Git репозитория:"
    read -p "Git URL: " GIT_URL
    git clone "$GIT_URL" "$HOME/WebProg"
    print_status "Репозиторий клонирован"
else
    print_warning "Репозиторий уже существует"
fi

# 6. Переходим в директорию проекта
cd "$HOME/WebProg"

# 7. Устанавливаем зависимости
echo "📦 Устанавливаем зависимости Node.js..."
npm install --production
print_status "Зависимости установлены"

# 8. Создаем конфиг nginx
echo "🌐 Настраиваем nginx..."
sudo tee /etc/nginx/sites-available/rock.brewbug.su > /dev/null << 'EOF'
server {
    listen 80;
    server_name rock.brewbug.su www.rock.brewbug.su _;
    
    root /var/www/rock.brewbug.su;
    index index.html;

    # Статические файлы
    location / {
        try_files $uri $uri/ =404;
    }

    # API проксирование на Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Кеширование статики
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
}
EOF

# 9. Активируем сайт
sudo ln -sf /etc/nginx/sites-available/rock.brewbug.su /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 10. Проверяем и перезапускаем nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
print_status "Nginx настроен"

# 11. Делаем скрипты исполняемыми
chmod +x deploy.sh
chmod +x first-deploy.sh
print_status "Скрипты настроены"

# 12. Запускаем первый деплой
echo "🚀 Запускаем первый деплой..."
./deploy.sh

echo ""
echo "🎉 Первоначальная настройка завершена!"
echo ""
echo "📋 Полезные команды:"
echo "  ./deploy.sh          - обновить сайт"
echo "  pm2 logs             - посмотреть логи"
echo "  pm2 monit            - мониторинг"
echo "  sudo systemctl status nginx - статус nginx"
echo ""
echo "🌐 IP адрес сервера: $(hostname -I | awk '{print $1}')"