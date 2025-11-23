const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTicketEmail(email, orderData) {
  console.log('📧 Отправка email через Resend на:', email);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Световой год <onboarding@resend.dev>',
      to: [email],
      subject: `🎸 Билет на концерт Световой год - Заказ #${orderData.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎸 Ваш билет подтвержден!</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Детали концерта:</h3>
            <p><strong>🎫 Заказ:</strong> #${orderData.id}</p>
            <p><strong>🎸 Группа:</strong> Световой год</p>
            <p><strong>🏙️ Город:</strong> ${orderData.city}</p>
            <p><strong>🏢 Место:</strong> ${orderData.venue}</p>
            <p><strong>📅 Дата:</strong> ${orderData.date}</p>
            <p><strong>⏰ Время:</strong> ${orderData.time}</p>
            <p><strong>💰 Цена:</strong> ${orderData.price} руб.</p>
            <p><strong>👤 Имя:</strong> ${orderData.full_name}</p>
          </div>
          <p style="color: #666;">Сохраните это письмо - оно является вашим билетом!</p>
          <hr>
          <p style="font-size: 12px; color: #999;">🐧 I'm use arch, btw!</p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Ошибка Resend:', error);
    } else {
      console.log('✅ Email отправлен через Resend!', data.id);
    }
  } catch (error) {
    console.error('❌ Ошибка отправки:', error);
  }
}

module.exports = { sendTicketEmail };