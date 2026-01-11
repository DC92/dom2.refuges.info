<?php
/************************************************************************************
 * Export d'une ou plusieurs fiches de point (propriétées du point et commentaires) *
 ************************************************************************************/

// https://dom2.refuges.info/api/fiches?bbox=5.5,45.1,6.5,45.6&type_points=all&nb_points=2

include_once("point.php");
include_once("mise_en_forme_texte.php");
include_once("utilisateur.php");
include_once("entetes_http.php");

$vue = new stdClass();

// Dans un premier temps on met en place l'objet contenant la requête
$req = new stdClass();
//$req->page = $cible; // Ici on récupère la page (point, bbox, massif, contribution...)
$req->bbox = $_REQUEST['bbox'] ?? '';
//$req->massif = $_REQUEST['massif'] ?? '';
$req->id = $_REQUEST['id'] ?? '';
$req->format = $_REQUEST['format'] ?? 'json';
$req->detail = $_REQUEST['detail'] ?? '';
$req->format_texte = $_REQUEST['format_texte'] ?? 'html';
$req->nb_points = $_REQUEST['nb_points'] ?? '';
//$req->cluster = $_REQUEST['cluster'] ?? '';
$req->type_points = $_REQUEST['type_points'] ?? '';

// Ici c'est les valeurs possibles
$val = new stdClass();
$val->format_texte = array("bbcode", "texte", "markdown", "html");
$val->type_points = array("cabane", "refuge", "gite", "grotte", "pt_eau", "pt_passage", "batiment_a_explorer");
$val->type_points_id = array(7, 10, 9, 29, 23, 3, 28);

/****************************** VALEURS PAR DÉFAUT - PARAMS FACULTATIFS ******************************/
// On teste chaque champ pour voir si la valeur est dans liste des formats accepté, sinon on choisir le format geojson
if(!array_key_exists($req->format,$config_wri['api_format_points']))
  $req->format = "geojson";

/*if(!in_array($req->format_texte,$val->format_texte)) {
  switch ($req->page) {
    case 'bbox':
    //case 'massif':
    case 'point':
      $req->format_texte = "bbcode";
      break;
    default:
      $req->format_texte = "texte";
      break;
    }
}*/

if(!is_numeric($req->nb_points) && $req->nb_points!="all") {
  $req->nb_points = "all";
  /*switch ($req->page) {
    case 'bbox':
    /*case 'massif':
      $req->nb_points = $config_wri['defaut_max_nombre_point'];
      break;* /
    case 'point':
      $req->nb_points = 1;
      break;
    default:
      $req->nb_points = "all";
      break;
  }*/
}

// On vérifie que les types de points sont ok, sinon on met all comme valeur
/*if($req->page!="point") {
  $temp = explode(",", $req->type_points);
  foreach ($temp as $type_point) {
    if (!in_array($type_point,$val->type_points) &&
      !in_array($type_point,$val->type_points_id)) {
      $req->type_points = "all"; break;
    }
  }
}
else*/ {
  $req->type_points = "all";
}

// On vérifie que la bbox est correcte
$temp = explode(",", $req->bbox);
if($req->bbox=="") {
  $req->bbox="world";
}
else if(!((count($temp)==4 &&
  is_numeric($temp[0]) &&
  is_numeric($temp[1]) &&
  is_numeric($temp[2]) &&
  is_numeric($temp[3])) ||
  $req->bbox == "world")) {
  exit ("Error : wrong bbox parameter");
}

// On vérifie que la liste de massif est correcte
/*$temp = explode(",", $req->massif);
foreach ($temp as $massif) {
  if($req->page == "massif" && !is_numeric($massif)) { exit ("Error : wrong massif id"); }
}*/

/****************************** REQUÊTE RÉCUPÉRATION PTS ******************************/

$params = new stdClass();

if($req->bbox != "world") { // Si on a world, on ne passe pas de paramètre à postgis
  list($ouest,$sud,$est,$nord) = explode(",", $req->bbox);
  $params->geometrie = "ST_SetSRID(ST_MakeBox2D(ST_Point($ouest, $sud), ST_Point($est ,$nord)),4326)";
}
unset($ouest,$sud,$est,$nord);

