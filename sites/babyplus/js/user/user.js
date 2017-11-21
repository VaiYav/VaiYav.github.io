$(document).ready(function(){
                    $('.navbar-fixed').click(function(){
                        $('.navbar-fixed').toggleClass('menucopy');
                    });
                    $('.slider').slick({
                        dots: true,
                        infinite: true,
                        speed: 900,
                           fade: true,
                            cssEase: 'linear'
                        });
    
    $('.navbar-fixed').on('click', function () {
        if ($(this).data('state') == 0) {
            $(this).removeClass('opened');
    
        } else {
            $(this).data('state',0);
            $(this).addClass('opened');
        }
    });
                    
                });