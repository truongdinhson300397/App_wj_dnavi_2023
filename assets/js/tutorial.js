document.addEventListener('deviceready', function () {
    if (_.isUndefined(localStorage.getItem('isFirstOpen')) || _.isNull(localStorage.getItem('isFirstOpen'))) {
        //
        $("#first-open-app").css("display", "block");
        // $(".wrapper").css("display", "none");
        var prefix = '';
        if (globalInfo('contract_term_id') != 1) {
            prefix = term[globalInfo('contract_term_id') - 1].term + '/';
        }
        // default is Android even if current device isn't mobile device
        var platform = applican.device.platform;
        // set image
        const devicePath = platform === 'Android' ? 'android' : 'ios'
        const commonPath = './img/' + prefix + 'tutorial/' + devicePath + '/'
        const cssClass = platform === 'Android' ? "img-tutorial" : "img-tutorial iphone"
        $('#first-open-app .swiper-wrapper').html('' +
            '<div class="swiper-slide">\n' +
            '    <img class=' + cssClass + ' src="'+ commonPath + 'tutorial1_smart_checkin.png" alt="">' +
            '</div>' +
            '<div class="swiper-slide">\n' +
            '    <img class=' + cssClass + ' src="'+ commonPath + 'tutorial2_offline.png" alt="">' +
            '</div>' +
            '<div class="swiper-slide">\n' +
            '    <img class=' + cssClass + ' src="'+ commonPath + 'tutorial3_push.png" alt="">' +
            '</div>' +
            '<div class="swiper-slide">\n' +
            '    <img class=' + cssClass + ' src="'+ commonPath + 'tutorial4_event.png" alt="">' +
            '</div>' +
            '<div class="swiper-slide">\n' +
            '    <img class=' + cssClass + ' src="'+ commonPath + 'tutorial5_contents.png" alt="">' +
            '</div>'
        );
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

        //Hide button skip when first load and remove unused class
        $('#btn-skip').hide();
        $('.target-skip').removeClass('swiper-button-disabled');

        swiper.on('slideChange', function () {
            if (swiper.realIndex === 4) {
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
});
$('#btn-skip, .target-skip').click(function () {
    localStorage.setItem('isFirstOpen', '1');
    localStorage.setItem('contract_term_id', 2);
    setContractTerm(2022, 2);
    toLocationHref(link.top + '?launch_tab=3');
});
