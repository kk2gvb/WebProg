const { useState, useEffect } = React;

// Простой React слайдер без JSX
function AdvancedSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const slides = [
    { img: 'concert1.jpg', title: 'Концерт в Москве' },
    { img: 'concert2.jpg', title: 'Фестиваль Rock' },
    { img: 'concert1.jpg', title: 'Студийная запись' },
    { img: 'concert2.jpg', title: 'Акустический сет' }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  return React.createElement('div', { className: 'react-slider' },
    // Кнопка паузы
    React.createElement('div', { className: 'slider-controls' },
      React.createElement('button', {
        onClick: () => setIsPlaying(!isPlaying),
        className: 'play-pause',
        style: { 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          zIndex: 10,
          background: 'rgba(255,0,0,0.8)',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: 'pointer'
        }
      }, isPlaying ? 'ПАУЗА' : 'ПЛЕЙ')
    ),
    
    // Слайды
    React.createElement('div', { 
      style: { 
        position: 'relative', 
        height: '400px', 
        overflow: 'hidden',
        border: '3px solid #f00'
      } 
    },
      slides.map((slide, index) =>
        React.createElement('div', {
          key: index,
          style: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 0.5s ease',
            background: `url(assets/${slide.img}) center/cover`
          }
        },
          React.createElement('div', {
            style: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '20px',
              textAlign: 'center'
            }
          },
            React.createElement('h3', { 
              style: { color: '#f00', margin: 0 } 
            }, slide.title)
          )
        )
      )
    ),
    
    // Точки навигации
    React.createElement('div', { 
      style: { 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        padding: '20px',
        background: '#000'
      } 
    },
      slides.map((_, index) =>
        React.createElement('button', {
          key: index,
          onClick: () => setCurrentSlide(index),
          style: {
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            border: '2px solid #f00',
            background: index === currentSlide ? '#f00' : 'transparent',
            cursor: 'pointer'
          }
        })
      )
    )
  );
}

