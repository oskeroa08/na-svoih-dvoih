(() => {
  'use strict';

  const config = window.SITE_CONFIG || {};
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');

  if (menuToggle && nav) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Открыть меню');
      nav.classList.remove('is-open');
    };
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      menuToggle.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
      nav.classList.toggle('is-open', !expanded);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  /* Контакты */
  const phoneRaw = str(config.phone);
  const phoneDigits = phoneRaw.replace(/[^+\d]/g, '');
  const email = str(config.email);
  const vk = str(config.vk);

  document.querySelectorAll('[data-phone-link]').forEach((link) => {
    if (phoneDigits) {
      link.href = `tel:${phoneDigits}`;
      const label = link.querySelector('[data-phone-label]');
      if (label) label.textContent = phoneRaw;
      link.hidden = false;
    } else {
      link.hidden = true;
    }
  });
  const emailLink = document.querySelector('[data-email-link]');
  if (emailLink) {
    if (email) {
      emailLink.href = `mailto:${email}`;
      const label = emailLink.querySelector('[data-email-label]');
      if (label) label.textContent = email;
      emailLink.hidden = false;
    } else {
      emailLink.hidden = true;
    }
  }
  const vkLink = document.querySelector('[data-vk-link]');
  if (vkLink) {
    if (/^https:\/\//.test(vk)) {
      vkLink.href = vk;
      vkLink.hidden = false;
    } else {
      vkLink.hidden = true;
    }
  }
  const contactLinks = document.querySelector('[data-contact-links]');
  if (contactLinks) contactLinks.hidden = !(phoneDigits || email || vk);

  /* Форма */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const disclaimer = document.getElementById('form-disclaimer');
  const endpoint = str(config.formEndpoint);

  if (disclaimer) {
    if (endpoint) {
      disclaimer.textContent = 'Мы свяжемся с вами по указанному номеру.';
      disclaimer.hidden = false;
    } else if (email) {
      disclaimer.textContent = 'Откроется ваша почтовая программа с готовым письмом — останется нажать «Отправить».';
      disclaimer.hidden = false;
    }
  }

  if (form && status) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const phone = String(data.get('phone') || '').trim();

      if (!name || !phone) {
        status.textContent = 'Укажите имя и телефон, чтобы мы могли связаться с вами.';
        return;
      }

      if (endpoint) {
        status.textContent = 'Отправляем…';
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ name, phone, source: 'сайт «На своих двоих»' })
          });
          if (!response.ok) throw new Error(String(response.status));
          form.reset();
          status.textContent = 'Спасибо! Мы получили заявку и скоро свяжемся с вами.';
        } catch (error) {
          status.textContent = phoneDigits
            ? `Не удалось отправить заявку. Позвоните нам: ${phoneRaw}.`
            : 'Не удалось отправить заявку. Попробуйте ещё раз чуть позже.';
        }
        return;
      }

      if (email) {
        const subject = encodeURIComponent(`Обращение с сайта — ${name}`);
        const body = encodeURIComponent(`Имя: ${name}\nТелефон: ${phone}`);
        status.textContent = 'Откроется ваша почтовая программа с готовым письмом. Нажмите «Отправить», чтобы передать обращение.';
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        return;
      }

      status.textContent = phoneDigits
        ? `Форма пока не подключена — заявка не отправлена. Позвоните нам: ${phoneRaw}.`
        : 'Форма пока не подключена — заявка не отправлена.';
    });
  }

  /* Видеоотзывы (показываются, только если указаны в site-config.js) */
  const videoGrid = document.querySelector('[data-videos]');
  const videos = Array.isArray(config.videos) ? config.videos : [];
  if (videoGrid && videos.length) {
    videos.forEach((item) => {
      const title = str(item && item.title) || 'Видеоотзыв';
      const wrap = document.createElement('figure');
      wrap.className = 'video-card';
      if (str(item.file)) {
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        video.src = item.file;
        video.setAttribute('aria-label', title);
        wrap.appendChild(video);
      } else if (/^https:\/\/(vk\.com|vk\.ru)\/video_ext\.php/.test(str(item.src))) {
        const frame = document.createElement('iframe');
        frame.src = item.src;
        frame.title = title;
        frame.loading = 'lazy';
        frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        frame.allowFullscreen = true;
        wrap.appendChild(frame);
      } else {
        return;
      }
      const caption = document.createElement('figcaption');
      caption.textContent = title;
      wrap.appendChild(caption);
      videoGrid.appendChild(wrap);
    });
    videoGrid.hidden = !videoGrid.children.length;
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
