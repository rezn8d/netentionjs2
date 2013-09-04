var graphUpdatePeriod = 150; //in ms
var layoutFPS = 20;

function renderGraph(s, o, v, withGraph) {
    
    var ee = uuid();
	var r = newDiv('"slateContainer"');
	r.attr('style', 'width:100%; height:100%;');	
	v.append(r);

	var l = newDiv('slate');
	r.append(l);
    
    later(function() {
        initCZ(function() {
        	
    		graphCZ(r, function(root) {	
                var width = 1000;
                var height = 1000;
                
                var sys = arbor.ParticleSystem(1500, 762, 0.5);                
                sys.screenPadding(20);
                sys.screenSize(width, height);
                sys.parameters({"fps":layoutFPS, "repulsion":3600,"friction":0.5,"stiffness":25,"gravity":false});
                
                
                sys.start();
                
                var nodeShapes = { };
                var edgeShapes = { };
                
                var that = { };
                
                function addNode(id, name, iconURL) {
                    if (!name)
                        name = id;
                        
                    var x = Math.random() * 400.0 - 200.0;  
                    var y = Math.random() * 400.0 - 200.0; 
                    
                    var shape = addRectangle(root, "layer1", id, x, y, 50, 30.9, { strokeStyle: 'white', lineWidth: 2, fillStyle: 'rgba(210,210,210,0.85)' });
                    
                    shape.reactsOnMouse = true;
                    shape.onmouseclick = function (e) {
                        newPopupObjectView(id);
                    };
                    shape.onmouseleave = function (e) {
                        this.settings.strokeStyle = 'white';
                        this.settings.lineWidth = 1;
                        this.vc.invalidate();
                        //isMovedOut = true;
                    };
                    shape.onmouseenter = function (e) {
                        this.settings.strokeStyle = 'green';
                        this.settings.lineWidth = 1;
                        this.vc.invalidate();
                        //isClicked = true;
                    };

                    
                    /*
                    shape.onmouseenter = function (e) { 
                        console.log('enter ' + id);
                    };*/
                        
                    //var circle = addCircle(shape, "layer2", id  + 'c', 0, 0, 23, { strokeStyle: 'white', lineWidth: 2, fillStyle: 'rgb(20,240,40)' }, true);
    
                    var fontSize = 6;
                    var text = addText(shape, "layer1", id + '_t', 0, 0, y, fontSize, _.string.truncate(name, 16), { fillStyle: 'black', fontName: 'Arial' }, undefined, true);
                    
                    text.offX = -25;
                    
                /*var rect = addRectangle(root, "layer1", "r", -100, -50, 200, 100, { strokeStyle: 'rgb(240,240,240)', lineWidth: 2, fillStyle: 'rgb(140,140,140)' });
                rect.reactsOnMouse = true;
                rect.onmouseclick = function(e) {
                    console.log('clicked rect');
                };
                setInterval(function() {
                    rect.height = (Math.random() + 0.5) * 10.0;
                    rect.vc.invalidate();
                }, 50);*/
                
                //var circle = addCircle(rect, "layer1", "c", 0, 0, 49, { strokeStyle: 'white', lineWidth: 2, fillStyle: 'rgb(20,40,240)' });
                    if (iconURL)
                        addImage(shape, "layer1", id + "_i", -25, -25, 50, 50, iconURL, function () { vc.virtualCanvas("invalidate"); });
                        
                //text = addText(image, "layer2", "t", -20, -20, 0, 8, "Hello World", { fillStyle: 'green', fontName: 'Calibri' });
    
                    nodeShapes[id] = shape;
                    sys.addNode(id);
                }
                that.addNode = addNode;
                
                function addEdge(edgeID, a, b) {
                    if (edgeShapes[edgeID])
                        return;
                        
                    var x = Math.random() * 400.0 - 200.0;  
                    var y = Math.random() * 400.0 - 200.0; 
                    var edgeWidth = 0.3;
                    
                    var line = addRectangle(root, "layer2", edgeID, x, y, edgeWidth, 15, { fillStyle: 'rgba(180,180,180,0.8)', angle: 0});
                    line.from = a;
                    line.to = b;
                    
                    edgeShapes[edgeID] = line;
                    sys.addEdge(a, b, { id: edgeID });
                    
                }
                that.addEdge = addEdge;
                
                function moveShape(s, x, y, angle) {
                    s.x = x;
                    
                    if (s.baseline)
                        s.baseline = y;
                    
                    s.y = y;
                                     
                    if (angle) {
                        s.settings.angle = angle;    
                    }
                    
                    for (var c = 0; c < s.children.length; c++) {
                        var sc = s.children[c];
                        var ox = sc.offX || 0;
                        var oy = sc.offY || 0;
                        moveShape(sc, x+ox, y+oy, angle);
                    }
                }
                
                var offsetX = width;
                var offsetY = height/2.0;
                
                var updater = setInterval(function() {
                    
                    if (!$('#' + ee).is(':visible')) { 
                        //STOP
                        clearInterval(updater);
                        sys.stop();
                        return;
                    }
                        
                    sys.eachNode(function(x, pi) {
                       var s = nodeShapes[x.name];                       
                       if (s) {
                           moveShape(s, pi.x-offsetX, pi.y-offsetY);
                       }
                    });
                    
                    sys.eachEdge(function(edge, p1, p2) {
                        var e = edgeShapes[edge.data.id];
                        if (e) {
                            var cx = 0.5 * (p1.x + p2.x) - offsetX;
                            var cy = 0.5 * (p1.y + p2.y) - offsetY;
                            
                            var dy = p2.y - p1.y;                            
                            var dx = p2.x - p1.x;
                            
                            var angle = Math.atan2( dy, dx );
                            
                            var dist = Math.sqrt( dy*dy + dx*dx );
                            
                            e.width = dist;
                            
                            moveShape(e, cx, cy, angle);
                        }
                    });
                    root.vc.invalidate();
                }, graphUpdatePeriod);
     
                
    		}, withGraph);								
    	});
        
    });

}



