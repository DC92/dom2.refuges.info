localStorage.checkedLayers = '';

const map = initLeafletMap(
  'carte-edit',
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  <?=$vue->version_features?>,
  <?=json_encode($config_wri['mapKeys'])?>,
  {editable: true} 
);

//////aaaaaaaaaaaaaa
const geojsonCoordinates=<?=$vue->json_polygones?>.coordinates;

console.log(geojsonCoordinates);//DCMM


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
    permalink = localStorage.permalink.split('/'),
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

    L.NewPolygonControl = L.Control.extend({
        options: {
            position: 'topleft',
            callback: map.editTools.startPolygon,
            kind: 'polygon',
            html: '<span style="font-size:30px">⬡</span>'
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
                link = L.DomUtil.create('a', '', container);

            link.href = '#';
            link.title = 'Create a new ' + this.options.kind;
            link.innerHTML = this.options.html;
            L.DomEvent.on(link, 'click', L.DomEvent.stop)
                      .on(link, 'click', function () {
                        window.LAYER = this.options.callback.call(map.editTools);
                      }, this);

            return container;
        },
    });
    map.addControl(new L.NewPolygonControl());
 map.doubleClickZoom.disable();

var poly1 = L.polygon([[
  [-1.66194,49.14688],[-1.66189,48.73459],[-1.46409,48.48762],[-0.64743,48.47418],[-0.31011,47.97633],[0.19751,48.09088],[0.52734,47.95408],[1.16727,47.90637],[1.44836,48.58316],[0.77804,48.8109],[0.00617,49.42486],[-1.09017,49.46062],[-1.18906,49.75607],[-2.00762,49.77735],[-1.9417,49.36412],[-1.66194,49.14688]
]]).addTo(map);
var poly = L.polygon([[
  [49.14688,-1.66194],[48.73459,-1.66189],[48.48762,-1.46409], 
]]).addTo(map);
poly.enableEdit();
    poly.on('dblclick', L.DomEvent.stop).on('dblclick', poly.toggleEdit);
    
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