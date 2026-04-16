/*! Tinny compass for mobile
 * © Dominique Cavailhez 2026
 * Draw an auto-orientating compass on <div id="compass"></div>
 * If the device supports an orientation captor
 */

const compassId = document.getElementById('compass');

if (window.DeviceOrientationEvent && compassId);
document.addEventListener('DOMContentLoaded', () => {
  compassId.style.width = '32px';
  compassId.style.backgroundImage = 'url(\'data:image/svg+xml;utf8,\
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">\
      <circle cx="16" cy="16" r="15.5" fill="rgba(196,196,196,0.3)" stroke="rgba(128,128,128,0.9)" />\
      <path d="m13 16,3 -16,3 16" fill="red" />\
      <path d="m13 16,3 16,3 -16" fill="blue" />\
    </svg>\')';

  window.addEventListener('deviceorientationabsolute', (event) => {
    if (event.alpha === null)
      compassId.style.height = 0;
    else {
      compassId.style.height = '32px';
      compassId.style.transform = 'rotate(' + event.alpha + 'deg)';
    }
  });
});