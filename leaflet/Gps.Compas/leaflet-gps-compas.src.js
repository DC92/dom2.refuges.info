/* global L */

/******************************************************
 * Transform the GPS marker into a orientable compass *
 * that indicates the direction you are looking.      *
 ******************************************************/
const scriptDir = document.currentScript.src.replace(/[^\/]*$/u, ''),
  iconMarker = L.icon({ // Icône sans orientation
    iconUrl: scriptDir + 'Gps.Compas/gps-marker.svg',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
  iconCompas = L.icon({ // Icône orientée
    iconUrl: scriptDir + 'gps-compas.svg',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
  gpsMarker = L.marker([0, 0], {
    icon: iconMarker,
  });

let gpsAngle = 0;

window.addEventListener('deviceorientationabsolute', (evt) => {
  if (gpsMarker._icon && evt.alpha) { // If gps enabled
    gpsMarker.setIcon(iconCompas);
    gpsMarker._icon.style.transformOrigin = 'center';

    gpsAngle = 45 - parseInt(evt.alpha, 10);
    gpsMarker._icon.style.transform = gpsMarker._icon.style.transform.replace(/[0-9]*deg/u, gpsAngle + 'deg');
  }
});

// Evite à la direction du marqueur d'être perturbée par le zoom
const protoSetPos = L.Marker.prototype._setPos;
L.Marker.include({
  _setPos: function(pos) {
    protoSetPos.call(this, pos);
    this._icon.style.transform += ' rotateZ(' + gpsAngle + 'deg)';
  },
});

/* eslint-disable-next-line no-unused-vars */
class GpsCompas extends L.Control.Gps {
  constructor(options) {
    super({
      marker: gpsMarker,
      ...options,
    });
  }
};