$params->pas_les_points_caches=1;
    
/*switch ($req->page) {
  case 'bbox':
    $params->pas_les_points_caches=1;
    $params->ordre="point_type.importance DESC";
    break;
  /*case 'massif':
    $params->ids_polygones = $req->massif;
    $params->pas_les_points_caches=1;
    $params->ordre="point_type.importance DESC";
    break;* /
  case 'point':
    $params->ids_points = intval($req->id);
    break;
  default:
    break;
}*/

if($req->nb_points != "all") {
  $params->limite = $req->nb_points;
}
if($req->type_points != "all") {
  $params->ids_types_point = str_replace($val->type_points, $val->type_points_id, $req->type_points);
}

$points_bruts = new stdClass();
$points = new stdClass();
$points_bruts = infos_points($params);

/****************************** INFOS DU POINT ******************************/
$caracteristiques_point = [
  'nom','id_point','nom_type','id_point_type','topic_id',
  'altitude','geojson',
  'remark','proprio','acces','site_officiel','nom_createur',
  'conditions_utilisation','manque_un_mur','ouverture_contact_prealable',
  'places','places_matelas','cheminee','poele','couvertures','latrines','bois_a_proximite','eau_a_proximite',
];
$liste_points = [];
$fiches = [];

foreach ($points_bruts as $point) {
  $liste_points[] = $point->id_point;

  foreach ($point as $k => $v) {
    $c = str_replace('equivalent_', '', $k);

    if($v && in_array($c, $caracteristiques_point))
      $fiches[$point->id_point][$c] = $v;
  }
  $fiches[$point->id_point]['icone'] = choix_icone($point); //TODO format geojson ???????
}

/****************************** FORMATAGE DU TEXTE ******************************/
// On transforme le texte dans la correcte syntaxe
if($req->format_texte == "texte") {
  array_walk_recursive($fiches, 'updatebbcode2txt');
}
elseif($req->format_texte == "html") {
  array_walk_recursive($fiches, 'updatebbcode2html');
}
elseif($req->format_texte == "markdown") {
  array_walk_recursive($fiches, 'updatebbcode2markdown');
}
array_walk_recursive($fiches, 'updatebool2char'); // Remplace les False et True en 0 ou 1

/****************************** FORMAT VUE ******************************/
//*DCMM*/var_dump($liste_points);//TODO


include($config_wri['chemin_vues'].'api/fiches.vue.'.$req->format.".php");
exit;///////////////////////////////////////////////////////



/*DCMM*/var_dump($fiches);
/*DCMM*/var_dump($liste_points);

$conditions_commentaires = new stdClass();
$conditions_commentaires->ids_points = join(',',$liste_points);
$commentaires_points = infos_commentaires ($conditions_commentaires);
foreach ($commentaires_points as $commentaire) {
}

/*DCMM*/var_dump($commentaires_points);

foreach ($points_bruts as $i=>$point) {
/*DCMM*/var_dump($point);
}





