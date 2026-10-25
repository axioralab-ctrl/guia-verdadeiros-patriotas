const CHECKOUT_URL = "PASTE_CHECKOUT_URL_HERE";

document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});

function openModal(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
});
document.querySelectorAll('#certificate-open, .certificate-preview').forEach(button => {
  button.addEventListener('click', () => openModal(document.querySelector('#certificate-modal')));
});
document.querySelectorAll('[data-checkout]').forEach(link => {
  if (CHECKOUT_URL !== 'PASTE_CHECKOUT_URL_HERE') {
    link.href = CHECKOUT_URL;
    link.rel = 'noopener';
  } else {
    link.addEventListener('click', event => {
      event.preventDefault();
      openModal(document.querySelector('#checkout-modal'));
    });
  }
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach(link => {
        const sectionHash = entry.target.id === 'ebook' ? '#inicio' : '#' + entry.target.id;
        const current = link.hash === sectionHash;
        link.classList.toggle('active', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -45% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));

const motionAllowed = window.matchMedia('(prefers-reduced-motion: no-preference)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
const hero = document.querySelector('.hero');
let targetX = 0, targetY = 0, currentX = 0, currentY = 0, frame = 0;
function animateDepth() {
  currentX += (targetX - currentX) * 0.065;
  currentY += (targetY - currentY) * 0.065;
  hero.style.setProperty('--pointer-x', currentX.toFixed(2) + 'px');
  hero.style.setProperty('--pointer-y', currentY.toFixed(2) + 'px');
  if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.03) frame = requestAnimationFrame(animateDepth);
  else frame = 0;
}
function requestDepth() { if (!frame) frame = requestAnimationFrame(animateDepth); }
hero.addEventListener('pointermove', event => {
  if (!motionAllowed.matches || !finePointer.matches) return;
  const bounds = hero.getBoundingClientRect();
  targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 8;
  targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 6;
  requestDepth();
});
hero.addEventListener('pointerleave', () => { targetX = targetY = 0; requestDepth(); });
let scrollFrame = false;
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = true;
  requestAnimationFrame(() => {
    document.querySelector('.header').classList.toggle('scrolled', window.scrollY > 24);
    const offset = motionAllowed.matches && finePointer.matches ? Math.min(window.scrollY * .035, 18) : 0;
    hero.style.setProperty('--scroll-y', offset + 'px');
    scrollFrame = false;
  });
}, { passive: true });
