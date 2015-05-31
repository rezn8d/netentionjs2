/* http://cesium.agi.com */

var cesiumLoaded = false;
var MAX_CESIUM_ITEMS = 250;

function renderCesiumMap(o, v) {
	var cc = { };
	var viewer;

	function render() {
		var ee = uuid();
		var vv = newDiv(ee);
		vv.attr('class', 'cesiumContainer');
		v.append(vv);
	
		viewer = cc.cesium = new Cesium.Viewer(ee);
		updateMap();
	}

	var plist = [];

	function updateMap() {
		if (!viewer)
			return;

		var scene = viewer.scene;

		function addPrimitive(p) {
			var x = scene.primitives.add(p);
			plist.push(x);
		}
		function clearPrimitives() {
			for (var i = 0; i < plist.length; i++)
				scene.primitives.remove( plist[i] );
			plist = [];
		}
		clearPrimitives();

		var octagonVertexAngle = 3.1415 * 2.0 / 8.0;

		var imageMaterials = { };

		function newCircle(lat, lon, radiusMeters, vertexAngle, r, g, b, a, iconURL) {
			var poly = new Cesium.CircleGeometry({
			  center : Cesium.Cartesian3.fromDegrees(lon, lat),
			  radius : radiusMeters,
			  extrudedHeight: 10
			});
			if (iconURL) {
				if (imageMaterials[iconURL]) {
					poly.material = imageMaterials[iconURL];
				}
				else {
					imageMaterials[iconURL] = poly.material = new Cesium.Material({
						fabric : {
						    type : 'Image',
						    uniforms : {
						        image: iconURL,
						    },
							components: {
								alpha: a*2.0
							}
						}
					});
				}
			}
			else {
				poly.material = Cesium.Material.fromType('Color');
				poly.material.uniforms.color = {
					red : r,
					green : g,
					blue : b,
					alpha : a
				};		
			}
			return poly;
		}

	    function createMarker(uri, lat, lon, rad, opacity, fill, iconURL) {		
			/*

    viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
        billboard : {
            image : '../images/Cesium_Logo_overlay.png', // default: undefined
            show : true, // default
            pixelOffset : new Cesium.Cartesian2(0, -50), // default: (0, 0)
            eyeOffset : new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
            horizontalOrigin : Cesium.HorizontalOrigin.CENTER, // default
            verticalOrigin : Cesium.VerticalOrigin.BOTTOM, // default: CENTER
            scale : 2.0, // default: 1.0
            color : Cesium.Color.LIME, // default: WHITE
            rotation : Cesium.Math.PI_OVER_FOUR, // default: 0.0
            alignedAxis : Cesium.Cartesian3.ZERO, // default
            width : 100, // default: undefined
            height : 25 // default: undefined
        }
    });



					var primitives = scene.getPrimitives();
					var image = new Image();
					image.onload = function() {
						var billboards = new Cesium.BillboardCollection();
						var textureAtlas = scene.getContext().createTextureAtlas({image : image});
						billboards.setTextureAtlas(textureAtlas);
						billboard = billboards.add({
						    position : ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(-75.59777, 40.03883)),
						    imageIndex : 0
						});
						primitives.add(billboards);
					};
					image.src = '../images/Cesium_Logo_overlay.png';
			*/
			addPrimitive(newCircle(lat, lon, rad, octagonVertexAngle, fill.r, fill.g, fill.b, opacity, iconURL));
		}

	    currentMapNow = Date.now();        

        renderItems(self, o, v, MAX_CESIUM_ITEMS, function(s, v, xxrr) {
            for (var i = 0; i < xxrr.length; i++) {
                var x = xxrr[i][0];
                var r = xxrr[i][1];        
			//	renderMapMarker(x, createMarker, r);
            }        
        });

	}

	//ensure Cesium loaded
	if (!cesiumLoaded) {
		cesiumLoaded = true;

		loadCSS('/lib/cesium/1.9/Build/Cesium/Widgets/Viewer/Viewer.css');
		loadCSS('/lib/cesium/1.9/Build/Cesium/Widgets/widgets.css');

    LazyLoad.js("/lib/cesium/1.9/Build/Cesium/Cesium.js", render);
	}
	else {
		render();
	}

 	cc.onChange = function() {
        updateMap();
    };

	return cc;
}