// 2. Форма заказа билетов
function SmartContactForm() {
  const [formData, setFormData] = useState({ 
    concert: '', 
    fullName: '', 
    email: '', 
    phone: '' 
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const concerts = [
    { id: 1, name: '15 МАР 2026 - Москва, Клуб "Космос"', price: 1500 },
    { id: 2, name: '22 МАР 2026 - Санкт-Петербург, Клуб "Орбита"', price: 1800 },
    { id: 3, name: '05 АПР 2026 - Екатеринбург, Дворец молодежи', price: 1200 }
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Неверный email';
      case 'phone':
        return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(value) ? '' : 'Неверный телефон';
      case 'fullName':
        return value.length >= 2 ? '' : 'ФИО слишком короткое';
      case 'concert':
        return value ? '' : 'Выберите концерт';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Валидация в реальном времени
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем все поля
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Отправка на сервер
    try {
      const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/tickets' : '/api/tickets';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          concert_id: parseInt(formData.concert),
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({ concert: '', fullName: '', email: '', phone: '' });
        console.log('Заказ создан:', result);
        
        // Обновляем данные о концертах на странице туров
        window.dispatchEvent(new CustomEvent('ticketOrdered'));
      } else {
        setIsSubmitting(false);
        alert('Ошибка: ' + result.error);
      }
    } catch (error) {
      setIsSubmitting(false);
      alert('Ошибка сети: ' + error.message);
      console.error('Ошибка:', error);
    }
  };

  if (isSuccess) {
    return React.createElement('div', {
      style: {
        textAlign: 'center',
        padding: '1rem'
      }
    },
      React.createElement('div', {
        style: {
          background: '#f00',
          color: 'white',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1rem'
        }
      }, '✅ Заказ принят!'),
      React.createElement('p', { 
        style: { color: '#fff', marginBottom: '1rem', fontSize: '16px' } 
      }, 'Для продолжения оплаты отсканируйте QR-код и следуйте инструкциям:'),
      React.createElement('div', {
        style: {
          width: '150px',
          height: '150px',
          background: '#fff',
          margin: '0 auto 1rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          fontSize: '12px',
          color: '#000',
          textAlign: 'center'
        }
      }, 'QR-КОД\nДЛЯ ОПЛАТЫ'),
      React.createElement('a', {
        href: 'https://matrix.brewbug.su',
        target: '_blank',
        style: {
          display: 'block',
          background: '#f00',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: 'bold',
          margin: '0 auto',
          width: 'fit-content'
        }
      }, '💳 Перейти к оплате')
    );
  }

  return React.createElement('form', { 
    onSubmit: handleSubmit, 
    style: { 
      width: '100%'
    }
  },
    // Выбор концерта
    React.createElement('div', { style: { marginBottom: '1rem' } },
      React.createElement('select', {
        name: 'concert',
        value: formData.concert,
        onChange: handleChange,
        style: {
          width: '100%',
          padding: '12px',
          border: `2px solid ${errors.concert ? '#f00' : '#666'}`,
          borderRadius: '5px',
          background: '#333',
          color: 'white',
          fontSize: '16px'
        }
      },
        React.createElement('option', { value: '' }, 'Выберите концерт *'),
        concerts.map(concert => 
          React.createElement('option', { 
            key: concert.id, 
            value: concert.id 
          }, `${concert.name} - ${concert.price}₽`)
        )
      ),
      errors.concert && React.createElement('div', { 
        style: { color: '#f00', fontSize: '14px', marginTop: '5px' } 
      }, errors.concert)
    ),
    
    // Поле ФИО
    React.createElement('div', { style: { marginBottom: '1rem' } },
      React.createElement('input', {
        type: 'text',
        name: 'fullName',
        placeholder: 'ФИО *',
        value: formData.fullName,
        onChange: handleChange,
        style: {
          width: '100%',
          padding: '12px',
          border: `2px solid ${errors.fullName ? '#f00' : '#666'}`,
          borderRadius: '5px',
          background: '#333',
          color: 'white',
          fontSize: '16px'
        }
      }),
      errors.fullName && React.createElement('div', { 
        style: { color: '#f00', fontSize: '14px', marginTop: '5px' } 
      }, errors.fullName)
    ),
    
    // Поле email
    React.createElement('div', { style: { marginBottom: '1rem' } },
      React.createElement('input', {
        type: 'email',
        name: 'email',
        placeholder: 'Email *',
        value: formData.email,
        onChange: handleChange,
        style: {
          width: '100%',
          padding: '12px',
          border: `2px solid ${errors.email ? '#f00' : '#666'}`,
          borderRadius: '5px',
          background: '#333',
          color: 'white',
          fontSize: '16px'
        }
      }),
      errors.email && React.createElement('div', { 
        style: { color: '#f00', fontSize: '14px', marginTop: '5px' } 
      }, errors.email)
    ),
    
    // Поле телефона
    React.createElement('div', { style: { marginBottom: '1rem' } },
      React.createElement('input', {
        type: 'tel',
        name: 'phone',
        placeholder: 'Телефон *',
        value: formData.phone,
        onChange: handleChange,
        style: {
          width: '100%',
          padding: '12px',
          border: `2px solid ${errors.phone ? '#f00' : '#666'}`,
          borderRadius: '5px',
          background: '#333',
          color: 'white',
          fontSize: '16px'
        }
      }),
      errors.phone && React.createElement('div', { 
        style: { color: '#f00', fontSize: '14px', marginTop: '5px' } 
      }, errors.phone)
    ),
    

    
    // Кнопка отправки
    React.createElement('button', {
      type: 'submit',
      disabled: isSubmitting,
      style: {
        width: '100%',
        padding: '15px',
        background: isSubmitting ? '#666' : '#f00',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s'
      }
    }, isSubmitting ? '⏳ Обработка заказа...' : '🎫 Заказать билет')
  );
}

// 3. Информационные карточки туров (без кнопок)
function InfoTourCards() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Функция загрузки данных
  const loadConcerts = () => {
    const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/concerts' : '/api/concerts';
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setTours(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки концертов:', error);
        setLoading(false);
      });
  };

  // Загружаем данные при монтировании
  useEffect(() => {
    loadConcerts();
    
    // Слушаем событие заказа билета
    const handleTicketOrdered = () => {
      console.log('Обновляем данные о концертах...');
      loadConcerts();
    };
    
    window.addEventListener('ticketOrdered', handleTicketOrdered);
    
    return () => {
      window.removeEventListener('ticketOrdered', handleTicketOrdered);
    };
  }, []);

  if (loading) {
    return React.createElement('div', {
      style: { textAlign: 'center', color: '#f00', fontSize: '18px', padding: '2rem' }
    }, '🎸 Загрузка концертов...');
  }

  const getTicketStatus = (tickets, maxTickets) => {
    const percentage = (tickets / maxTickets) * 100;
    if (percentage < 20) return { text: 'Мало билетов!', color: '#f00' };
    if (percentage < 50) return { text: 'Популярно', color: '#ff6600' };
    return { text: 'Есть билеты', color: '#00ff00' };
  };

  return React.createElement('div', { 
    style: { 
      display: 'grid', 
      gap: '2rem', 
      maxWidth: '1000px', 
      margin: '0 auto' 
    } 
  },
    tours.map(tour => {
      const status = getTicketStatus(tour.available_tickets, tour.max_tickets);
      
      return React.createElement('div', {
        key: tour.id,
        style: {
          background: 'linear-gradient(135deg, rgba(255,0,0,0.1), rgba(0,0,0,0.8))',
          border: '2px solid #f00',
          borderRadius: '15px',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }
      },
        // Статус билетов
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: status.color,
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        }, status.text),
        
        // Дата
        React.createElement('div', {
          style: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#f00',
            marginBottom: '1rem'
          }
        }, tour.date),
        
        // Город и место
        React.createElement('h3', {
          style: { color: 'white', marginBottom: '0.5rem' }
        }, tour.city),
        
        React.createElement('p', {
          style: { color: '#ccc', marginBottom: '1rem' }
        }, `${tour.venue} • ${tour.time}`),
        
        // Прогресс-бар билетов
        React.createElement('div', {
          style: {
            background: '#333',
            borderRadius: '10px',
            height: '8px',
            marginBottom: '1rem',
            overflow: 'hidden'
          }
        },
          React.createElement('div', {
            style: {
              background: status.color,
              height: '100%',
              width: `${(tour.available_tickets / tour.max_tickets) * 100}%`,
              transition: 'width 0.5s ease'
            }
          })
        ),
        
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        },
          React.createElement('div', null,
            React.createElement('div', {
              style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#f00' }
            }, `от ${tour.price} ₽`),
            React.createElement('div', {
              style: { fontSize: '14px', color: '#ccc' }
            }, `Осталось: ${tour.available_tickets} из ${tour.max_tickets}`)
          )
        )
      );
    })
  );
}

