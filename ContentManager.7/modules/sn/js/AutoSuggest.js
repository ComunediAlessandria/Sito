
// TBD: completare

sn = window.sn || {};

sn.AutoSuggest = function(el, opt) {
	
	this.el = $(el);

//	this.opt = jQuery.extend({}, {
//	}, opt);

	this.opt = jQuery.extend(opt, {
		'debug': false,
		'url': '/suggest.cfc',
		'size': 10,
		'cacheenabled': true,
		'cacheaggressive': false,
		'cachefoward':false, //true - complete cache dataset, false - incomplete cache datasets
	    'casesensitive': false,
		'sort': true,
		'css0': {'position':'absolute', 'z-index':'1', 'display':'none'},
		'css': {'background-color':'#ffffff', 'border':'solid 1px #000000', 'margin':'0px',
		'cursor':'pointer', 'color':'#000000', 'padding':'0px'},
		'highlight': '#bcd5ff'
	});

	this.tm = null;
	this.synctext = false;
	
	this.attach();
};

sn.AutoSuggest.prototype.setCase = function(v) {

	return this.opt.casesensitive ? v : v.toLowerCase();
};

sn.AutoSuggest.prototype.onKeydown = function(e) {

	if (this.tm != null)
		clearTimeout(this.tm);

	if (e.which == 38 || e.which == 40) {

		this.el.next().children("div:eq(" + this.el.attr('suggestPos') + ')').blur();

		switch (e.which) {
			
			case 38: //up
			
				if (parseInt(this.el.attr('suggestPos'), 10) - 1 < -1)
					this.el.attr('suggestPos', this.el.attr('suggestTtl'));
				else
					this.el.attr('suggestPos', Math.max(-2, parseInt(this.el.attr('suggestPos'), 10) - 1));

				break;
                    
			case 40: //down

				if (parseInt(this.el.attr('suggestPos'), 10) + 1 > parseInt(this.el.attr('suggestTtl'), 10))
					this.el.attr('suggestPos', -1);
				else
					this.el.attr('suggestPos', Math.min(this.el.attr('suggestTtl'), parseInt(this.el.attr('suggestPos'), 10) + 1));

				break;
		}
        
		this.synctext = true;        
		this.el.next().children('div:eq(' + this.el.attr('suggestPos') + ')').focus();

	} else if (e.which == 13){
		
		if (this.el.attr('nosubmit') != null) {
			//$(obj).next().hide();
			return false;           
		}    
	}
};

