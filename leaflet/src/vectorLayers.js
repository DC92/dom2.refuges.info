/* global L */

/************************
 * Couches vectorielles *
 * du site refuges.info *
 ************************
  Une icône est une image .png représentant un type de point
  Un point est défini par un position, un nom et une icône destinée à être affiché sur une carte
  Une fiche contient toutes les informations concernant un point, y compris les commentaires

  json est une structure contenant des définitions de points
  geoJson sa représentation en string
*/

// Points d'intérêt refuges.info
/* eslint-disable-next-line no-unused-vars */
function wriPOILayer(serveurAPI, type) {
  const url = serveurAPI + '/api/bbox?nb_points=all&type_points=' + type,
    poiLayer = L.geoJson(null, {
      // Icônes
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, {
          icon: L.icon({
            iconUrl: serveurAPI + '/images/icones/' + feature.properties.type.icone + '.svg',
            size: 24,
          }),
        }),

      onEachFeature: (feature, layer) => {
        // Etiquettes
        layer.bindTooltip(
          feature.properties.nom, {
            permanent: true,
            direction: 'center',
          }
        ).openTooltip();

        // Click
        //BEST Fonctions ctrl clic + Apple suivant demande faite à wri github
        layer.on({
          click: () => {
            // Affiche la vue fiche
            location.hash = feature.id;
          },
        });
      },
    });

  // Fetch remote data
  fetch(url)
    .catch((er) => console.error(er + ' fetching ' + url))
    .then((response) => response.json())
    .then((json) => {
      console.log(url); //DCMM
      if (json.features.length)
        poiLayer.addData(json);

      poiLayer.fire('onadddata', {
        url: url
      });
    });

  return poiLayer;
}

// Polygones de massifs de refuges.info
/* eslint-disable-next-line no-unused-vars */
function wriMassifsLayer(serveurAPI) {
  const massifsLayer = L.geoJson(null, {
    style: function(feature) {
      return {
        stroke: false,
        color: feature.properties.couleur,
      };
    },
    onEachFeature: (feature, layer) => {
      // Etiquettes
      layer.bindTooltip(
        feature.properties.nom
        .replace(/ ([a-z]?[a-z]?[a-z]) /gui, ' $1&nbsp;')
        .replace(/ /gu, '<br/>'), {
          permanent: true,
          direction: 'center',
        }).openTooltip();

      layer.on('mouseover mouseout', (evt) => {
        evt.target.setStyle({
          stroke: evt.type === 'mouseover',
        });
      });

      // Click
      //BEST Fonctions ctrl clic + Apple suivant demande faite à wri github
      layer.on({ //TODO essayer ce format switch / case:
        click: () => {
          //TODO Affiche la vue fiche
          // location.hash = feature.id;
        },
      });
    },
  });

  fetch(serveurAPI + '/api/polygones?type_polygon=1')
    .catch((er) => console.error(er + ' fetching ' + serveurAPI + '/api/polygones?type_polygon=1'))
    .then((response) => response.json())
    .then((json) => {
      if (json.features.length)
        massifsLayer.addData(json);
    });

  return massifsLayer;
}