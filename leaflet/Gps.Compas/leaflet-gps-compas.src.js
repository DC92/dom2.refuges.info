/* Transform the GPS marker into a orientable compass
* that indicates the direction you are looking. */

const iconMarker = L.icon({ // Icône sans orientation
    iconUrl: '../leaflet/Gps.Compas/gps-marker.svg', //TODO résoudre leaflet/src
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
  iconCompas = L.icon({ // Icône orientée
    iconUrl: '../leaflet/Gps.Compas/gps-compas.svg',
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

 class   GpsCompas extends  L.Control.Gps {
  constructor(options) {
 return   super( {
   marker: gpsMarker,
      ...options,
  });}
};

 