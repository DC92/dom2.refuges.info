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
require_once ("meta_donnee.php");
require_once ("leaflet_libs.php");
add_lib('overpass/dist/OverPassLayer.bundle.js', 'chemin_leaflet');
add_lib('overpass/dist/OverPassLayer.css', 'chemin_leaflet');

// Table servant à la construction du sélecteur de couches de points
$types_points = [];
foreach (types_point_affichables() as $pt) {
  $types_points[] = [
    'id_point_type' => $pt->id_point_type,
    'nom_type' => $pt->nom_type,
    'nom_type_traduit' => _($pt->nom_type),
    'icone' => $config_wri['correspondance_type_icone'][replace_url($pt->nom_type)] ?? 'a63',
  ];
}

$vue->titre = _('Carte et informations sur les refuges, cabanes et abris de montagne');
$vue->stat = stat_site ();

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

// Cas de la visualisation d'un polygone (/nav)
if ($controlleur->url_decoupee[0] == 'nav' && !empty($controlleur->url_decoupee[1])) {
  $id_polygone = $controlleur->url_decoupee[1]; // Id du polygone contenant
  $params = new stdClass();
  $params->ids_polygones = $id_polygone;
  $params->avec_geometrie = 'geojson';
  $params->intersection = NULL;
  $polygones_bruts=infos_polygones($params);
  if(count($polygones_bruts))
    $vue->polygone = $polygones_bruts[0];
}

$vue->bbox=$config_wri['bbox_page_accueil']; //point de vue et position initiale de la page //TODO metre en /vues/_cartes_leaflet.js

// Zones couvertes
$vue->zones_couvertes=[];
$conditions = new stdClass;
$conditions->ids_polygone_type=$config_wri['id_zone'];
$zones=infos_polygones($conditions);
if ($zones)
  foreach ($zones as $zone)
    $vue->zones_couvertes [ucfirst($zone->nom_polygone)] =
      lien_polygone($zone)."?id_polygone_type=".$config_wri['id_massif'];
