(() => {
  'use strict';

  const config = window.SITE_CONFIG || {};
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      menuToggle.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
      nav.classList.toggle('is-open', !expanded);
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Открыть меню');
        nav.classList.remove('is-open');
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Открыть меню');
        nav.classList.remove('is-open');
        menuToggle.focus();
      }
    });
  }

  const contactLinks = document.querySelector('[data-contact-links]');
  const phoneLink = document.querySelector('[data-phone-link]');
  const phoneLabel = document.querySelector('[data-phone-label]');
  const emailLink = document.querySelector('[data-email-link]');
  const emailLabel = document.querySelector('[data-email-label]');
  const phoneRaw = typeof config.phone === 'string' ? config.phone.trim() : '';
  const email = typeof config.email === 'string' ? config.email.trim() : '';
  const phoneDigits = phoneRaw.replace(/[^+\d]/g, '');

  if (phoneDigits && phoneLink && phoneLabel) {
    phoneLink.href = `tel:${phoneDigits}`;
    phoneLabel.textContent = phoneRaw;
    phoneLink.hidden = false;
  } else if (phoneLink) {
    phoneLink.hidden = true;
  }
  if (email && emailLink && emailLabel) {
    emailLink.href = `mailto:${email}`;
    emailLabel.textContent = email;
    emailLink.hidden = false;
  } else if (emailLink) {
    emailLink.hidden = true;
  }
  if (contactLinks) contactLinks.hidden = !(phoneDigits || email);

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const message = String(data.get('message') || '').trim();

      if (!name || !phone) {
        status.textContent = 'Укажите имя и телефон, чтобы подготовить обращение.';
        return;
      }
      if (!email) {
        status.textContent = 'Обращение не отправлено: сначала укажите реальный адрес центра в файле site-config.js. Введённые данные останутся только в этой форме.';
        return;
      }
      const subject = encodeURIComponent(`Обращение с сайта — ${name}`);
      const body = encodeURIComponent(`Имя: ${name}\nТелефон: ${phone}\n\nВопрос:\n${message || 'Пока без деталей.'}`);
      status.textContent = 'Откроется ваше почтовое приложение с подготовленным письмом. Нажмите «Отправить» в почте, чтобы передать обращение.';
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }
})();
