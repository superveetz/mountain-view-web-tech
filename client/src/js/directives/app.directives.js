(function (angular) {
    angular.module('app.directives', [
        'app.controllers'
    ])
    
    .directive('mainNav', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/js/directives/templates/main-nav/main-nav.html',
            controller: 'MainNavCtrl'
        };
    }])

    .directive('mainFooter', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/js/directives/templates/main-footer/main-footer.html',
            controller: 'MainFooterCtrl'
        };
    }])
    
    .directive('alertBox', ['AlertService', function (AlertService) {
        return {
            restrict: 'E',
            templateUrl: function (scope, elem) {
                // Use default theme if no theme is provided
                if (elem.theme) {
                    return '/js/directives/templates/alert-box/' + elem.theme + '.html'
                } else {
                    return '/js/directives/templates/alert-box/default.html'
                }
            },
            link: function (scope) {
                scope.AlertService = AlertService;
            }
        };
    }])

    .directive('hideNavOnScroll', [function () {
        return {
            restrict: 'A',
            link: function (scope, elem) {
                let mainNav             = document.getElementById('top-nav');
                let mainNavEl           = angular.element(mainNav);
                let lastScrollAmount    = elem.scrollTop();
                let animationOccuring   = false;
                
                elem.bind('scroll', function (event) {
                    const scrollAmount = elem.scrollTop();

                    if (scrollAmount > lastScrollAmount) {
                        // scrolling down 
                        if (!animationOccuring) {
                            if (!mainNavEl.hasClass('slideOutUp')) {
                                if (mainNavEl.hasClass('slideInDown')) mainNavEl.removeClass('slideInDown');
                                mainNavEl.addClass('slideOutUp');
                                animationOccuring = true;
                                setTimeout(function () { animationOccuring = false; }, 500);
                            }
                        }
                    } else {
                        // scrolling up
                        if (!animationOccuring) {
                            if (!mainNavEl.hasClass('slideInDown')) {
                                if (mainNavEl.hasClass('slideOutUp')) mainNavEl.removeClass('slideOutUp');
                                mainNavEl.addClass('slideInDown');
                                animationOccuring = true;
                                setTimeout(function () { animationOccuring = false; }, 500);
                            }
                        }
                    }
                                                    
                    // always show nav at top of screen
                    if (scrollAmount <= 50) {
                        // at top of screen
                        if (!mainNavEl.hasClass('slideInDown')) {
                            if (mainNavEl.hasClass('slideOutUp')) mainNavEl.removeClass('slideOutUp');
                            mainNavEl.addClass('slideInDown');
                            animationOccuring = true;
                            setTimeout(function () { animationOccuring = false; }, 500);
                        }
                    }

                    lastScrollAmount = elem.scrollTop();
                });
            }
        };
    }])
    
    .directive('scrollDisabled', ['$window', '$timeout', function ($window, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, elem) {

                let window = angular.element($window);
                
                elem.on('show.bs.offcanvas', function () {
                    let body = document.getElementsByTagName('body')[0];
                    let html = document.getElementsByTagName('html')[0];
                    let app  = document.getElementById('app');
                    let bodyElem = angular.element(body);
                    let htmlElem = angular.element(html);
                    let appElem  = angular.element(app);
                    
                    bodyElem.addClass('body-scroll-disabled');
                    htmlElem.addClass('html-scroll-disabled');
                    $timeout(() => {
                        bodyElem.ontouchmove = function(event) {
                            event.preventDefault();
                        }
                        app.ontouchmove = function(event) {
                            event.preventDefault();
                        }
                    }, 300);
                });

                elem.on('hide.bs.offcanvas', function () {
                    let body = document.getElementsByTagName('body')[0];
                    let html = document.getElementsByTagName('html')[0];
                    let bodyElem = angular.element(body);
                    let htmlElem = angular.element(html);

                    $timeout(() => {
                        window.scrollTop(400);
                        bodyElem.removeClass('body-scroll-disabled');
                        htmlElem.removeClass('html-scroll-disabled');
                        bodyElem.ontouchmove = function(event) {
                            return true;
                        }
                        app.ontouchmove = function(event) {
                            return true;
                        }
                    }, 300);
                });
            }
        };
    }])
    
    .directive('fadeInOnLoad', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.addClass('animated fadeIn');
            }
        };
    }]);
})(angular);