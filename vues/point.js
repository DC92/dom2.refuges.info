const map = initLeafletMap(
  'carte-point',
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  <?=$vue->version_features?>,
  <?=json_encode($config_wri['mapKeys'])?>
);

  // Marqueur de position de cabane
  L.marker([<?=$vue->point->latitude?>,<?=$vue->point->longitude?>], {
      icon: L.icon({
        iconUrl: '/images/cadre.svg',
        iconSize: [32, 44],
        iconAnchor: [16, 22],
      }),
    })
  .addTo(map);
