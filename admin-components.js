const { useState, useEffect } = React;

// Главный компонент админ-панели
function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const token = localStorage.getItem('adminToken');
    if (token === 'admin_logged_in') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (success) => {
    if (success) {
      localStorage.setItem('adminToken', 'admin_logged_in');
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return React.createElement('div', {
      style: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#f00'
      }
    }, '🎸 Загрузка...');
  }

  if (!isAuthenticated) {
    return React.createElement(LoginForm, { onLogin: handleLogin });
  }

  return React.createElement(AdminDashboard, { onLogout: handleLogout });
}

// Форма авторизации
function LoginForm({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Простая проверка (в реальном проекте - через API)
    if (credentials.username === 'admin' && credentials.password === 'rock2025') {
      setTimeout(() => {
        onLogin(true);
        setIsSubmitting(false);
      }, 500);
    } else {
      setTimeout(() => {
        setError('Неверный логин или пароль');
        setIsSubmitting(false);
      }, 500);
    }
  };

  return React.createElement('div', { className: 'admin-container' },
    React.createElement('form', { 
      className: 'login-form',
      onSubmit: handleSubmit
    },
      React.createElement('h2', null, '🎸 Вход в админ-панель'),
      
      error && React.createElement('div', {
        style: { 
          background: '#f00', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          textAlign: 'center'
        }
      }, error),

      React.createElement('div', { className: 'form-group' },
        React.createElement('input', {
          type: 'text',
          placeholder: 'Логин',
          value: credentials.username,
          onChange: (e) => setCredentials(prev => ({ ...prev, username: e.target.value })),
          required: true
        })
      ),

      React.createElement('div', { className: 'form-group' },
        React.createElement('input', {
          type: 'password',
          placeholder: 'Пароль',
          value: credentials.password,
          onChange: (e) => setCredentials(prev => ({ ...prev, password: e.target.value })),
          required: true
        })
      ),

      React.createElement('button', {
        type: 'submit',
        className: 'btn btn-full',
        disabled: isSubmitting
      }, isSubmitting ? '⏳ Вход...' : '🔐 Войти'),

      React.createElement('div', {
        style: { 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#666' 
        }
      }, 'Логин: admin, Пароль: rock2025')
    )
  );
}

// Главная панель администратора
function AdminDashboard({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  const loadOrders = async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/admin/orders' : '/api/admin/orders';
      const response = await fetch(apiUrl);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    }
  };

  const loadStats = async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/admin/stats' : '/api/admin/stats';
      const response = await fetch(apiUrl);
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/admin/orders' : '/api/admin/orders';
      await fetch(`${apiUrl}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadOrders(); // Перезагружаем список
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return React.createElement('div', {
      style: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#f00'
      }
    }, '🎸 Загрузка данных...');
  }

  return React.createElement('div', { className: 'admin-container' },
    // Кнопка выхода
    React.createElement('button', {
      className: 'btn logout-btn',
      onClick: onLogout
    }, '🚪 Выйти'),

    // Заголовок
    React.createElement('div', { className: 'admin-header' },
      React.createElement('h1', null, '🎸 Админ-панель "Световой год"'),
      React.createElement('p', null, 'Управление заказами билетов')
    ),

    // Статистика
    React.createElement('div', { className: 'stats-grid' },
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-number' }, stats.totalOrders || 0),
        React.createElement('div', { className: 'stat-label' }, 'Всего заказов')
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-number' }, stats.pendingOrders || 0),
        React.createElement('div', { className: 'stat-label' }, 'Ожидают обработки')
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-number' }, stats.confirmedOrders || 0),
        React.createElement('div', { className: 'stat-label' }, 'Подтверждено')
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-number' }, `${stats.totalRevenue || 0}₽`),
        React.createElement('div', { className: 'stat-label' }, 'Общая выручка')
      )
    ),

    // Заказы
    React.createElement('div', { className: 'orders-section' },
      React.createElement('div', { className: 'orders-header' },
        React.createElement('h2', null, '📋 Заказы билетов'),
        React.createElement('select', {
          className: 'filter-select',
          value: filter,
          onChange: (e) => setFilter(e.target.value)
        },
          React.createElement('option', { value: 'all' }, 'Все заказы'),
          React.createElement('option', { value: 'pending' }, 'Ожидают'),
          React.createElement('option', { value: 'confirmed' }, 'Подтверждены'),
          React.createElement('option', { value: 'cancelled' }, 'Отменены')
        )
      ),

      React.createElement('table', { className: 'orders-table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'ID'),
            React.createElement('th', null, 'Дата'),
            React.createElement('th', null, 'ФИО'),
            React.createElement('th', null, 'Email'),
            React.createElement('th', null, 'Телефон'),
            React.createElement('th', null, 'Концерт'),
            React.createElement('th', null, 'Статус'),
            React.createElement('th', null, 'Действия')
          )
        ),
        React.createElement('tbody', null,
          filteredOrders.map(order =>
            React.createElement('tr', { key: order.id },
              React.createElement('td', null, order.id),
              React.createElement('td', null, new Date(order.created_at).toLocaleDateString('ru-RU')),
              React.createElement('td', null, order.full_name),
              React.createElement('td', null, order.email),
              React.createElement('td', null, order.phone),
              React.createElement('td', null, `${order.city} - ${order.venue}`),
              React.createElement('td', null,
                React.createElement('span', {
                  className: `status-badge status-${order.status}`
                }, order.status === 'pending' ? 'Ожидает' : 
                   order.status === 'confirmed' ? 'Подтвержден' : 'Отменен')
              ),
              React.createElement('td', null,
                order.status === 'pending' && [
                  React.createElement('button', {
                    key: 'confirm',
                    className: 'btn btn-small',
                    style: { background: '#00ff00', color: 'black' },
                    onClick: () => updateOrderStatus(order.id, 'confirmed')
                  }, '✅'),
                  React.createElement('button', {
                    key: 'cancel',
                    className: 'btn btn-small',
                    style: { background: '#666' },
                    onClick: () => updateOrderStatus(order.id, 'cancelled')
                  }, '❌')
                ]
              )
            )
          )
        )
      )
    )
  );
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const adminApp = document.getElementById('admin-app');
  if (adminApp) {
    ReactDOM.render(React.createElement(AdminApp), adminApp);
  }
});