function renderGraphFocus(s, o, v) {
    renderGraph(s, o, v, function(g) {
        renderItems(s, o, v, 75, function(s, v, xxrr) {
            var tags = { };
            
            for (var i = 0; i < xxrr.length; i++) {
                var x = xxrr[i][0];
                var r = xxrr[i][1];
                g.addNode(x.id, { label: x.name || "" } );
                
                var rtags = objTags(x);
                if (!rtags)
                    continue;
                for (var j = 0; j < rtags.length; j++) {
                    var tj = rtags[j];
                    var exists = tags[tj];
                    if (!exists) {
                        var ttj = s.tag(tj);
                        if (ttj) {           
                            g.addNode(tj, { label: s.tag(tj).name||"" }, getTagIcon(tj));
                            tags[tj] = true;
                        }
                    }
                    g.addEdge(x.id+'_' + j, x.id, tj);
                }
            }
            
        });        
    });
}


var codeLoaded = false;

function initCZ(f) {
    if (codeLoaded) {
        f();
    }
    else {
        codeLoaded = true;

        var scripts = [ 

			"/lib/slateboxjs/raphael/raphael.js",

			"/lib/slateboxjs/slatebox.js",
			"/lib/slateboxjs/slatebox.slate.js",
			"/lib/slateboxjs/slatebox.node.js",

			"/lib/slateboxjs/raphael/raphael.el.tooltip.js",
			"/lib/slateboxjs/raphael/raphael.el.loop.js",
			"/lib/slateboxjs/raphael/raphael.el.style.js",
			"/lib/slateboxjs/raphael/raphael.button.js",
			"/lib/slateboxjs/raphael/raphael.fn.connection.js",
			"/lib/slateboxjs/raphael/raphael.fn.objects.js",

			"/lib/slateboxjs/node/Slatebox.node.editor.js",
			"/lib/slateboxjs/node/Slatebox.node.shapes.js",
			"/lib/slateboxjs/node/Slatebox.node.menu.js",
			"/lib/slateboxjs/node/Slatebox.node.toolbar.js",
			"/lib/slateboxjs/node/Slatebox.node.context.js",
			"/lib/slateboxjs/node/Slatebox.node.colorpicker.js",
			"/lib/slateboxjs/node/Slatebox.node.links.js",
			"/lib/slateboxjs/node/Slatebox.node.connectors.js",
			"/lib/slateboxjs/node/Slatebox.node.relationships.js",
			"/lib/slateboxjs/node/Slatebox.node.images.js",
			"/lib/slateboxjs/node/Slatebox.node.template.js",
			"/lib/slateboxjs/node/Slatebox.node.resize.js",

			"/lib/slateboxjs/spinner.js",
			"/lib/slateboxjs/emile/emile.js",
			"/lib/slateboxjs/notify.js",

			"/lib/slateboxjs/slate/Slatebox.slate.canvas.js",
			"/lib/slateboxjs/slate/Slatebox.slate.message.js",
			"/lib/slateboxjs/slate/Slatebox.slate.multiselection.js",
			"/lib/slateboxjs/slate/Slatebox.slate.nodes.js",

			"/lib/slateboxjs/slate/Slatebox.slate.zoomSlider.js",
			"/lib/slateboxjs/slate/Slatebox.slate.keyboard.js",
			"/lib/slateboxjs/slate/Slatebox.slate.birdseye.js",

             '/lib/arbor/arbor.js'
        ];
        
        loadCSS('/lib/slateboxjs/example.css');        

        LazyLoad.js(scripts, f);

    }
	
}

