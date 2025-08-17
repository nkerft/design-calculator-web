// Cache buster script - simplified version
(function() {
  // Только очищаем кэш, не блокируем загрузку
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        if (name.includes('design-calculator')) {
          caches.delete(name);
        }
      }
    });
  }
})();
