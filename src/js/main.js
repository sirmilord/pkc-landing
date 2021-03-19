(function(){

  var toggler = document.getElementById('main-nav-toggler');
  if(toggler){
    toggler.addEventListener('click', mainNavVisibleToggle);

    function mainNavVisibleToggle(e) {
      e.preventDefault();
      toggler.classList.toggle('burger--close');
      document.getElementById('main-nav').classList.toggle('main-nav--open');
    }
  }

  var linkClassName = 'main-nav__link';
  var linkClassNameShowChild = 'main-nav__item--show-child';
  var findLinkClassName = new RegExp(linkClassName);

  document.addEventListener('focus', function(event) {

    if (findLinkClassName.test(event.target.className)) {
      event.target.parents('.main-nav__item').forEach(function(item){
        item.classList.add(linkClassNameShowChild);
      });
    }
  }, true);
  document.addEventListener('blur', function(event) {
    if (findLinkClassName.test(event.target.className)) {
      document.querySelectorAll('.'+linkClassNameShowChild).forEach(function(item){
        item.classList.remove(linkClassNameShowChild);
      });
    }
  }, true);

  Element.prototype.parents = function(selector) {
    var elements = [];
    var elem = this;
    var ishaveselector = selector !== undefined;

    while ((elem = elem.parentElement) !== null) {
      if (elem.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      if (!ishaveselector || elem.matches(selector)) {
        elements.push(elem);
      }
    }

    return elements;
  };


  var isMobile = window.matchMedia("only screen and (max-width: 767px)").matches;

  var iosBtn = document.querySelectorAll('.btn.ios');
  var iosPhone = document.querySelectorAll('.pkc__img-item.ios');
  var androidBtn = document.querySelectorAll('.btn.android');
  var androidPhone = document.querySelectorAll('.pkc__img-item.android');

  androidBtn.forEach(item => item.addEventListener('click', function() {
    _hmt.push(['_trackEvent', 'btn', 'click', 'MAINDownload_MAIN_android']);
    setTimeout(function () {
      window.location = config.android.androidmian;
    }, 300); // wait .3sec for ClipboardJS to do it's stuff
  }));

  iosBtn.forEach(item => item.addEventListener('click', function() {
    _hmt.push(['_trackEvent', 'btn', 'click', 'MAINDownload_MAIN_ios']);
    setTimeout(function () {
      window.location = config.ios.iosmain;
    }, 300); // wait .3sec for ClipboardJS to do it's stuff
  }));

  if (isMobile) {

    function getMobileOS() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      if (/android/i.test(userAgent)) {
        return "Android";
      }

      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
      }

      return "unknown";
    }

    var mobileOS = getMobileOS();

    if(mobileOS === "Android") {
      androidBtn.forEach(item => item.classList.add('show'));
      androidPhone.forEach(item => item.classList.add('show'));
    } else if(mobileOS === "iOS") {
      iosBtn.forEach(item => item.classList.add('show'));
      iosPhone.forEach(item => item.classList.add('show'));
    } else {
      androidBtn.forEach(item => item.classList.add('show'));
      androidPhone.forEach(item => item.classList.add('show'));
    }

  }

  // Copy invite code to clipboard: ##code##
  var clipboard = new ClipboardJS('.btn', {
    text: function() {
      var html = document.getElementById('invite_code').innerHTML;
      html = '##'+html+'##';
      return html;
    } });

  clipboard.on('success', function(e) {
    e.clearSelection();
  });

  clipboard.on('error', function(e) {
  });

}());