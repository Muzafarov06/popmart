// src/hooks/useRefreshOnFocus.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Вызывает callback каждый раз, когда меняется route (pathname).
 * Полезно для обновления данных при возврате на страницу.
 *
 * Пример:
 *   const { refresh } = useCollections();
 *   useRefreshOnRoute(refresh);
 */
export function useRefreshOnRoute(callback) {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    // На первом рендере не вызываем — данные и так загружаются
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}