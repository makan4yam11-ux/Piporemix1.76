import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function ScrollbarManager() {
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('mousemove', handleScroll, { capture: true, passive: true });
    window.addEventListener('touchstart', handleScroll, { capture: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('mousemove', handleScroll, { capture: true });
      window.removeEventListener('touchstart', handleScroll, { capture: true });
      clearTimeout(timeout);
    };
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <>
    <ScrollbarManager />
    <App />
  </>
);
