function SVGDrawer(){

		this.dimension;
		var parent;
		
		this.init = function(){
			this.svg = $('<svg width="100" height="100"></svg>');
			this.background = this.makeSVG('path',{});
			this.foreground = this.makeSVG('path',{});
		
			this.svg.append(this.background);
			this.svg.append(this.foreground);
			parent.getHtmlContainer().append(this.svg);
		}
		
		this.setParent = function(prt){
			parent = prt;
		}
		this.makeSVG=function (tag, attrs) {
            var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
            for (var k in attrs)
                el.setAttribute(k, attrs[k]);
            return jQuery(el);
        }
		/**
		* @private
		* Draw the frame for the current values
		*/
		this.draw = function(){
			var startPoint = this.getPointFromValue(0,parent.settings['background-radius']);
			var endPoint = this.getPointFromValue(parent.settings.total*0.99999,parent.settings['background-radius']);
			this.background.attr({ d: "M "+startPoint.x+" "+startPoint.y+" A "+parent.settings['background-radius']+" "+parent.settings['background-radius']+" 0 1 1 "+(endPoint.x)+" "+(endPoint.y), stroke: parent.settings['background-stroke-color'], 'stroke-width': parent.settings['background-width'], fill: parent.settings['background-fill']?parent.settings['background-fill-color']:"transparent" });

			var startPoint = this.getPointFromValue(0,parent.settings['foreground-radius']);
			var endPoint = this.getPointFromValue(parent.currentValue*0.99999,parent.settings['foreground-radius']);
			this.foreground.attr({ d: "M "+startPoint.x+" "+startPoint.y+" A "+parent.settings['foreground-radius']+" "+parent.settings['foreground-radius']+" 0 "+(parent.currentValue/parent.settings.total>0.5?"1":"0")+" 1 "+(endPoint.x)+" "+(endPoint.y), stroke: parent.settings['foreground-color'], 'stroke-width': parent.settings['foreground-width'] ,"fill" : "transparent"});

		}
		this.setSize = function(width,height){
			this.dimension = { width : width, height : height };
			this.svg.attr(this.dimension);
		}
		/**
		* @private
		* Calculate the angle corresponding to the given value
		*/
		this.getPointFromValue = function(value,radius){
			var angle = (parent.settings['start-point']+value/parent.settings.total*parent.settings['max-angle'])*Math.PI;
			var center = { x : this.dimension.width/2 , y : this.dimension.height/2};
			center.x += radius*Math.cos(angle);
			center.y += radius*Math.sin(angle);
			return center;
		}
}
$.fn.circliful.settings.drawer = new SVGDrawer();