foreach ($points_bruts as $i=>$point) {
exit;///////////////////////////////////////////////////////
  /*if(isset ($point->nb_points)) // cas des clusters
  {
    $points->$i = new stdClass();
    $points->$i->cluster = $point->nb_points;
    $points->$i->id = $point->id_point;
    $points->$i->nom = mb_ucfirst($point->nom);
    $points->$i->type['icone'] = 'cluster_n'.$point->nb_points;
    $points_geojson[$point->id_point]['geojson'] = $point->geojson;
  }
  else*/
  {
    // les cabanes cachées ne sont pas exportées. Les coordonnées étant volontairement stockées fausses, les sortir ne fera que créer de la confusion
    if($point->id_type_precision_gps == $config_wri['id_coordonees_gps_fausses'])
      break;

    $points->$i = new stdClass();
    $points->$i->id = $point->id_point;
    $points->$i->nom = mb_ucfirst($point->nom);
    $points->$i->type['id'] = $point->id_point_type;

    // DOM 04/01/26 ajout du paramètre detail=minimal pour la carte des points
    if ($req->format!="geojson" or $req->detail!="minimal")
    {
      switch ($point->conditions_utilisation)
      {
        case 'fermeture':
        case 'detruit':
          $points->$i->sym = "Crossing";
          break;
        case 'cle_a_recuperer': // TODO : trouver un symbole
        default:
          $points->$i->sym = $point->symbole;
      }

      $points->$i->lien = lien_point($point);
      $points->$i->coord['alt'] = $point->altitude;
      $points->$i->type['valeur'] = $point->nom_type;
      $points->$i->places['nom'] = $point->equivalent_places;
      $points->$i->places['valeur'] = $point->places;
      $points->$i->etat['valeur'] = texte_non_ouverte($point);
    }
    $points->$i->type['icone'] = choix_icone($point);
    $points_geojson[$point->id_point]['geojson'] = $point->geojson;
    // FIXME: comme l'array $points est converti en intégralité en xml ou json, je planque dans une autre variable ce que je veux séparément

    // En geojson, utilisé par la carte, on a pas besoin de tout ça, autant simplifier pour réduire le temps de chargement,
    // sauf si on appel explicitement le mode complet avec &detail=complet
    if ($req->format!="geojson" or $req->detail=="complet")
    {
      $points->$i->coord['long'] = $point->longitude;
      $points->$i->coord['lat'] = $point->latitude;
      $points->$i->etat['id'] = $point->conditions_utilisation;
      $points->$i->date['derniere_modif'] = $point->date_derniere_modification;
      $points->$i->coord['precision']['nom'] = $point->nom_precision_gps;
      $points->$i->coord['precision']['type'] = $point->id_type_precision_gps;
      $points->$i->remarque['nom'] = 'Remarque';
      $points->$i->remarque['valeur'] = $point->remark;
      $points->$i->acces['nom'] = 'Accès';
      $points->$i->acces['valeur'] = $point->acces;
      $points->$i->proprio['nom'] = $point->equivalent_proprio;
      $points->$i->proprio['valeur'] = $point->proprio;
      $points->$i->createur['id'] = $point->id_createur;

      // info sur le modérateur actuel de la fiche (authentifié ou non)
      if ($point->id_createur==0) // non authentifié
          $points->$i->createur['nom']=$point->nom_createur;
      else
      {
        $utilisateur=infos_utilisateur($point->id_createur);
        if (!empty($utilisateur->erreur)) // Aïe, le point référence un utilisateur qui n'existe plus
          $points->$i->createur['nom'] = "Utilisateur supprimé";
        else
          $points->$i->createur['nom'] = infos_utilisateur($point->id_createur)->username;
      }

      $points->$i->date['creation'] = $point->date_creation;
      $points->$i->article['demonstratif'] = $point->article_demonstratif;
      $points->$i->article['defini'] = $point->article_defini;
      $points->$i->article['partitif'] = $point->article_partitif_point_type;
      $points->$i->info_comp['site_officiel']['nom'] = $point->equivalent_site_officiel;
      $points->$i->info_comp['site_officiel']['url'] = $point->site_officiel;
      $points->$i->info_comp['site_officiel']['valeur'] = $point->site_officiel;
      $points->$i->info_comp['manque_un_mur']['nom'] = $point->equivalent_manque_un_mur;
      $points->$i->info_comp['manque_un_mur']['valeur'] = $point->manque_un_mur;
      $points->$i->info_comp['cheminee']['nom'] = $point->equivalent_cheminee;
      $points->$i->info_comp['cheminee']['valeur'] = $point->cheminee;
      $points->$i->info_comp['poele']['nom'] = $point->equivalent_poele;
      $points->$i->info_comp['poele']['valeur'] = $point->poele;
      $points->$i->info_comp['couvertures']['nom'] = $point->equivalent_couvertures;
      $points->$i->info_comp['couvertures']['valeur'] = $point->couvertures;
      $points->$i->info_comp['places_matelas']['nom'] = $point->equivalent_places_matelas;
      $points->$i->info_comp['places_matelas']['nb'] = $point->places_matelas;

      if($point->places_matelas == 0)
          $points->$i->info_comp['places_matelas']['valeur'] = "Sans";
      else
          $points->$i->info_comp['places_matelas']['valeur'] = $point->places_matelas;

      $points->$i->info_comp['latrines']['nom'] = $point->equivalent_latrines;
      $points->$i->info_comp['latrines']['valeur'] = $point->latrines;
      $points->$i->info_comp['bois']['nom'] = $point->equivalent_bois_a_proximite;
      $points->$i->info_comp['bois']['valeur'] = $point->bois_a_proximite;
      $points->$i->info_comp['eau']['nom'] = $point->equivalent_eau_a_proximite;
      $points->$i->info_comp['eau']['valeur'] = $point->eau_a_proximite;

      /*
      sly 09/12/2019 : Construction d'un grand texte contenant ce qui me semble le plus pertinent concernant un point,
      afin de l'inclure dans la description des gpx et du kml
      */
      $description="";

      if ($point->equivalent_places!="" and !empty($point->places))
        $description=$point->equivalent_places. ": ".$point->places."\n";

      if ($point->equivalent_places_matelas!="" and !empty($point->places_matelas))
        $description.=$point->equivalent_places_matelas.": ".$point->places_matelas."\n";

      $description.=$point->remark."\n";
      $description.=$point->acces."\n";
      $description.=$point->proprio."\n";
      $points->$i->description['valeur']=$description;
    }

    /****************************** FORMATAGE DU TEXTE ******************************/
    // On transforme le texte dans la correcte syntaxe
    if($req->format_texte == "texte") {
      array_walk_recursive($points->$i, 'updatebbcode2txt');
    }
    elseif($req->format_texte == "html") {
      array_walk_recursive($points->$i, 'updatebbcode2html');
    }
    elseif($req->format_texte == "markdown") {
      array_walk_recursive($points->$i, 'updatebbcode2markdown');
    }

    array_walk_recursive($points->$i, 'updatebool2char'); // Remplace les False et True en 0 ou 1
  }
}

