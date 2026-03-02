import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const baseUrl = import.meta.env.BASE_URL;
document.documentElement.style.setProperty('--bg-image', `url('${baseUrl}images/dojo.webp')`);
createRoot(document.getElementById('root')!).render(<App />);
