/* global L */

/*********************************************************
 * Transforms the GPS marker into a rotating compass     *
 * which indicates the direction in which we are looking *
 *********************************************************/

/* eslint-disable-next-line no-unused-vars */
class GpsCompas extends L.Control.Gps {
  constructor(options) {
    // Fix icon
    const iconMarker = L.divIcon({
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '', // To clean default class
        html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16" width="16">\
        <circle cx="8" cy="8" r="6" fill="#ff0" stroke="#f00" stroke-width="2" />\
      </svg>',
      }),

      // Direction icon
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

    super({
      marker: gpsMarker,
      ...options,
    });

    gpsMarker.rotateIcon = () => { // This must be an inline function
      gpsMarker._icon.style.transform =
        gpsMarker._icon.style.transform.match(/translate3d\([^)]+\)/u) +
        ' rotateZ(' + (45 - parseInt(this.heading, 10)) + 'deg)';
    }

    // Prevents zoom from affecting the marker's direction.
    gpsMarker._setPos = function(pos) { // This must be a function
      L.Marker.prototype._setPos.call(this, pos);

      this.rotateIcon();
    };

    // Rotate the marker following the magnetic sensor
    window.addEventListener('deviceorientationabsolute', (evt) => {
      this.heading = evt.alpha || evt.webkitCompassHeading; // Android || iOS

      if (gpsMarker._icon && this.heading) { // If gps enabled
        // Add the direction to the icon if it is not already done.
        gpsMarker.setIcon(iconCompas);
        gpsMarker._icon.style.transformOrigin = 'center';

        this.rotateIcon();
      }
    });
  }
};