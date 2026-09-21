sessionStorage.checkedLayers = '';

const map = initLeafletMap(
  'carte-edit',
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  <?=$vue->version_features?>,
  <?=json_encode($config_wri['mapKeys'])?>,
  {editable: true} 
),
geoJson = <?=$vue->json_polygones??''?>,
polygons=L.polygon(flipLonLatRecursive(geoJson.coordinates));
 
 // Affiche le polygone courant
if (geoJson) 
polygons    .addTo(map).enableEdit();
  
    map.addControl(new L.NewPolygonControl());
 map.doubleClickZoom.disable();

//DCMM FUTUR HORS RESEAU
 console.log(polygons.getBounds());//DCMM

 
//////aaaaaaaaaaaaaa
//const geojsonCoordinates=<?=$vue->json_polygones??'{coordinates:[]}'?>.coordinates;

//


//console.log(geojsonCoordinates);//DCMM
//console.log(poly);//DCMM


/*const map = mapEdit({
  target: ,
  host: '/',
  mapKeys: <?=json_encode($config_wri['mapKeys'])?>,
  extent: <?=json_encode($vue->polygone->extent??null)?>,
  idPolygone: <?=$vue->polygone->id_polygone??0?>,
  idPolygoneType: <?=$vue->polygone->id_polygone_type??0?>,
});*/

 /* const tileLayers = couchesDeFond( 
  <?=json_encode($config_wri['mapKeys'])?>),
    permalink = sessionStorage.permalink.split('/'),
    baselayer = tileLayers[decodeURI(permalink[3])] || Object.values(tileLayers)[0],
      map = L.map('carte-edit', {
        editable: true,
      } )*/;

 // baselayer.addTo(map); // Fond de carte par défaut
  
 // new L.Control.Fullscreen().addTo(map);
//console.log(L.Editable);//DCMM
//console.log(map.editTools);//DCMM

   /*  L.EditControl = L.Control.extend({

        options: {
            position: 'topleft',
            callback: null,
            kind: '',
            html: ''
        },


    });*/

/*var poly1 = L.polygon([[
  [-1.66194,49.14688],[-1.66189,48.73459],[-1.46409,48.48762],[-0.64743,48.47418],[-0.31011,47.97633],[0.19751,48.09088],[0.52734,47.95408],[1.16727,47.90637],[1.44836,48.58316],[0.77804,48.8109],[0.00617,49.42486],[-1.09017,49.46062],[-1.18906,49.75607],[-2.00762,49.77735],[-1.9417,49.36412],[-1.66194,49.14688]
]]).addTo(map);
var poly = L.polygon([[
  [49.14688,-1.66194],[48.73459,-1.66189],[48.48762,-1.46409], 
]]).addTo(map);*/
    
map.fitBounds([
    [44, 0],
    [46, 5],
]);

    /*

    var rec = L.rectangle([
        [43.1235, 1.255],
        [43.1215, 1.259]
    ]).addTo(map);
    rec.enableEdit();
    rec.on('dblclick', L.DomEvent.stop).on('dblclick', rec.toggleEdit);
         
        
        [[[
        
   
        
        
        ]]]
        
        }' />*/