sn.AutoSuggest.prototype.onKeyup = function(e) {

	var objval = this.el.value;

	if (this.opt.debug) timerstart = new Date().getTime();
	  
	if (objval == this.el.attr('suggestLast'))
		return;

	if (objval.length == 0) {

		this.el
			.attr('suggestLast', objval)
			.next()
				.hide()
		;

		return;
	} 
		
       $(obj).attr("suggestLast", objval);
       
       var method = obj.form.name + '_' + obj.name;
       var surl = $.gsuggest.config.url + "?method="+method+"&value="+objval+"&callback=?"
       var data, datat;

	   //fill() *must* be single threaded via fillok	       
       function fill(data){
	   	   while(!fillok){};
		   fillok = false;
		   
		   $(obj).next().empty();
		   //$(obj).next().hide(); *we dont need to hide it unless the results are empty
	   
	   		if ($.gsuggest.config.sort) data.sort();
	   
            $(obj).attr("suggestTtl", Math.min($.gsuggest.config.size, data.length));
            for (i = 0; i < data.length; i++){
                $(obj).next().append("<div style=\"padding: 3px;\">" + data[i].substr(0, objval.length) + "<strong>" + data[i].substring(objval.length) + "</strong></div>");
                if ( i == $.gsuggest.config.size ) break;
            }
            
            if (i > 0 && !(data.length == 1 && $.gsuggest.setcase(data[0]) == $.gsuggest.setcase(objval))){
                $(obj).attr("suggestPos", "-1");
                //$(obj).next().slideDown("fast");
				$.gsuggest.synctext = false;
                $.gsuggest.mouseoverok = false;
				$(obj).next().show();
            } else {
				$(obj).next().hide();
			}
			
			fillok = true;
       }
       		
	   //cache roll back -force cache forward if ttl suggest items less than max
		if (objval.indexOf($.gsuggest.cachekey) != 0 || (!$.gsuggest.config.cacheforward && !($(obj).attr("suggestTtl") < $.gsuggest.config.size))){ 
	   	   $.gsuggest.cachekey = $.gsuggest.setcase(objval);
	   }
	   //console.log("key: " + $.gsuggest.cachekey);
       if ($.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey] || ($(obj).attr("suggest_value") != null && $(obj).attr("suggest_value").length > 0)){
		   if (!$.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey] || !$.gsuggest.config.cacheenabled){
		   	   $.gsuggest.config.cacheforward = true;
		   	   datat = eval($(obj).attr("suggest_value"));
			   if ($.gsuggest.config.debug)$("#_debug").html("CACHE INIT<br>"+datat.join("<br>"));
		   }else{
		   	   datat = $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey];	
			   if ($.gsuggest.config.debug)$("#_debug").html(datat.join("<br>"));	   
		   }
		   
	   	
           data = [];
           $.each(datat, function(i, val){
		   		if ($.gsuggest.setcase(val).indexOf($.gsuggest.setcase(objval)) == 0){
                	data.push(val);
                }
           })

		   if ($.gsuggest.config.cacheenabled){ $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)] = data; $.gsuggest.cachekey = $.gsuggest.setcase(objval)}
           fill(data); 
       }else{
           $.getJSON(surl, function(data){if ($.gsuggest.config.cacheenabled){ $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)] = data; $.gsuggest.cachekey = $.gsuggest.setcase(objval); if ($.gsuggest.config.debug)$("#_debug").html("CACHE INIT<br>"+$.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)].join("<br>"));} fill(data)}); 	   
       }    

	   if ($.gsuggest.config.debug){
	   	  timerend = new Date().getTime();
	      $("#_debug_timer").html(timerend-timerstart);
	   }
};

