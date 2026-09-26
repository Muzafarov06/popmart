// src/hooks/useRefreshOnFocus.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Вызывает callback каждый раз, когда меняется route (pathname).
 * Не сбрасывает кэш — только тихое обновление в фоне.
 */
export function useRefreshOnRoute(callback) {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}