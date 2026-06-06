<?php
/*******************************************************************************
Ecran d'accueil

Contient le code PHP de la page
Le code html est dans /vues/*.html
Le code javascript est dans /vues/*.js
Les variables sont passées dans l'objet $vue->...
*******************************************************************************/

require_once ("nouvelle.php");
require_once ("polygone.php");
$vue->titre = 'Carte et informations sur les refuges, cabanes et abris de montagne';
$vue->stat = stat_site ();

add_lib('leaflet/dist/leaflet.css', 'chemin_leaflet');
add_lib('leaflet/dist/leaflet-src.js', 'chemin_leaflet');
add_lib('fullscreen/dist/leaflet.fullscreen.css', 'chemin_leaflet');
add_lib('fullscreen/dist/Leaflet.fullscreen.js', 'chemin_leaflet');
add_lib('geocoder/Control.Geocoder.css', 'chemin_leaflet');
add_lib('geocoder/Control.Geocoder.js', 'chemin_leaflet');
add_lib('gps/dist/leaflet-gps.src.css', 'chemin_leaflet');
add_lib('gps/dist/leaflet-gps.src.js', 'chemin_leaflet');
add_lib('markercluster/dist/MarkerCluster.css', 'chemin_leaflet');
add_lib('markercluster/dist/MarkerCluster.Default.css', 'chemin_leaflet');
add_lib('markercluster/dist/leaflet.markercluster-src.js', 'chemin_leaflet');
add_lib('FeatureGroup.SubGroup/src/subgroup.js', 'chemin_leaflet');
add_lib('src/compass.js', 'chemin_leaflet');
add_lib('src/tileLayers.js', 'chemin_leaflet');
add_lib('src/vectorLayers.js', 'chemin_leaflet');
add_lib('src/map.js', 'chemin_leaflet');
add_lib('src/map.css', 'chemin_leaflet');

// Préparation de la liste des photos et commentaires récent(e)s
$conditions_nouveaux_commentaires = new stdclass();
$conditions_nouveaux_commentaires->limite=$config_wri['defaut_max_commentaires_recents'];
$conditions_nouveaux_commentaires->avec_infos_point=True;
$conditions_nouveaux_commentaires->ordre="date_creation DESC";
$vue->nouveaux_commentaires=infos_commentaires($conditions_nouveaux_commentaires);


$conditions_nouveaux_points = new stdclass();
$conditions_nouveaux_points->limite=$config_wri['defaut_max_ajouts_recents'];
$conditions_nouveaux_points->ordre="date_creation DESC";
$vue->nouveaux_points=infos_points($conditions_nouveaux_points);

$vue->type="index";
$vue->bbox=$config_wri['bbox_page_accueil']; //point de vue et position initiale de la page

// Zones couvertes
$vue->zones_couvertes=[];
$conditions = new stdClass;
$conditions->ids_polygone_type=$config_wri['id_zone'];
$zones=infos_polygones($conditions);
if ($zones)
  foreach ($zones as $zone)
    $vue->zones_couvertes [ucfirst($zone->nom_polygone)] =
      lien_polygone($zone)."?id_polygone_type=".$config_wri['id_massif'];