(function($) {
$.gsuggest = function(settings){ 

/*
$.gsuggest.config = {
	'debug': false,
	'url': '/suggest.cfc',
	'size': 10,
	'cacheenabled': true,
	'cacheaggressive': false,
	'cachefoward':false, //true - complete cache dataset, false - incomplete cache datasets
    'casesensitive': false,
	'sort': true,
	'css0': {'position':'absolute', 'z-index':'1', 'display':'none'},
	'css': {'background-color':'#ffffff', 'border':'solid 1px #000000', 'margin':'0px', 'cursor':'pointer', 'color':'#000000', 'padding':'0px'},
	'highlight': '#bcd5ff'
	};

if (settings) $.extend($.gsuggest.config, settings);
*/

var fillok = true;
var cacheinit = true;

var timerstart = null;
var timerend = null;

$.gsuggest.cachedata = [];
$.gsuggest.cachekey = "";

$.gsuggest.synctext = false;
$.gsuggest.mouseoverok = false;
$.gsuggest.mousepos = "";

/*
$.gsuggest.setcase = 
    function(val){
        if ($.gsuggest.config.casesensitive)
            return val;
        else
            return val.toLowerCase();
    };

$.gsuggest.keydown =
    function(obj, e){ 
		clearTimeout($.gsuggest.suggestDelay);

        if (e.which == 38 || e.which == 40){
            $(obj).next().children("div:eq("+$(obj).attr("suggestPos")+")").blur();
        
            switch (e.which){
                case 38: //up
                    if (parseInt($(obj).attr("suggestPos"))-1 < -1)
                        $(obj).attr("suggestPos", $(obj).attr("suggestTtl"));
                    else
                        $(obj).attr("suggestPos", Math.max(-2, parseInt($(obj).attr("suggestPos"))-1));
                    break;
                    
                case 40: //down
                     if (parseInt($(obj).attr("suggestPos"))+1 > parseInt($(obj).attr("suggestTtl")))
                        $(obj).attr("suggestPos", "-1");
                     else   
                        $(obj).attr("suggestPos", Math.min($(obj).attr("suggestTtl"), parseInt($(obj).attr("suggestPos"))+1));
        
                     break;
            }
        
            $.gsuggest.synctext = true;        
            $(obj).next().children("div:eq("+$(obj).attr("suggestPos")+")").focus();
        } else if (e.which == 13){
           if ($(obj).attr("nosubmit") != null){
               //$(obj).next().hide();
               return false;           
           }    
        }
    };

*/
    
$.gsuggest.keyup = 
    function(obj){
	   var objval = obj.value;
	   
	   //console.dir($.gsuggest.cachedata);
	   if ($.gsuggest.config.debug)timerstart = new Date().getTime();
	  
       if (objval == $(obj).attr("suggestLast")) return;

	   if (objval.length == 0){
            $(obj).attr("suggestLast", objval);
            $(obj).next().hide();
            return;
        } 
		
       $(obj).attr("suggestLast", objval);
       
       var method = obj.form.name + '_' + obj.name;
       var surl = $.gsuggest.config.url + "?method="+method+"&value="+objval+"&callback=?"
       var data, datat;

	   //fill() *must* be single threaded via fillok	       
       function fill(data){
	   	   while(!fillok){};
		   fillok = false;
		   
		   $(obj).next().empty();
		   //$(obj).next().hide(); *we dont need to hide it unless the results are empty
	   
	   		if ($.gsuggest.config.sort) data.sort();
	   
            $(obj).attr("suggestTtl", Math.min($.gsuggest.config.size, data.length));
            for (i = 0; i < data.length; i++){
                $(obj).next().append("<div style=\"padding: 3px;\">" + data[i].substr(0, objval.length) + "<strong>" + data[i].substring(objval.length) + "</strong></div>");
                if ( i == $.gsuggest.config.size ) break;
            }
            
            if (i > 0 && !(data.length == 1 && $.gsuggest.setcase(data[0]) == $.gsuggest.setcase(objval))){
                $(obj).attr("suggestPos", "-1");
                //$(obj).next().slideDown("fast");
				$.gsuggest.synctext = false;
                $.gsuggest.mouseoverok = false;
				$(obj).next().show();
            } else {
				$(obj).next().hide();
			}
			
			fillok = true;
       }
       		
	   //cache roll back -force cache forward if ttl suggest items less than max
		if (objval.indexOf($.gsuggest.cachekey) != 0 || (!$.gsuggest.config.cacheforward && !($(obj).attr("suggestTtl") < $.gsuggest.config.size))){ 
	   	   $.gsuggest.cachekey = $.gsuggest.setcase(objval);
	   }
	   //console.log("key: " + $.gsuggest.cachekey);
       if ($.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey] || ($(obj).attr("suggest_value") != null && $(obj).attr("suggest_value").length > 0)){
		   if (!$.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey] || !$.gsuggest.config.cacheenabled){
		   	   $.gsuggest.config.cacheforward = true;
		   	   datat = eval($(obj).attr("suggest_value"));
			   if ($.gsuggest.config.debug)$("#_debug").html("CACHE INIT<br>"+datat.join("<br>"));
		   }else{
		   	   datat = $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey];	
			   if ($.gsuggest.config.debug)$("#_debug").html(datat.join("<br>"));	   
		   }
		   
	   	
           data = [];
           $.each(datat, function(i, val){
		   		if ($.gsuggest.setcase(val).indexOf($.gsuggest.setcase(objval)) == 0){
                	data.push(val);
                }
           })

		   if ($.gsuggest.config.cacheenabled){ $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)] = data; $.gsuggest.cachekey = $.gsuggest.setcase(objval)}
           fill(data); 
       }else{
           $.getJSON(surl, function(data){if ($.gsuggest.config.cacheenabled){ $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)] = data; $.gsuggest.cachekey = $.gsuggest.setcase(objval); if ($.gsuggest.config.debug)$("#_debug").html("CACHE INIT<br>"+$.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)].join("<br>"));} fill(data)}); 	   
       }    

	   if ($.gsuggest.config.debug){
	   	  timerend = new Date().getTime();
	      $("#_debug_timer").html(timerend-timerstart);
	   }
	   
    };     

    $("input[suggest=yes]").each(function(i){
        if (this.id == null || this.id == '')
            $(this).attr("id", "_g��gg꧆_"+i)
            
        Init("#" + this.id)}
    );
    
    function Init(id){
        var suggest_id = "_suggestBox";
        var suggest_idChildren = "#" + suggest_id + " > *";

        $(id).attr("autocomplete", "off");
		$(id).keyup(function(e){if (e.which == 27){ $(this).blur(); $(this).focus(); if (!$.gsuggest.config.cacheaggressive){$.gsuggest.cachedata=[]; $.gsuggest.cachekey=""}} else if (e.which < 37 || e.which > 40) {$.gsuggest.suggestDelay = setTimeout("$.gsuggest.keyup(document.getElementById('"+$(this).attr("id")+"'))", (!!$.gsuggest.cachedata[$(this).attr("id")+$.gsuggest.cachekey])?50:(e.which == 13)?0:500);}});
		$(id).click(function(){$(this).blur(); $(this).focus()});
        $(id).blur(function(){$.gsuggest.mouseout = false; $(this).next().hide("slow"); $(this).attr("suggestPos", "-1");});
        $(id).attr("suggestPos", "-1");
        $(id).keydown(function(e){return $.gsuggest.keydown(this, e)});
        
        //set event handlers for suggest-box | no propgation
        $(suggest_idChildren).live("mouseover", function(e){if (!$.gsuggest.mouseoverok) return false; $(this).parent().children("div:eq("+$(this).parent().prev().attr("suggestPos")+")").blur(); $(this).parent().prev().attr("suggestPos", $(this).prevAll().length); $(this).focus(); $.gsuggest.synctext=true; return false}); 
        $(suggest_idChildren).live("mouseout", function(){$(this).blur(); return false;});
		$(suggest_idChildren).live("focus", function(){$(this).css("background-color", $.gsuggest.config.highlight); if($.gsuggest.synctext){$(this).parent().prev().attr("value", $(this).text())}; return false;});
        $(suggest_idChildren).live("blur", function(){$(this).css("background-color", $(this).parent().css("background-color")); $(this).parent().prev().attr("value", $(this).parent().prev().attr("suggestLast")); return false;});
        $(suggest_idChildren).live("click", function(){$(this).parent().prev().attr("suggestLast", $(this).text()); $(this).blur(); $(this).parent().prev().focus(); return false;});
    
        //create suggest-box, set width, and position
        $(id).after("<div id=\""+suggest_id+"\" style=\"display:none\"></div>");
		$(id).next().css($.gsuggest.config.css0);
        $(id).next().css($.gsuggest.config.css);
        $(id).next().width($(id).width());
        $(id).next().css("left", $(id).offset().left);
        $(id).next().css("top", $(id).offset().top+$(id).height()+7);
    };
};
})(jQuery);

jQuery(document).ready(function(){
   $().mousemove(function(e){
	  
	  if ($.gsuggest.mousepos != e.pageX+'-'+e.pageY){
      	$.gsuggest.synctext = true;
        $.gsuggest.mouseoverok = true;
	  }
	  $.gsuggest.mousepos = e.pageX+'-'+e.pageY;
   }); 
})

//init
//jQuery(document).ready(function(){jQuery.gsuggest({'debug':true})});
//requires cache sets to be tied to attributes


/*
I have not decided if I want to add text-range support for autocomplete; my intent
was to memic the behavior of googles suggest and I feel that I have done this. However
I may decided to implement this as an optional setting in the future... */