// Dans le cas bien spécifique ou l'api ne va renvoyer qu'un seul point,
// nous stockons son nom pour renvoyer un nom de fichier indiquant le nom de ce point !
if (count($points_bruts)==1)
{
  $point=reset($points_bruts);
  $filename=replace_url($point->nom);
}

/****************************** FORMAT VUE ******************************/

include($config_wri['chemin_vues'].'api/points.vue.'.$req->format.".php");
?>

<?php //////////////////////////////////////////////// SUITE DOM ????
exit;
/********************************************
 * Export d'une ou plusieurs fiches de point (propriétées du point et commentaires)
********************************************/
include_once("mise_en_forme_texte.php");
include_once("entetes_http.php");

/****************************************/

$vue = new stdClass();
// Dans un premier temps on met en place l'objet contenant la requête
$req = new stdClass();
$req->bbox = $_REQUEST['bbox'] ?? '';
$req->format = $_REQUEST['format'] ?? 'json'; // En attendant le développement des autres vues
$req->format_texte = $_REQUEST['format_texte'] ?? 'html';



$conditions_points = new stdClass;
$conditions_points->ids_points='104,1179';

// récupération des infos du point
$points=infos_points($conditions_points);




$conditions_commentaires = new stdClass();
$conditions_commentaires->ids_points = '104,1179';
$commentaires_point = infos_commentaires ($conditions_commentaires);


/*DCMM*/var_dump($commentaires_point);
exit;


  /*$query_fiches="
    SELECT points.*,
      ST_AsGeoJSON(points.geom,5) AS geojson,
      type_precision_gps.*,
      point_type.*,COALESCE(phpbb3_users.username,points.nom_createur) as nom_createur,
      ST_X(points.geom) as longitude,ST_Y(points.geom) as latitude,
      extract('epoch' from points.date_derniere_modification) as date_modif_timestamp,
      extract('epoch' from points.date_creation) as date_creation_timestamp
      $select_distance
      $champs_polygones
      $champs_en_plus
    FROM
      type_precision_gps,point_type, points LEFT join phpbb3_users on points.id_createur = phpbb3_users.user_id $tables_en_plus
    WHERE
      points.id_type_precision_gps=type_precision_gps.id_type_precision_gps
      AND points.id_point_type=point_type.id_point_type
      $conditions_sql
    $ordre
    $limite
  ";*/
  $query_fiches="
    SELECT *
    FROM points
    WHERE id_point = 1179
  ";
  if ( ! ($res = $pdo->query($query_fiches)))
    return erreur("Une erreur sur la requête est survenue",$query_fiches);

  // Constuisons maintenant la liste des points demandés avec toutes les informations sur chacun d'eux
  // Depuis 12/2024 On sort maintenant tous les polygones auxquels les points appartiennent chaque point peut sortir plusieurs fois, il faut en tenir compte.
  /*
  $id_point_deja_fait=0;
  $nouveau_point=true;
  $nombre_point_deja_recuperes=0;
  */
  while ($fiche = $res->fetch())
  {
/*DCMM*/var_dump($fiche);
    // on attaque un nouveau point
  }

