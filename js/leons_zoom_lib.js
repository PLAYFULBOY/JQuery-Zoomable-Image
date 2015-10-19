/*
leonsZoomLib.js

*/
(function($){
   var leonsZoomLib = function(element, options)
   {
       var container = $(element);
       var obj = this;
	   
		if (!options){options = {};}

		var settings = $.extend({
		loading:$("<img src='images/loading.gif' />"),
		images: Array(),
		width: 0,
		height: 0,
		widthOffset: 0,
		heightOffset: 0,
		maxZoom: 0,
		whenLoaded: function(){}
		},options);
		
       var imgSmall,imgSmall_x,imgSmall_y,imgLarge,imgLarge_x,imgLarge_y,zoom_factor,zoom_x,zoom_y;
	   var preloadedImages = new Array();
	   var imagesLoaded;
	     
		this.addZoom = function(){
			
			imagesLoaded = 0;
			
			imgSmall = new Image();
			imgLarge = new Image();
			
			imgSmall.src=settings.images[0];
			imgLarge.src=settings.images[1];
			
			imgSmall=$(imgSmall);
			imgLarge=$(imgLarge);
			
			//load both images and grab dimensions before use;
			imgSmall.bind('load', function() {				
				imagesLoaded++;
				if (settings.width < 1 || settings.height < 1){
					imgSmall_x = this.width;
					imgSmall_y = this.height;
				}else{
					imgSmall_x = settings.width;
					imgSmall_y = settings.height;
				}
				//to prevent firefox garbage collection bug				
				imageCache = imgSmall.clone();
				imageCache.unbind();
				imageCache.css('display','none');
				imageCache.appendTo($('body'));
					
				obj.completeLoad();				
			  });
			  if(imgSmall.complete){ 
				imgSmall.load();
			  }
			
			imgLarge.bind('load', function() {
				imagesLoaded++;
				imgLarge_x = this.width;
				imgLarge_y = this.height;	
				//to prevent firefox garbage collection bug						
				imageCache = imgLarge.clone();
				imageCache.unbind();
				imageCache.css('display','none');
				imageCache.appendTo($('body'));
				
				obj.completeLoad();
			  });
			  if(imgLarge.complete){ 
				imgLarge.load();
			  }
			
			//preload other images
			if (settings.images.length>1){
				for(i=2;i<settings.images.length;i++){				
					var image = new Image();
					image.src=settings.images[i];
					image=$(image);
									
					//to prevent firefox garbage collection bug						
					image.css('display','none');
					image.appendTo($('body'));
					//---
					
					image.bind('load', function() {
						imagesLoaded++;						
						obj.completeLoad();						
					})	
					if(image.complete){ 
						image.load();
					}
				}
			}
			container.empty();
			container.css('text-align','center');
			container.css('padding-top','50px');
			settings.loading.appendTo(container);
			
			$(container).on('contextmenu', 'img', function(e){ return false; });
			
		  $(container).mousedown(function(e){ 
			if( e.button == 2 ){ 
			   obj.ZoomOut();				   
			   e.preventDefault(); 
			   e.stopPropagation();
			  return false; 
			} 
			return true; 
		  }); 
		  
			container.click(function(e){
				if (zoom_factor == settings.maxZoom && settings.maxZoom > 0){
					return true;
				}
				p=$(this).offset();						
				if (zoom_factor == 0){				
					//just the x,y as there's no diff yet	
					x = e.pageX; 
					y = e.pageY;  							
					//compensate for window position on page					
					x = (x-p.left)+settings.widthOffset;
					y = (y-p.top)+settings.heightOffset;					
					
					//rescale for image change
					x = x/imgSmall_x;
					y = y/imgSmall_y;				
					//rescale for image change
					x = x*imgLarge_x;
					y = y*imgLarge_y;					
					//add half the window to each dimension to center our target
					x = x-(imgSmall_x/2);
					y = y-(imgSmall_y/2);					
					//increment the zoom factor
					obj.changeZoomFactor(zoom_factor+1);					
				}else{
					i=imgLarge.position();					
					//pic starts for co-ordinates 0,0 
					x_zeropoint = (imgLarge_x*zoom_factor)-imgSmall_x; 
					y_zeropoint = (imgLarge_y*zoom_factor)-imgSmall_y;
					
					//where it is now
					x_currOffset = i.left; 
					y_currOffset = i.top;
					
					//diff
					x_diff = (x_zeropoint-x_currOffset); 
					y_diff = (y_zeropoint-y_currOffset);
					
					//the offset from dragging + the click gives us the co-ordinates in the image			
					x = e.pageX+x_diff;
					y = e.pageY+y_diff; 

					//compensate for window position on page								
					x = (x-p.left)+settings.widthOffset;
					y = (y-p.top)+settings.heightOffset;
					
					//our co-ordinates are for our current zoom level so lets base them down
					x = x / zoom_factor;
					y = y / zoom_factor;
					
					//okay, lets set our new factor and adjust our co-ordinates to scale
					obj.changeZoomFactor(zoom_factor+1);
					x = x * zoom_factor;
					y = y * zoom_factor;
					
					//add half the window to each dimension to center our target
					x = x-(imgSmall_x/2);
					y = y-(imgSmall_y/2);				
				}
				obj.ZoomTo(x,y);
			});
		}		
		this.completeLoad = function(){				
			if (settings.images.length==imagesLoaded){
				imgSmall.unbind('load');
				imgLarge.unbind('load');
				settings.whenLoaded();
				obj.zoomReset();
			}		
		}
		this.ZoomIn = function(){	
			if (zoom_factor == settings.maxZoom && settings.maxZoom > 0){
					return true;
			}
			if (zoom_factor > 0){
				i=imgLarge.position();		
				//pic starts for co-ordinates 0,0 
				x_zeropoint = (imgLarge_x*zoom_factor)-imgSmall_x; 
				y_zeropoint = (imgLarge_y*zoom_factor)-imgSmall_y;		
				//where it is now
				x_currOffset = i.left; 
				y_currOffset = i.top;		
				//diff
				x = (x_zeropoint-x_currOffset); 
				y = (y_zeropoint-y_currOffset);		
				//remove our centering, which doesn't scale
				x = x+(imgSmall_x/2);
				y = y+(imgSmall_y/2);
				//our co-ordinates are for our current zoom level so lets base them down
				x = x / zoom_factor;
				y = y / zoom_factor;
				//okay, lets set our new factor and adjust our co-ordinates to scale
				obj.changeZoomFactor(zoom_factor+1);
				x = x * zoom_factor;
				y = y * zoom_factor;
				//add half the window to each dimension to center our target
				x = x-(imgSmall_x/2);
				y = y-(imgSmall_y/2);
				//go to the co-ordinates
				obj.ZoomTo(x,y);
			}else{
				obj.changeZoomFactor(zoom_factor+1);
				obj.ZoomTo(imgSmall_x/2,imgSmall_y/2);
			}
		}
		this.ZoomOut = function(){
			if (zoom_factor > 0){
				i=imgLarge.position();		
				//pic starts for co-ordinates 0,0 
				x_zeropoint = (imgLarge_x*zoom_factor)-imgSmall_x; 
				y_zeropoint = (imgLarge_y*zoom_factor)-imgSmall_y;		
				//where it is now
				x_currOffset = i.left; 
				y_currOffset = i.top;		
				//diff
				x = (x_zeropoint-x_currOffset); 
				y = (y_zeropoint-y_currOffset);		
				//remove our centering, which doesn't scale
				x = x+(imgSmall_x/2);
				y = y+(imgSmall_y/2);
				//our co-ordinates are for our current zoom level so lets base them down
				x = x / zoom_factor;
				y = y / zoom_factor;
				//okay, lets set our new factor and adjust our co-ordinates to scale
				obj.changeZoomFactor(zoom_factor-1);
				x = x * zoom_factor;
				y = y * zoom_factor;
				//add half the window to each dimension to center our target
				x = x-(imgSmall_x/2);
				y = y-(imgSmall_y/2);
				//go to the co-ordinates
				obj.ZoomTo(x,y);
			}else{		
				obj.zoomReset();
			}
		}
		this.ZoomTo = function(x,y){			
			//destination co-ordinates in image relative to zoom level
			zoom_x = x;
			zoom_y = y;
			
			//if they backed up to the top, reset
			if (zoom_factor < 1){
				obj.zoomReset();
				return true;
			}
			//prepare our this.container
			container.css('cursor','move');
			container.empty();
			//make our box for limiting the draggable images
			dragContainer = $('<div></div>');
			dragContainer.css('position','absolute');
			//size the box to twice the image size minus the window overlap
			boxWidth=parseInt(((imgLarge_x*2)*zoom_factor)-(imgSmall_x));
			boxHeight=parseInt(((imgLarge_y*2)*zoom_factor)-(imgSmall_y));				
			dragContainer.css('width',boxWidth+'px');
			dragContainer.css('height',boxHeight+'px');
			//position the box back from the window to allow scrolling
			boxOffsetX=parseInt(((imgLarge_x)*zoom_factor)-(imgSmall_x));
			boxOffsetY=parseInt(((imgLarge_y)*zoom_factor)-(imgSmall_y));
			dragContainer.css('left','-'+boxOffsetX+'px');
			dragContainer.css('top','-'+boxOffsetY+'px');
			
			//place our image
			imgLarge.css('position','absolute');
			//work out where 0,0 would be
			x_zeropoint = (imgLarge_x*zoom_factor)-imgSmall_x;
			y_zeropoint = (imgLarge_y*zoom_factor)-imgSmall_y;
			
			//bounds check our co-ordinates
			if (zoom_x > x_zeropoint){
				zoom_x = x_zeropoint;
			}
			if (zoom_y > y_zeropoint){
				zoom_y = y_zeropoint;
			}
			if (zoom_x < 0){
				zoom_x = 0;
			}
			if (zoom_y < 0){
				zoom_y = 0;
			}		
			//calculate new positions
			newX = parseInt(x_zeropoint-(zoom_x));
			newY = parseInt(y_zeropoint-(zoom_y));
			newWidth = parseInt(imgLarge_x*zoom_factor);
			newHeight = parseInt(imgLarge_y*zoom_factor);
			//apply new positions
			imgLarge.css('left',newX+'px');
			imgLarge.css('top',newY+'px');
			imgLarge.css('width',newWidth+'px');
			imgLarge.css('height',newHeight+'px');
			imgLarge.css('margin','0px !important');
			imgLarge.css('margin-left','0px !important');
			imgLarge.css('margin-top','0px !important');
			imgLarge.css('margin-right','0px !important');
			imgLarge.css('margin-bottom','0px !important');
			
			//append our bounding box to the window
			dragContainer.appendTo(container);
			//append our image to the bounding box, specifying it as the limit of drag
			imgLarge.draggable({ containment: "parent" }).appendTo(dragContainer);
		}
		this.zoomReset = function(){
			
			container.css('cursor','');
			container.css('padding-top','');
			container.css('text-align','');
			container.empty();	
			imgSmall.css('width',imgSmall_x+'px');
			imgSmall.css('height',imgSmall_y+'px');
			imgSmall.appendTo(container);
			zoom_x = 0;
			zoom_y = 0;					
			obj.changeZoomFactor(0);
			
			container.css('position','relative');
			container.css('top','0px');
			container.css('left','0px');
			container.css('overflow','hidden');
			container.css('width',imgSmall_x+'px');
			container.css('height',imgSmall_y+'px');
		}
		this.moveLeft = function(){
			obj.ZoomTo((zoom_x+imgSmall_x*0.8),(zoom_y));
		}
		this.moveUp = function(){
			obj.ZoomTo((zoom_x),(zoom_y-imgSmall_y*0.8));
		}
		this.moveRight = function(){
			obj.ZoomTo((zoom_x-imgSmall_x*0.8),(zoom_y));
		}
		this.moveDown = function(){
			obj.ZoomTo((zoom_x),(zoom_y+imgSmall_x*0.8));
		}
		this.changeZoomFactor = function(new_zoom_factor){			
			//apply the max zoom factor here
			if (new_zoom_factor > settings.maxZoom && settings.maxZoom > 0){
				zoom_factor = settings.maxZoom;			
			}else{
				zoom_factor = new_zoom_factor;
			}			
			//if there's an image set for this zoom factor lets use it
			if( typeof settings.images[zoom_factor] != "undefined" ){
				imgLarge.attr('src',settings.images[zoom_factor]);				
			}
		}   
		this.addZoom();
   
   };
   $.fn.leonsZoomLib = function(options)
   {       
           var element = $(this);
          
           // Return early if this element already has a plugin instance
           if (element.data('leonsZoomLib')) return;

           // pass options to plugin constructor
           var pluginInstance = new leonsZoomLib(this, options);

           // Store plugin object in this element's data
           element.data('leonsZoomLib', pluginInstance);
		   
		   return pluginInstance;    
   };
})(jQuery);