var vc;
function graphCZ(canvasElement, init, withGraph) {
	var graph = init(canvasElement);

	var $s = new Slatebox();

    var log = [], startTime = Math.round(new Date().getTime() / 1000);

    function upd() {
        Slatebox.el("txtSlateJson").value = _mainSlate.exportJSON();
        Slatebox.el("txtSlateLastUpdated").innerHTML = "last updated <b>" + new Date().toString();
    };

	//console.log($s);


    var _mainSlate = $s.slate({
        id: 'firstSlateExample' //slate with the same ids can collaborate together.
        , container: 'slate'
        , viewPort: { width: 50000, height: 50000, allowDrag: true, left: 5000, top: 5000 }
        , showZoom: true
        , showBirdsEye: false
        , showStatus: false
        , showMultiSelect: false
        , onSlateChanged: function (subscriberCount) {
            upd();
        }
        , collaboration: {
            allow: false
/*                        , showPanel: false
            , url: 'http://slatebox.com'
            , jsonp: true
            , userName: "Tester"
            , userIP: 1
            , userProfile: ''
            , callbacks: {
                onCollaboration: function (name, msg) {
                    var secs = Math.round(new Date().getTime() / 1000) - startTime;
                    log.push(secs + " secs ago - " + name + ": " + msg.toLowerCase());
                    Slatebox.el("slateMessage").innerHTML = log.reverse().join('<br/>');
                    startTime = Math.round(new Date().getTime() / 1000);
                    upd();
                }
            }
*/

        }
    }).canvas.init({ imageFolder: "/lib/slateboxjs/cursors/" });

	//console.log(_mainSlate.zoomSlider);

	var zoomValue = 15000;
	var zoomDelta = 2500;
	var maxZoom = 200000;	//taken from Slatebox.slate.zoomSlider.js
	var minZoom = 6000; 

	function MouseWheelHandler(e) {

		// cross-browser wheel delta
		var e = window.event || e;
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		if (delta < 0) {
			zoomValue += zoomDelta;
		}
		else {
			zoomValue -= zoomDelta;
		}
		if (zoomValue > maxZoom) zoomValue = maxZoom;
		if (zoomValue < minZoom) zoomValue = minZoom;
		_mainSlate.zoomSlider.set(zoomValue);

		return false;
	}

	var s = document.getElementById("slate");
	if (s.addEventListener) {
		s.addEventListener("mousewheel", MouseWheelHandler, false);
		s.addEventListener("DOMMouseScroll",MouseWheelHandler,false);
	}
	else s.attachEvent("onmousewheel", MouseWheelHandler);


	var _nodes =  [];
	var _edges = [];
	var _nodeIndex = { };

    /*var _nodes = [
        $s.node({ id: 'first_node', text: 'drag', xPos: 5090, yPos: 5120, height: 40, width: 80, vectorPath: 'roundedrectangle', backgroundColor: '90-#ADD8C7-#59a989', lineColor: "green", lineWidth: 2, allowDrag: true, allowMenu: true, allowContext: true })
        , $s.node({ id: 'second_node', text: 'me', xPos: 5290, yPos: 5080, height: 40, width: 100, vectorPath: 'ellipse', backgroundColor: '90-#6A8FBD-#54709a', lineColor: "green", lineWidth: 4, allowDrag: true, allowMenu: true, allowContext: true })
        , $s.node({ id: 'third_node', text: 'around', xPos: 5260, yPos: 5305, height: 40, width: 80, vectorPath: 'rectangle', backgroundColor: '90-#756270-#6bb2ab', lineColor: "blue", lineWidth: 5, allowDrag: true, allowMenu: true, allowContext: true })
    ];*/

	var g = {
		addNode : function(id, n) {
			var x = 5000+Math.random() * 2000;
			var y = 5000+Math.random() * 2000;
			var nn = $s.node({ id: id, text: n.label, xPos: x, yPos: y, height: 40, width: 80, 
					vectorPath: 'roundedrectangle', 
					backgroundColor: n.color, //'90-#ADD8C7-#59a989', 
					lineColor: "green", lineWidth: 2, allowDrag: true, allowMenu: true, allowContext: true })

			_nodes.push(nn);
			_nodeIndex[id] = nn;
		},
		addEdge : function(e, from, to) {
			_edges.push( [ from, to, e] );
		}
	};

	if (withGraph)
		withGraph(g);

    _mainSlate.nodes.addRange(_nodes);
	for (var i = 0; i < _edges.length; i++) {
		console.log(i);
		var ee = _edges[i];
		var f = ee[0];
		var t = ee[1];
		var e = ee[2];

		if (f==t)
			continue;
		if (!_nodeIndex[t]) {
			//console.log('Missing node: ', t);
			continue;
		}
	

		if (_nodeIndex[f])
			_nodeIndex[f].relationships.addAssociation(_nodeIndex[t], { });
		else {
			//console.log('Edge missing node: ', f);
		}
	}



    _mainSlate.init();


}

$(window).bind('resize', function () {
    updateLayout();
});

function updateLayout() {
}
