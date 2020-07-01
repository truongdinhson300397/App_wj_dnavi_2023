$(function () {
    setTimeout(firstOpen, 2000);
    // when 1st open
    function firstOpen () {
        if(_.isUndefined(localStorage.getItem('isFirstOpen')) || _.isNull(localStorage.getItem('isFirstOpen'))) {
            //
            $("#first-open-app").css("display", "block");
            $(".wrapper").css("display", "none");
            // default is Android even if current device isn't mobile device
            var platform = applican.device.platform;
            // set image
            if (platform === 'Android') {
                $('#first-open-app .swiper-wrapper').html('' +
                    '<div class="swiper-slide">\n' +
                    '      <img class="img-tutorial" src="./img/android_tutorial_1.png" alt="">' +
                    '    </div>' +
                    '<div class="swiper-slide">\n' +
                    '      <img class="img-tutorial" src="./img/android_tutorial_2.png" alt="">' +
                    '    </div>' +
                    '<div class="swiper-slide">\n' +
                    '      <img class="img-tutorial" src="./img/android_tutorial_3.png" alt="">' +
                    '    </div>');
            } else {
                $('#first-open-app .swiper-wrapper').html('' +
                    '<div class="swiper-slide">\n' +
                    '      <img class="img-tutorial iphone-678" src="./img/iphone678_tutorial_1.png" alt="">' +
                    '      <img class="img-tutorial iphone-x" src="./img/iphoneX_tutorial_1.png" alt="">' +
                    '    </div>' +
                    '<div class="swiper-slide">\n' +
                    '      <img class="img-tutorial iphone-678" src="./img/iphone678_tutorial_2.png" alt="">' +
                    '      <img class="img-tutorial iphone-x" src="./img/iphoneX_tutorial_2.png" alt="">' +
                    '    </div>' +
                    '<div class="swiper-slide">\n' +
                    '      <img class="img-tutorial iphone-678" src="./img/iphone678_tutorial_3.png" alt="">' +
                    '      <img class="img-tutorial iphone-x" src="./img/iphoneX_tutorial_3.png" alt="">' +
                    '    </div>');
            }
            var swiper = new Swiper('.swiper-tutorial', {
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                },
                mousewheel: {
                    releaseOnEdges: true,
                },
            });
            console.log(swiper);

            //Hide button skip when first load and remove unused class
            $('#btn-skip').hide();
            $('.target-skip').removeClass('swiper-button-disabled');

            swiper.on('slideChange', function () {
                if(swiper.realIndex === 2) {
                    $('#btn-next').hide();
                    $('#btn-skip').show().removeClass('swiper-button-disabled');
                    $('.target-skip').hide();
                } else {
                    $('#btn-next').show();
                    $('#btn-skip').hide();
                    $('.target-skip').show().removeClass('swiper-button-disabled');
                }
            });
        }
    }

    $('#btn-skip, .target-skip').click(function () {
        localStorage.setItem('isFirstOpen', '1');
        localStorage.setItem('contract_term_id', 2);
        setContractTerm(2022, 2);
        window.location.href = link.top;
    });
});
