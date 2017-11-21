$(document).ready(function(){
		
            $('.slider').slick({
  dots: true,
  infinite: true,
  speed: 500,
  fade: true,              
  cssEase: 'linear',
  adaptiveHeight: true
            
            });

    $("#tabs").tabs();
    $( "#speed" ).selectmenu();

    $( "#files" ).selectmenu();

    $( "#number" )
      .selectmenu()
      .selectmenu( "menuWidget" )
        .addClass( "overflow" );

    $( "#salutation" ).selectmenu();

	$('#menu').slicknav();

});
