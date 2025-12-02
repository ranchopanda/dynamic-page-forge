import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTopOnRoute: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTopOnRoute;
