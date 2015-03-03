window.requestAnimationFrame = function(animationRequester,called){
	setTimeout(function(){
		animationRequester(new Date().getTime());
	},10);
}
function VMLDrawer(){
	this.dimension;
	var parent;

	this.init = function(){
		this.group = $("<div></div>");
		this.background = $('<v:arc></v:arc>');
		this.foreground = $('<v:arc><v:fill opacity="0%"></v:fill></v:arc>');

		this.group.append(this.background);
		this.group.append(this.foreground);
		 
		parent.getHtmlContainer().append(this.group);
	}

	this.setParent = function(prt){
		parent = prt;
	}
	/**
	* @private
	* Draw the frame for the current values
	*/
	this.draw = function(){
		this.background.css({top:(this.dimension.height)/2-parent.settings['background-radius'],left:(this.dimension.width)/2-parent.settings['background-radius'],width:parent.settings['background-radius']*2,height:parent.settings['background-radius']*2});
		var attributes = {strokeweight : parent.settings['background-width'],strokecolor : parent.settings['background-stroke-color'], startangle : this.getAngleFromValue(0), endangle : this.getAngleFromValue(parent.settings.total)};
		if (parent.settings['background-fill']){
			attributes.fillcolor=parent.settings['background-fill-color'];
		}
		this.background.attr(attributes);
	
	
		this.foreground.css({top:(this.dimension.height)/2-parent.settings['foreground-radius'],left:(this.dimension.width)/2-parent.settings['foreground-radius'],width:parent.settings['foreground-radius']*2,height:parent.settings['foreground-radius']*2});
		var attributes = {fillcolor : "transparent", strokeweight : parent.settings['foreground-width'],strokecolor : parent.settings['foreground-color'], startangle : this.getAngleFromValue(0), endangle : this.getAngleFromValue(parent.getCurrentValue())};
		this.foreground.attr(attributes);
	}
	this.setSize = function(width,height){
		this.dimension = { width : width, height : height };
		this.group.attr(this.dimension);
	}
	/**
	* @private
	* Calculate the angle corresponding to the given value
	*/
	this.getAngleFromValue = function(value){
		return Math.floor(Math.min(360,Math.max(-360,(parent.settings['start-point']+value/parent.settings.total*parent.settings['max-angle'])*180+90)));
	}
}
$.fn.circliful.settings.drawer = new VMLDrawer();

