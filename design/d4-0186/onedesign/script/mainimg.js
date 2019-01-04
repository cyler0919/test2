jQuery(function($){


 var imgbannereFfect = function(element, options){
   var settings = $.extend({}, $.fn.imgbannereffect.defaults, options); //초반 셋팅값 가져오기
     var vars = {
            currentSlide: 0,
			oldSlide: 0,
			startSlide: 0,
            currentImage: '',
			totaltab: 0,	
			currenttab: 0,	
			arrawidth:0,
			arrawidth2:0,
            totalSlides: 0,
	        randAnim: '',
            running: false,
            paused: false,
            stop: false
        };

       var slider = $(element);		
	    //이미지사이즈
	   
 	    slider.find('.vi').each(function() {
	       	
			  vars.totalSlides++;
		});    

 /*
 랜덤부분
	vars.currentSlide = Math.floor(Math.random() * vars.totalSlides);
    vars.oldSlide = vars.currentSlide;
	
 */

    $(".bull[rel=" + vars.currentSlide + "]",slider).addClass("active");
    $(".vi[rel=" + vars.currentSlide + "]",slider).css({'z-index':20,opacity:1});
     

   
	 var timer = 0;
	timer = setInterval(function(){ imgeffectRun2(slider, settings, false); }, settings.pauseTime);




	var imgeffectRun2 = function(slider, settings, nudge){
       //Trigger the lastSlide callback
	     
            if(vars && (vars.currentSlide == vars.totalSlides - 1)){ 
				settings.lastSlide.call(this);
			}
            if((!vars || vars.stop) && !nudge) return false;
			settings.beforeChange.call(this);
			vars.currentSlide++;		
			
			if(vars.currentSlide == vars.totalSlides){ 
				vars.currentSlide = 0;
				settings.slideshowEnd.call(this);
			}
			
                $(".bull", slider).removeClass("active");
				$(".bull[rel=" + vars.currentSlide + "]", slider).addClass("active");
			
                 $('.vi[rel=' + vars.oldSlide + ']', slider).css({'z-index':1}).animate({opacity: 0}, settings.animSpeed);
                 $('.vi[rel=' + vars.currentSlide + ']', slider).css({'z-index':20}).animate({opacity: 1}, settings.animSpeed);
			

          vars.oldSlide = vars.currentSlide;
	}
   
   $(".bull", slider).click(function(){
	      vars.currentSlide = $(this).index() -1;
		imgeffectRun2(slider,  settings, false);
           
   });
   
     //오버설정
    slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';              

            }, function(){
                vars.paused = false;
				
                //Restart the timer
				if(timer == '' && !settings.manualAdvance){
					timer = setInterval(function(){   imgeffectRun2(slider,  settings, false);	}, settings.pauseTime);
				}
      });


 }

  
 $.fn.imgbannereffect = function(options) {
    //데이터 로딩셋팅
        return this.each(function(key, value){
            var element = $(this);
			
			 imgbannereFfect($(element), options);
        });

	};

//Default settings
	$.fn.imgbannereffect.defaults = {
		animSpeed: 600, //이벤트 속도
		pauseTime: 3500, //대기시간
		moveType: "left", //이동방향
		tailType: "number", //버튼타입
		pauseOnHover: true,
		beforeChange: function(){},
		afterChange: function(){},
		slideshowEnd: function(){},
        lastSlide: function(){},
        afterLoad: function(){}
	};
	
	$.fn._reverse = [].reverse;

});







jQuery(function($){
		$(window).ready(function() {
			          	 $('#slideshow1').imgbannereffect();
                            //$('#imageScroller1').shopeffect();

		
		});
});

jQuery(function($){
		$(window).ready(function() {
			          	 $('#slideshow2').imgbannereffect();
                            //$('#imageScroller2').shopeffect();

		
		});
});