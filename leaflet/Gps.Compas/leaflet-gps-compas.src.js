/* global L */

/****************************************************
 * Transform the GPS marker into a rotating compass *
 * that indicates the direction you are looking     *
 ****************************************************/
// Fix icon
const   iconMarker = L.divIcon( {
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: '', // To clean default class
    html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16" width="16">\
        <circle cx="8" cy="8" r="6" fill="#ff0" stroke="#f00" stroke-width="2" />\
      </svg>',
  }),
  // Orientable icon
  iconCompas = L.divIcon({
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: '',  
    html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16" width="16">\
        <circle cx="8" cy="8" r="6" fill="#ff0" stroke="#f00" stroke-width="2" />\
        <path d="M0,0 8,1 8,8 1,8" fill="#f00" />\
      </svg>',
  }),
  // Marker
  gpsMarker = L.marker([0, 0], {
    icon: iconMarker,
  });

let gpsAngle = 0;
 
 // Rotate the marker following the magnetic sensor
window.addEventListener('deviceorientationabsolute', (evt) => {
   if (gpsMarker._icon && evt.alpha) { // If gps enabled
  // Add direction to the icon if not already done
    gpsMarker.setIcon(iconCompas);
    gpsMarker._icon.style.transformOrigin = 'center';
    
    // Rotate the icon
     gpsAngle = 45 - parseInt(evt.alpha, 10);
    gpsMarker._icon.style.transform += ' rotateZ(' + gpsAngle + 'deg)';
   }
});
 
// Prevents the marker's direction from being affected by zooming
gpsMarker._setPos =  function(pos) {// This must be a function
    L.Marker.prototype._setPos.call(this, pos);
     
    this._icon.style.transform += ' rotateZ(' + gpsAngle + 'deg)';
   } ;

/* eslint-disable-next-line no-unused-vars */
class GpsCompas extends L.Control.Gps {
  constructor(options) {
    super({
      marker: gpsMarker,
      ...options,
    });
  }
};
 