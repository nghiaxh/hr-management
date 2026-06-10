import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export function RouteLoadingIndicator() {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      const timer = setTimeout(() => setShow(true), 200);
      const hideTimer = setTimeout(() => setShow(false), 600);
      return () => { clearTimeout(timer); clearTimeout(hideTimer); };
    }
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[200] h-0.5 bg-primary origin-left"
        />
      )}
    </AnimatePresence>
  );
}
