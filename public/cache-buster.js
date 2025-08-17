// Cache buster script
(function() {
  // Принудительно очищаем кэш при загрузке
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  
  // Добавляем timestamp к запросам для предотвращения кэширования
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && !url.includes('?') && !url.includes('cache-buster')) {
      url += (url.includes('?') ? '&' : '?') + 'cache-buster=' + Date.now();
    }
    return originalFetch(url, options);
  };
})();