// 4. Живые карточки туров (с кнопками)
function LiveTourCards() {
  const [tours] = useState([
    {
      id: 1,
      date: '15 МАР 2026',
      city: 'Москва',
      venue: 'Клуб "Космос"',
      time: '20:00',
      price: 1500,
      tickets: 45,
      maxTickets: 200
    },
    {
      id: 2,
      date: '22 МАР 2026',
      city: 'Санкт-Петербург',
      venue: 'Клуб "Орбита"',
      time: '19:30',
      price: 1800,
      tickets: 12,
      maxTickets: 150
    },
    {
      id: 3,
      date: '05 АПР 2026',
      city: 'Екатеринбург',
      venue: 'Дворец молодежи',
      time: '20:00',
      price: 1200,
      tickets: 89,
      maxTickets: 300
    }
  ]);

  const getTicketStatus = (tickets, maxTickets) => {
    const percentage = (tickets / maxTickets) * 100;
    if (percentage < 20) return { text: 'Мало билетов!', color: '#f00' };
    if (percentage < 50) return { text: 'Популярно', color: '#ff6600' };
    return { text: 'Есть билеты', color: '#00ff00' };
  };

  return React.createElement('div', { 
    style: { 
      display: 'grid', 
      gap: '2rem', 
      maxWidth: '1000px', 
      margin: '0 auto' 
    } 
  },
    tours.map(tour => {
      const status = getTicketStatus(tour.tickets, tour.maxTickets);
      
      return React.createElement('div', {
        key: tour.id,
        style: {
          background: 'linear-gradient(135deg, rgba(255,0,0,0.1), rgba(0,0,0,0.8))',
          border: '2px solid #f00',
          borderRadius: '15px',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        },
        onMouseEnter: (e) => {
          e.target.style.transform = 'translateY(-10px)';
          e.target.style.boxShadow = '0 20px 40px rgba(255,0,0,0.3)';
        },
        onMouseLeave: (e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }
      },
        // Статус билетов
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: status.color,
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        }, status.text),
        
        // Дата
        React.createElement('div', {
          style: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#f00',
            marginBottom: '1rem'
          }
        }, tour.date),
        
        // Город и место
        React.createElement('h3', {
          style: { color: 'white', marginBottom: '0.5rem' }
        }, tour.city),
        
        React.createElement('p', {
          style: { color: '#ccc', marginBottom: '1rem' }
        }, `${tour.venue} • ${tour.time}`),
        
        // Прогресс-бар билетов
        React.createElement('div', {
          style: {
            background: '#333',
            borderRadius: '10px',
            height: '8px',
            marginBottom: '1rem',
            overflow: 'hidden'
          }
        },
          React.createElement('div', {
            style: {
              background: status.color,
              height: '100%',
              width: `${(tour.tickets / tour.maxTickets) * 100}%`,
              transition: 'width 0.5s ease'
            }
          })
        ),
        
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        },
          React.createElement('div', null,
            React.createElement('div', {
              style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#f00' }
            }, `от ${tour.price} ₽`),
            React.createElement('div', {
              style: { fontSize: '14px', color: '#ccc' }
            }, `Осталось: ${tour.tickets} из ${tour.maxTickets}`)
          ),
          
          React.createElement('button', {
            className: 'open-modal btn',
            onClick: () => {
              const modal = document.getElementById('modal');
              if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                document.querySelector('main').style.filter = 'blur(5px)';
              }
            },
            style: {
              background: '#f00',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            },
            onMouseEnter: (e) => {
              e.target.style.background = '#c00';
              e.target.style.transform = 'scale(1.05)';
            },
            onMouseLeave: (e) => {
              e.target.style.background = '#f00';
              e.target.style.transform = 'scale(1)';
            }
          }, '🎫 Купить')
        )
      );
    })
  );
}


