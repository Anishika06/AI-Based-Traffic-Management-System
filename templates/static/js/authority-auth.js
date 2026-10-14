// Authority session preservation helper for cross-origin iframe environments
(function() {
  try {
    const isLogout = window.location.pathname === '/logout';
    if (isLogout) {
      sessionStorage.removeItem('smart_roads_auth_token');
      localStorage.removeItem('smart_roads_auth_token');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    let token = params.get('auth') || params.get('auth_token');

    if (token) {
      sessionStorage.setItem('smart_roads_auth_token', token);
      localStorage.setItem('smart_roads_auth_token', token);
    } else {
      token = sessionStorage.getItem('smart_roads_auth_token') || localStorage.getItem('smart_roads_auth_token');
    }

    // If on authority login page and we already have a saved token, check if we can continue
    const isLoginPage = window.location.pathname === '/authority-login' || window.location.pathname === '/admin-login';
    const hasLoggedOutParam = params.get('logged_out') === '1';
    if (isLoginPage && hasLoggedOutParam) {
      sessionStorage.removeItem('smart_roads_auth_token');
      localStorage.removeItem('smart_roads_auth_token');
      token = null;
    }

    if (token && !isLoginPage) {
      function attachAuth() {
        // Attach to anchor links
        document.querySelectorAll('a[href]').forEach(function(a) {
          const href = a.getAttribute('href');
          if (
            href &&
            href.startsWith('/') &&
            !href.startsWith('/static') &&
            !href.startsWith('/logout') &&
            !href.includes('auth=')
          ) {
            const sep = href.includes('?') ? '&' : '?';
            a.setAttribute('href', href + sep + 'auth=' + encodeURIComponent(token));
          }
        });

        // Attach to forms
        document.querySelectorAll('form').forEach(function(f) {
          const action = f.getAttribute('action') || '';
          if (action && !action.includes('auth=')) {
            const sep = action.includes('?') ? '&' : '?';
            f.setAttribute('action', action + sep + 'auth=' + encodeURIComponent(token));
          }
          if (!f.querySelector('input[name="auth"]')) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'auth';
            input.value = token;
            f.appendChild(input);
          }
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachAuth);
      } else {
        attachAuth();
      }
    }
  } catch (err) {
    console.warn('Authority auth helper note:', err);
  }
})();