exit;

$fiches = [];
$conditions_fiches = new stdClass();
$conditions_fiches->ids_points = $req->id_point;
$fiches_point = infos_fiches ($conditions_fiches);

foreach ($commentaires_point as $cp) {
  $com = [];
  $com['id_point'] = $cp->id_point;
  $com['id_commentaire'] = $cp->id_commentaire;
  $com['date_commentaire'] = $cp->date;
  $com['texte_commentaire'] = $cp->texte;
  $com['auteur_commentaire'] = $cp->auteur_commentaire;
  if(isset($cp->lien_photo['vignette']) )
    $com['photo-vignette'] = $cp->lien_photo['vignette'];
  if(isset($cp->lien_photo['reduite']) )
    $com['photo-reduite'] = $cp->lien_photo['reduite'];
  if(isset($cp->lien_photo['vignette']) )
    $com['photo-originale'] = $cp->lien_photo['vignette'];
  $fiches[] = $com;
}

/****************************** FORMATAGE DU TEXTE ******************************/

// On transforme le texte dans la correcte syntaxe
if($req->format_texte == "texte")
  array_walk_recursive($fiches, 'updatebbcode2txt');
elseif($req->format_texte == "html")
  array_walk_recursive($fiches, 'updatebbcode2html');
elseif($req->format_texte == "markdown")
  array_walk_recursive($fiches, 'updatebbcode2markdown');

// Remplace les False et True en 0 ou 1
array_walk_recursive($fiches, 'updatebool2char');

/****************************** FORMAT VUE ******************************/

$fiches=[
  'type'=> 'FeatureCollection',
  'generator'=> 'Refuges.info API',
  'copyright'=> 'The data included in this document is from www.refuges.info. The data is made available under CC By-Sa 2.0',
  'timestamp'=> '2026-01-10T19=>56=>20+01=>00',
  'size'=> '19',
  'features'=> 
  [ 
  [
     'type'=> 'Feature',
     'id'=> 6088,
     'properties'=> ['id'=>6088,'nom'=>'Cabane du col des Ubertes','type'=>['id'=>7,'valeur'=>'cabane non gard\u00e9e','icone'=>'cabane_a48_feu'],'sym'=>'Fishing Hot Spot Facility','lien'=>'https=>\/\/dom2.refuges.info\/point\/6088\/cabane-non-gardee\/Cabane-du-col-des-Ubertes\/','coord'=>['alt'=>1228],'places'=>['nom'=>'Places pr\u00e9vues pour dormir','valeur'=>0],'etat'=>['valeur'=>'']],
     'geometry'=> ['type'=>'Point','coordinates'=>[3.4657,44.087]]
  ], 
  [
     'type'=> 'Feature',
     'id'=> 6187,
     'properties'=> ['id'=>6187,'nom'=>'Cabane du Plo de Valbelle','type'=>['id'=>28,'valeur'=>'b\u00e2timent en montagne','icone'=>'cabane_white_black_a63'],'sym'=>'Puzzle Cache','lien'=>'https=>\/\/dom2.refuges.info\/point\/6187\/batiment-en-montagne\/Cabane-du-Plo-de-Valbelle\/','coord'=>['alt'=>1321],'places'=>['nom'=>'','valeur'=>0],'etat'=>['valeur'=>'']],
     'geometry'=> ['type'=>'Point','coordinates'=>[3.5134,44.1409]]
  ]  ]
];

/****************************** FORMAT VUE ******************************/

include($config_wri['chemin_vues'].'api/fiches.vue.'.$req->format.".php");
?>
