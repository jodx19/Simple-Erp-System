const fs = require('fs');
const path = require('path');

// SVG favicon content
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" ry="20" fill="url(#bgGradient)"/>
  <rect x="2" y="2" width="96" height="96" rx="18" ry="18" fill="none" stroke="rgba(249,115,22,0.3)" stroke-width="2"/>
  <g transform="translate(20, 20)">
    <rect x="5" y="35" width="12" height="25" rx="3" fill="url(#iconGradient)"/>
    <rect x="22" y="20" width="12" height="40" rx