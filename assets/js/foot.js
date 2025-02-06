export function setupFooter() {
  const portfolioPages = ['/street', '/abstract', '/architecture', '/landscape'];

  function toggleFooterVisibility() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    if (portfolioPages.includes(window.location.pathname.toLowerCase())) {
      footer.classList.add('footer-hidden');
      footer.classList.remove('footer-visible');
    } else {
      footer.classList.add('footer-visible');
      footer.classList.remove('footer-hidden');
    }
  }

  window.addEventListener('popstate', toggleFooterVisibility);
  document.addEventListener('DOMContentLoaded', toggleFooterVisibility);
}
