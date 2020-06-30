$(document).ready(onReady);

function onReady() {
  renderFooter();
}

function renderFooter() {
  const footer = (
    '<div class="footer-box">'+
        '<div class="footer-logo-dhr">'+
          '<img src="' + assetsPath + 'img/logo-dhr-01.gif" class="footer-logo-dhr-img" alt=""/>'+
        '</div>'+
        '<div class="footer-nav-outer">'+
          '<div class="footer-nav">'+
          '<ul class="footer-nav-ul">'+
              '<li class="footer-nav-ul-li"><a href="http://www.diamondhr.co.jp/">運営会社</a></li>'+
              '<li class="footer-nav-ul-li"><a href="/kiyaku">利用規約</a></li>'+
              '<li class="footer-nav-ul-li"><a href="/privacy">プライバシーポリシー</a></li>'+
              '<li class="footer-nav-ul-li"><a href="/sitemap">サイトマップ</a></li>'+
              '<li class="footer-nav-ul-li"><a href="/faq/list">FAQ・お問い合わせ</a></li>'+
              '<li class="footer-nav-ul-li"><a href="/quitdnavi/temporary_user/edit">退会</a></li>'+
            '</ul>'+
          '</div>'+
          '<div class="footer-pmark">'+
          '<a target="_blank" href="https://privacymark.jp/index.html">' +
            '<img src="' + assetsPath + 'img/logo-p.png" class="footer-logo-p-img" alt=""/>'+
          '</a>' +
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="footer-copyright">'+
        '<div class="footer-copyright-inner">2019 Copyright(C)<span class="ilb">&nbsp;DIAMOND HUMAN RESOURCE,INC.&nbsp;</span>'+
          '<span class="ilb">All Rights Reserved.</span>'+
        '</div>'+
      '</div>'
  );
  $("#footer").append(footer);
}
