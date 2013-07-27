function renderTrends(s, o, v) {
    var aa = s.get('attention');                    
    var serverTagCount = { };
    var localTagCount = s.getTagCount();
    var selfTagCount = s.getTagCount(true);

    
    var yy = newDiv();
    yy.addClass('Trends_FocusArea');

    var tagCountArea = newDiv();
    tagCountArea.addClass('Trends_TagCountArea');
    tagCountArea.append('Known objects: ' + _.size(aa));
    tagCountArea.append('<br/>');

    v.append(yy);
    v.append(tagCountArea);
        
    var labels = [];
    var values = [];
    
    function displayTags() {
        var tags = _.union(_.keys(serverTagCount), _.keys(localTagCount), _.keys(selfTagCount));
        
        for (var k = 0; k < tags.length; k++) {
            var ti = tags[k];
            
            var name = ti;
            var t = s.tag(ti);
            
            if (t!=undefined)
                name = t.name;
            else
                name = ti;                
            
            var d = $('<div/>');
            //var url = '#/tag/' + ti;            
            var url = '#';
            //var fs = 3.0 + Math.log(1+tagCount[k])*0.2;            
            //var ab = $('<a href="' + url + '" style="font-size:' + (100.0 * fs) +'%">' + name + '</a>');
            
            var ab;
            
            if (t!=undefined)
                ab = newTagButton(t);
            else
                ab = $('<a href="' + url + '">' + name + '</a>');
                
            ab.click(function() {
                s.set('currentView', 'list');
                Backbone.history.navigate(url, true);  
            });
            
            var vv = $('<p/>');
            
            d.append(ab);
            d.addClass('trendTagLabel');
            vv.append(d);
            
            /*
            var f = $('<div>' + _n(selfTagCount[ti]) + '</div>' );
            f.addClass('trendTagCount');
            vv.append(f);

            var e = $('<div>' + _n(localTagCount[ti]) + '</div>' );
            e.addClass('trendTagCount');
            vv.append(e);            
            
            var g = $('<div>' + _n(serverTagCount[ti]) + '</div>' );
            g.addClass('trendTagCount');
            vv.append(g);*/
            
            var total = (selfTagCount[ti]||0) + (localTagCount[ti] || 0) + (serverTagCount[ti] || 0);
            d.attr('style', 'font-size:' + 100.0 * (1.0 + Math.log( total + 1 ))*0.5 + '%');
            
            tagCountArea.append(vv);
            
    	}
        
    }
    
    s.getServerAttention(function(r) {
        serverTagCount = r;
        displayTags();
    });
    
    var updateFocusInterval = 5 * 1000;
    var focusHistory = 60 * 10; //10 mins
    var displayIntervals = 8;
    
    function newFocusHistory(focuses) {
	var now = Date.now();
	var whenCreated = function(f) { return f.whenCreated; };
	var oldest = (_.min(focuses, whenCreated)).whenCreated;
	var newest = (_.max(focuses, whenCreated)).whenCreated;

	var focusBins = (newest == oldest) ? 
		{ 0: focuses } :
		_.groupBy(focuses, function(f) {
			var t = f.whenCreated;
			var prop = (t - oldest) / (newest - oldest);
			var bin = Math.min(
				Math.floor(prop * displayIntervals),
				displayIntervals-1
			);
			return bin;
		});
	
	var d = newDiv();
	for (var i = displayIntervals-1; i >=0; i--) {
		var fs = focusBins[i];
		if (!fs) continue;

		var e = newDiv();
		e.attr('style', 'padding: 0.25em; margin-bottom: 0.25em; border: 1px solid gray;'); //TODO add CSS
		if (displayIntervals-1 == i) {
			e.append('Now:<br/>');
		}

		for (var k = 0; k < fs.length; k++) {
			var ff = fs[k];
			var rv = (objCompact(ff)).value;
			e.append(rv ? 
				JSON.stringify(rv,null,4) + '&nbsp;' : 
				'["Empty"]');

		}
		e.appendTo(d);
	}

	return d;
    }

    function updateFocus() {
        $.getJSON('/focus/' + focusHistory, function(result) {
            yy.html(newFocusHistory(result));
        });
    }
    setTimeout(updateFocus, updateFocusInterval);
    updateFocus();
       
}
