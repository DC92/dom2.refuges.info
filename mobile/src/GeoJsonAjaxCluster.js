/** GeoJsonAjaxCluster for Leaflet, fully integrated class including:
     ajax geoJson remote server
     customs icons display with labels
     tooltip hover on mouse
     on click or touch action
 *
 * options:
     url: '/api/bbox?&nb_points=all&detail=minimal',
     icon: {
        url: feature => 'url calculated from feature',
        size: 16 || [16, 16], // Default 16
        anchor: [8, 8], // Default center
      },
     label: {
        title: feature => 'text calculated from feature>',
        permanent: <boolean>, // Permanent display | only on hover. Default false
        direction: '<right|left|top|bottom|center|auto>', // To the icon
        offset: Point(0, 0), // To the icon
        opacity: <0...1>;
      },
     click: feature => <action>,
 *
 * Based on :
 *   https://leafletjs.com/
 *   https://github.com/Leaflet/Leaflet.markercluster
     (c) 2026, Dominique Cavailhez
 */
//TODO bbox strategy
//TODO select point type
//TODO other vector layers
//TODO separate nearby points

/* global L */

/* eslint-disable no-unused-vars */
class GeoJsonAjaxCluster extends L.MarkerClusterGroup {
  constructor(options) {
    super();

    options.icon.size ||= 16;
    if (typeof options.icon.size === 'number')
      options.icon.iconSize = [options.icon.size, options.icon.size];
    options.icon.iconAnchor ||= [options.icon.iconSize[0] / 2, options.icon.iconSize[1] / 2];

    const poiLayer = L.geoJson(null, {
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, {
          icon: L.icon({
            iconUrl: options.icon.url(feature),
            ...options.icon,
          }),
        }),

      onEachFeature: (feature, layer) => {
        // Icon label
        if (typeof options.label.title === 'function')
          layer.bindTooltip(
            options.label.title(feature),
            options.label
          ).openTooltip();

        // Click
        if (typeof options.click === 'function')
          layer.on({
            click: evt => options.click(feature, evt),
          });
      },
    });

    // Load features from url
    (async function() {
      const response = await fetch(options.url),
        json = await response.json();

      poiLayer.addData(json);
      this.addLayer(poiLayer);
    }).bind(this)();
  }
}