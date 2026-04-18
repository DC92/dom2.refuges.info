/*! Add an auto-orientating tinny compass to the Leaflet GPS control
 * If the device supports an orientation captor
 * © Dominique Cavailhez 2026
 */

/* global L */
/* eslint-disable-next-line no-unused-vars */
class MyLeafletGpsCompass extends L.Control.Gps {
  constructor(options) {
    const icon = L.icon({
        iconUrl: 'src/gpsmarker.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      marker = L.marker([0, 0], { //TODO move in class
        //rotationAngle: 30,
        icon: icon,
      });

    super({
      marker: marker,

      ...options,
    });
    //marker.options.rotationAngle=280;

    this.icon = icon;
    this.marker = marker;
  }

  onAdd(map) {
    if (window.DeviceOrientationEvent)
      document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('deviceorientationabsolute', (event) => {
          //TODO rotate marker following event.alpha
        });
      });

    return super.onAdd(map);
  }
}