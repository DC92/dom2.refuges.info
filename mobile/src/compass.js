/*! Add an auto-orientating tinny compass to the Leaflet GPS control
 * If the device supports an orientation captor
 * © Dominique Cavailhez 2026
 */

/* global L */
/* eslint-disable-next-line no-unused-vars */
class MyLeafletGpsCompass extends L.Control.Gps {
  onAdd(map) {
    if (window.DeviceOrientationEvent)
      document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('deviceorientationabsolute', (event) => {
          if (event.alpha !== null && this._isActive)
            this._gpsMarker.style.transform = 'rotateZ(' + event.alpha + 'deg)';
        });
      });

    return super.onAdd(map);
  }
}