// СТАРАЯ ИНИЦИАЛИЗАЦИЯ ЗАКОММЕНТИРОВАНА
/*
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const sliderContainer = document.getElementById('slider');
    if (sliderContainer && typeof React !== 'undefined') {
      sliderContainer.setAttribute('data-react', 'true');
      ReactDOM.render(React.createElement(AdvancedSlider), sliderContainer);
    }
    
    const modalForm = document.querySelector('.modal form');
    if (modalForm) {
      ReactDOM.render(React.createElement(SmartContactForm), modalForm.parentNode);
    }
    
    const toursContainer = document.querySelector('.tours-container');
    if (toursContainer) {
      ReactDOM.render(React.createElement(LiveTourCards), toursContainer);
    }
  }, 100);
});
*/
// НОВАЯ ИНИЦИАЛИЗАЦИЯ - исправлена для работы с модалкой
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Слайдер на главной
    const sliderContainer = document.getElementById('slider');
    if (sliderContainer && typeof React !== 'undefined') {
      sliderContainer.setAttribute('data-react', 'true');
      ReactDOM.render(React.createElement(AdvancedSlider), sliderContainer);
    }
    
    // Умная форма - заменяем только форму в модалке
    const modalForm = document.querySelector('.modal form');
    if (modalForm) {
      const formContainer = document.createElement('div');
      modalForm.parentNode.insertBefore(formContainer, modalForm);
      modalForm.remove();
      ReactDOM.render(React.createElement(SmartContactForm), formContainer);
    }
    
    // Карточки туров (с кнопками или без)
    const toursContainer = document.querySelector('.tours-container');
    if (toursContainer) {
      // На странице туров - без кнопок, на остальных - с кнопками
      const isTourPage = window.location.pathname.includes('tours.html');
      const component = isTourPage ? InfoTourCards : LiveTourCards;
      ReactDOM.render(React.createElement(component), toursContainer);
    }
  }, 100);
});