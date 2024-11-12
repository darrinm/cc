import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Extract the pathname from the URL
let pathname = window.location.pathname;

if (pathname[0] === '/') {
  pathname = pathname.slice(1);
}
const segments = pathname.split('/');
if (segments[0] === 'cc') {
  segments.shift();
}
const documentName = segments.shift();
const elementName = segments.shift();
console.log('path:', pathname, ', document:', documentName, ', element:', elementName);

// For POC. If we use it we'll license it.
removeWatermark();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App documentName={documentName} element={elementName} />
  </React.StrictMode>,
);

function removeWatermark() {
  requestAnimationFrame(() => {
    const watermark = document.getElementsByClassName('tl-watermark_SEE-LICENSE');
    if (watermark.length > 0 && watermark[0].parentElement) {
      watermark[0].remove();
    }
    requestAnimationFrame(removeWatermark);
  });
}
