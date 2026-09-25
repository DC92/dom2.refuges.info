const map = L.map('carte-accueil'),
  tileLayers = couchesDeFond(<?=json_encode($config_wri['mapKeys'])?>),
  overlays = overlaysSelectables(map, 'https://<?=$_SERVER["SERVER_NAME"]?>', <?=$vue->version_features?>),
  permalink = sessionStorage.permalink.split('/');
  
// Limite le zoom à un maximum
permalink[0] = Math.min(parseInt(permalink[0]), 13);

// Fond de carte par défaut
(tileLayers[decodeURI(permalink[3])] || Object.values(tileLayers)[0]).addTo(map);

// Controles
L.control.layers(tileLayers).addTo(map);
L.control.layers(null, overlays).addTo(map);
controlesComuns(map).forEach((control) => control.addTo(map));
//DCMM FUTUR HORS RESEAU new ControlPreload( ).addTo(map);// Ajoute de controle pre-load OpenHikingMap
  permalinkControl(map) ;

// Externalise le sélecteur de points pour les grandes largeurs de fenêtre
['load', 'resize'].forEach(evtName =>
  window.addEventListener(evtName, () => {
const conteneurSelecteurExterneEl = document.getElementById('conteneur-selecteur-points'),
  conteneurDeuxièmeSelecteurEl = document.querySelector(':has(>.leaflet-control-layers)').lastChild.lastChild,
  selecteursPointsEl = document.querySelector('.leaflet-control-layers-overlays:has(img)');
 
    if (window.innerWidth < 800)
      conteneurDeuxièmeSelecteurEl.appendChild(selecteursPointsEl);
    else
      conteneurSelecteurExterneEl.insertBefore(selecteursPointsEl, conteneurSelecteurExterneEl.firstElementChild);
  }));

// Lance le chargement de la carte
map.setView([permalink[1], permalink[2]], permalink[0]);

// Calcul du lien d'export
const  exportCarteEl = document.getElementById('export-carte'); // Lien d'export de la carte
 
function copyExportLink() {
  navigator.clipboard.writeText(exportCarteEl.children[1].href)
    .then(() => alert('Lien d\'exportation copié dans le presse-papier :\n\n' +
      exportCarteEl.children[1].href));
}

function setExportLink() {
  const bne = map.getBounds()._northEast,
    bsw = map.getBounds()._southWest,
    fc = (coord) => Math.floor(coord * 10000) / 10000,
    cc = (coord) => Math.ceil(coord * 10000) / 10000;

  exportCarteEl.children[1].href = '/api/bbox' +
    '?type_points=' + sessionStorage.checkedLayersTypes +
    '&nb_points=all' +
    '&bbox=' + fc(bsw.lng) + ',' + fc(bsw.lat) + ',' + cc(bne.lng) + ',' + cc(bne.lat) +
    '&format=' + exportCarteEl.firstElementChild.value;

  // Affiche seulement quand il y a quelque chose à exporter
  exportCarteEl.style.display = sessionStorage.checkedLayersTypes ? 'block' : 'none';
}

map.on('overlayadd', () => setExportLink()); // Also for init
map.on('overlayremove', () => setExportLink());
map.on('moveend', () => setExportLink()); // For zoom & shifts



//TODO checkedLayers
//TODO move to myLeaflet
//TODO IF il y a des overlays
['load',   'overlayadd', 'overlayremove' ]
.forEach((type) => {
  map.on(type, (evt) => {
    overlaysStorage(map, evt,couchesIconesWRI);

    // Cache les étiquettes pour les grandes échèles
    map.getContainer().classList[map.getZoom() < 8 ? 'add' : 'remove']('hide-tooltips');
  });
});
/*
sessionStorage.checkedLayers.split(',') .forEach((layerName) => {
  if(layerName){
 console.log( couchesIconesWRI[  layerName] );//DCMM
 couchesIconesWRI[  layerName] [3].addTo(map);
  }});
  */

// Store in sessionStorage what layer is active.
function overlaysStorage(map, evt,couchesIconesWRI) {
  //TODO BUG DCMM ne restaure pas les overlays
  const overlaySelectors = document.querySelectorAll('.leaflet-control-layers-overlays input'),
    memCheckedLayers = sessionStorage.checkedLayers.split(','),
    checkedLayersnames = [],
    checkedLayersTypes = [];

  for (const lsInputEl of overlaySelectors) {
    const nom = lsInputEl.parentElement.lastChild.innerText.trim();
 
    // Restaure les couches overlays précédentes
    if (evt.type === 'load' && memCheckedLayers.includes(nom)) {
      //TODO trouver un meilleur moyen de distinguer les layerGroups
      if (couchesIconesWRI[nom])// LayersGroup
        couchesIconesWRI[nom][3].on('adddata', () => lsInputEl.click()); // Overlays vector
      else
        lsInputEl.click(); // Layer
    }

    // Mémorise les couches actuelles
    if (lsInputEl.checked) {
      checkedLayersnames.push(nom);

      if (typeof couchesIconesWRI[nom] === 'object')
        checkedLayersTypes.push(couchesIconesWRI[nom][0]);
    }
  }

  // Mémorise dans la mémoire de l'explorateur sessionStorage
  sessionStorage.checkedLayers = checkedLayersnames.join(',');
  sessionStorage.checkedLayersTypes = checkedLayersTypes.join(',');
}
//END TODO checkedLayers
