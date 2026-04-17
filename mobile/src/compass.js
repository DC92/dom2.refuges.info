/*! Add an auto-orientating tinny compass to the Leaflet GPS control
 * If the device supports an orientation captor
 * © Dominique Cavailhez 2026
 */

/* global L */
/* eslint-disable-next-line no-unused-vars */
class MyLeafletGpsCompass extends L.Control.Gps {
  onAdd(map) {
    const containerEl = super.onAdd(map);

    if (window.DeviceOrientationEvent && containerEl)
      document.addEventListener('DOMContentLoaded', () => {
        this._compasEl = L.DomUtil.create('div', 'compass', containerEl);
        this._compasEl.style.display = 'none'; // At init
        this._compasEl.style.float = 'left';
        this._compasEl.style.width = '32px';
        this._compasEl.style.height = '32px';
        this._compasEl.style.backgroundImage = 'url(\'data:image/svg+xml;utf8,\
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">\
            <path d="m13 16,3 -16,3 16" fill="red" />\
            <path d="m13 16,3 16,3 -16" fill="blue" />\
          </svg>\')';
        //<circle cx="16" cy="16" r="15.5" fill="rgba(196,196,196,0.3)" stroke="rgba(128,128,128,0.9)" />\

        window.addEventListener('deviceorientationabsolute', (event) => {
          if (event.alpha !== null && this._isActive) {
            this._compasEl.style.display = 'block';
            this._compasEl.style.transform = 'rotate(' + event.alpha + 'deg)';
          }
        });
      });
    return containerEl;
  }

  deactivate(map) {
    this._compasEl.style.display = 'none';
    return super.deactivate(map);
  }
}