/* Lobos — bascule de thème (cookie global). */
(function () {
  var COOKIE = 'lobos-theme';
  var root = document.documentElement;

  function setCookie(value) {
    document.cookie = COOKIE + '=' + value + '; path=/; max-age=' + 60 * 60 * 24 * 365 + '; samesite=lax';
  }
  function apply(theme) {
    root.dataset.theme = theme;
    setCookie(theme);
  }
  var burger = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('menu-mobile');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.hasAttribute('hidden');
      if (open) { menu.removeAttribute('hidden'); } else { menu.setAttribute('hidden', ''); }
      burger.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      apply(root.dataset.theme === 'light' ? 'dark' : 'light');
    });
  });

})();
