'use strict';

(function (angular) {
    // declare app and load dependencies
    angular.module('app', ['smoothScroll', 'firebase', 'ui.router', 'ui.bootstrap', 'ui.validate', 'ngAnimate', 'app.controllers', 'app.directives', 'app.services', 'canvas-raining']).run(['$rootScope', '$state', '$window', '$firebaseAuth', '$location', '$anchorScroll', '$timeout', function ($rootScope, $state, $window, $firebaseAuth, $location, $anchorScroll, $timeout) {
        // attach $state to public $rootScope so that it can be used freely in templates
        $rootScope.$state = $state;

        // store Current User data
        $rootScope.CurrentUser = undefined;

        // register an event that will listen for firebase authentication
        $firebaseAuth().$onAuthStateChanged(function (firebaseUser) {
            if (firebaseUser) {
                $rootScope.CurrentUser = firebaseUser;
            } else {
                $rootScope.CurrentUser = undefined;
            }
        });

        // hook into onStateChangeStart event
        $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
            // cancel state transition if 1 is occuring already
            if ($rootScope.stateChangeOccuring) return e.preventDefault();

            // disable any further state transitions
            $rootScope.stateChangeOccuring = true;
        });

        // hook into onStateChangeSuccess event
        $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
            // scroll to top on page once state change transition starts
            $location.hash(fromState.name);
            $anchorScroll();
            $location.hash('');

            // wait for transitition animation to end after 1s
            $timeout(function () {
                // allow state changes again
                $rootScope.stateChangeOccuring = false;
            }, 500);
        });
    }]).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        // enable html5 mode (otherwise angularjs hashes urls with `#/#!/{config}`)
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        });

        // forced client routing sends to 404 for any unrecognized url
        $urlRouterProvider.otherwise('404');

        // declare all app states
        // TODO: add dynamic SEO
        $stateProvider.state('app', {
            abstract: true,
            url: '',
            templateUrl: '/views/index.html',
            controller: ['$rootScope', function ($rootScope) {}]
        }).state('app.home', {
            url: '/',
            templateUrl: '/views/home/index.html'
        }).state('app.about', {
            url: '/about',
            templateUrl: '/views/about/index.html'
        }).state('app.services', {
            url: '/services',
            templateUrl: '/views/services/index.html'
        }).state('app.contact', {
            url: '/contact',
            templateUrl: '/views/contact/index.html',
            controller: 'ContactCtrl'
        }).state('404', {
            url: '/404',
            templateUrl: '/views/404/index.html'
        });
    }]);
})(angular);
'use strict';

(function (angular) {
    angular.module('app.directives', ['app.controllers']).directive('mainNav', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/js/directives/templates/main-nav/main-nav.html',
            controller: 'MainNavCtrl'
        };
    }]).directive('mainFooter', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/js/directives/templates/main-footer/main-footer.html',
            controller: 'MainFooterCtrl'
        };
    }]).directive('alertBox', ['AlertService', function (AlertService) {
        return {
            restrict: 'E',
            templateUrl: function templateUrl(scope, elem) {
                // Use default theme if no theme is provided
                if (elem.theme) {
                    return '/js/directives/templates/alert-box/' + elem.theme + '.html';
                } else {
                    return '/js/directives/templates/alert-box/default.html';
                }
            },
            link: function link(scope) {
                scope.AlertService = AlertService;
            }
        };
    }]).directive('hideNavOnScroll', [function () {
        return {
            restrict: 'A',
            link: function link(scope, elem) {
                var mainNav = document.getElementById('top-nav');
                var mainNavEl = angular.element(mainNav);
                var lastScrollAmount = elem.scrollTop();
                var animationOccuring = false;

                elem.bind('scroll', function (event) {
                    var scrollAmount = elem.scrollTop();

                    if (scrollAmount > lastScrollAmount) {
                        // scrolling down 
                        if (!animationOccuring) {
                            if (!mainNavEl.hasClass('slideOutUp')) {
                                if (mainNavEl.hasClass('slideInDown')) mainNavEl.removeClass('slideInDown');
                                mainNavEl.addClass('slideOutUp');
                                animationOccuring = true;
                                setTimeout(function () {
                                    animationOccuring = false;
                                }, 500);
                            }
                        }
                    } else {
                        // scrolling up
                        if (!animationOccuring) {
                            if (!mainNavEl.hasClass('slideInDown')) {
                                if (mainNavEl.hasClass('slideOutUp')) mainNavEl.removeClass('slideOutUp');
                                mainNavEl.addClass('slideInDown');
                                animationOccuring = true;
                                setTimeout(function () {
                                    animationOccuring = false;
                                }, 500);
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
                            setTimeout(function () {
                                animationOccuring = false;
                            }, 500);
                        }
                    }

                    lastScrollAmount = elem.scrollTop();
                });
            }
        };
    }]).directive('scrollDisabled', ['$window', '$timeout', function ($window, $timeout) {
        return {
            restrict: 'A',
            link: function link(scope, elem) {

                var window = angular.element($window);

                elem.on('show.bs.offcanvas', function () {
                    var body = document.getElementsByTagName('body')[0];
                    var html = document.getElementsByTagName('html')[0];
                    var app = document.getElementById('app');
                    var bodyElem = angular.element(body);
                    var htmlElem = angular.element(html);
                    var appElem = angular.element(app);

                    bodyElem.addClass('body-scroll-disabled');
                    htmlElem.addClass('html-scroll-disabled');
                    $timeout(function () {
                        bodyElem.ontouchmove = function (event) {
                            event.preventDefault();
                        };
                        app.ontouchmove = function (event) {
                            event.preventDefault();
                        };
                    }, 300);
                });

                elem.on('hide.bs.offcanvas', function () {
                    var body = document.getElementsByTagName('body')[0];
                    var html = document.getElementsByTagName('html')[0];
                    var bodyElem = angular.element(body);
                    var htmlElem = angular.element(html);

                    $timeout(function () {
                        window.scrollTop(400);
                        bodyElem.removeClass('body-scroll-disabled');
                        htmlElem.removeClass('html-scroll-disabled');
                        bodyElem.ontouchmove = function (event) {
                            return true;
                        };
                        app.ontouchmove = function (event) {
                            return true;
                        };
                    }, 300);
                });
            }
        };
    }]).directive('fadeInOnLoad', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function link(scope, elem, attr) {
                elem.addClass('animated fadeIn');
            }
        };
    }]);
})(angular);
'use strict';

(function (angular) {
    angular.module('app.controllers', ['app.services']).controller('MainNavCtrl', ['$rootScope', '$scope', '$firebaseAuth', '$http', '$window', '$state', '$timeout', 'ModalService', 'AlertService', function ($rootScope, $scope, $firebaseAuth, $http, $window, $state, $timeout, ModalService, AlertService) {
        // init $scope
        $scope.authObj = $firebaseAuth();

        // open register account modal
        $scope.openRegisterAccountModal = function (closeMobileNav) {
            AlertService.reset();

            if (closeMobileNav) {
                $scope.closeMobileSideNav();
                // wait for mobile side nav to close, then open modal
                $timeout(function () {
                    ModalService.openRegisterAccountModal();
                }, 300);
            } else {
                ModalService.openRegisterAccountModal();
            }
        };

        // open login modal
        $scope.openLoginModal = function (closeMobileNav) {
            AlertService.reset();

            if (closeMobileNav) {
                $scope.closeMobileSideNav();
                // wait for mobile side nav to close, then open modal
                $timeout(function () {
                    ModalService.openLoginModal();
                }, 300);
            } else {
                ModalService.openLoginModal();
            }
        };

        // toggle mobile getting started
        $scope.showGettingStarted = false;
        $scope.toggleGettingStarted = function () {
            $scope.showGettingStarted = !$scope.showGettingStarted;
            return true;
        };

        // toggle mobile account options
        $scope.showAccountOptions = false;
        $scope.toggleAccountOptions = function () {
            $scope.showAccountOptions = !$scope.showAccountOptions;
            return true;
        };

        // logout
        $scope.logOut = function () {
            $scope.authObj.$signOut();
            return true;
        };

        // close mobile side nav
        $scope.closeMobileSideNav = function () {
            // using jasny bootstrap jquery api
            $('#mobile-side-nav').offcanvas('hide');
            return true;
        };

        // open mobile side nav
        $scope.openMobileSideNav = function () {
            console.log('hiya');

            // using jasny bootstrap jquery api
            $('#mobile-side-nav').offcanvas('show');
            return true;
        };
    }]).controller('LoginCtrl', ['$rootScope', '$firebaseAuth', '$scope', '$http', '$window', '$uibModalInstance', 'AlertService', function ($rootScope, $firebaseAuth, $scope, $http, $window, $uibModalInstance, AlertService, AuthService) {
        // defaults
        var dNewUser = {
            email: '',
            pass: '',
            cPass: ''
        };

        var dExistingUser = {
            email: '',
            pass: ''
        };

        var dServerResponse = {
            loginErr: false,
            signUpErr: false
        };

        // init $scope
        $scope.serverResponse = angular.copy(dServerResponse);
        $scope.authObj = $firebaseAuth();
        $scope.newUser = angular.copy(dNewUser);
        $scope.existingUser = angular.copy(dNewUser);

        // submit sign up form
        $scope.submitSignUpForm = function () {
            // turn on loading spinner
            $scope.signUpSubmit = true;

            // make sign up request to our firebase API
            $scope.authObj.$createUserWithEmailAndPassword($scope.newUser.email, $scope.newUser.pass).then(function (response) {
                // success
                $scope.signUpSubmit = false;
                $scope.closeModal();
            }).catch(function (err) {
                // error
                $scope.signUpSubmit = false;
                AlertService.setAlert({
                    show: true,
                    type: 'error',
                    title: err.message
                });
            });
        };

        // submit log in form
        $scope.submitLoginForm = function () {
            // turn on loading spinner
            $scope.loginSubmit = true;

            // login with email and password
            $scope.authObj.$signInWithEmailAndPassword($scope.existingUser.email, $scope.existingUser.pass).then(function (response) {
                // success
                $scope.loginSubmit = false;
                $scope.closeModal();
            }).catch(function (err) {
                // error
                $scope.loginSubmit = false;
                AlertService.setAlert({
                    show: true,
                    type: 'error',
                    title: err.message
                });
            });
        };

        // login with fb
        $scope.loginWithFacebook = function () {
            $scope.fbSubmit = true;

            $scope.authObj.$signInWithPopup("facebook").then(function (res) {
                // success
                $scope.fbSubmit = false;
                $scope.closeModal();
            }).catch(function (err) {
                // error
                $scope.fbSubmit = false;
                AlertService.setAlert({
                    show: true,
                    type: 'error',
                    title: err.message
                });
            });
        };

        // login with twitter
        $scope.loginWithTwitter = function () {
            $scope.twitSubmit = true;

            $scope.authObj.$signInWithPopup("twitter").then(function (res) {
                // success
                $scope.twitSubmit = false;
                $scope.closeModal();
            }).catch(function (err) {
                // error
                $scope.twitSubmit = false;
                AlertService.setAlert({
                    show: true,
                    type: 'error',
                    title: err.message
                });
            });
        };

        // login with google
        $scope.loginWithGoogle = function () {
            $scope.googSubmit = true;

            $scope.authObj.$signInWithPopup("google").then(function (res) {
                // success
                $scope.googSubmit = false;
                $scope.closeModal();
            }).catch(function (err) {
                // error
                $scope.googSubmit = false;
                AlertService.setAlert({
                    show: true,
                    type: 'error',
                    title: err.message
                });
            });
        };

        // close modal
        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

        // validate confirm password matches password
        $scope.isPassConfirmed = function (confirmPass) {
            return confirmPass.signUpForm.newUserPass.$$rawModelValue === confirmPass.signUpForm.newUserCPass.$$rawModelValue;
        };
    }]).controller('MainFooterCtrl', ['$scope', '$document', '$location', '$state', 'smoothScroll', function ($scope, $document, $location, $state, smoothScroll) {
        console.log('main footer');
    }]).controller('AppCtrl', ['$rootScope', '$state', function ($rootScope, $state) {}]).controller('ContactCtrl', ['$scope', '$http', 'AlertService', function ($scope, $http, AlertService) {
        $scope.sendEmail = function () {
            $scope.submitSendEmail = true;
            $http({
                method: 'POST',
                url: '/api/send-email'
            }).finally(function (res) {
                $scope.submitSendEmail = false;
                AlertService.setAlert({
                    type: 'success',
                    show: true,
                    title: 'Email sent. We will reply back to you as soon as we can.'
                });
            });
        };
    }]);
})(angular);
'use strict';

(function (angular) {
    angular.module('app.services', ['app.controllers']).service('ModalService', ['$uibModal', '$timeout', function ($uibModal, $timeout) {
        return {
            openRegisterAccountModal: function openRegisterAccountModal() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'register-account-title',
                    ariaDescribedBy: 'register-account-body',
                    templateUrl: 'register-account-modal.html', // found nested in main-nav.html template
                    controller: 'RegisterAccountCtrl',
                    backdrop: true,
                    size: 'md'
                });

                // catch the promise propgated by the modal to avoid any errors (required)
                modalInstance.result.then(function (result) {}).catch(function (err) {});
            },

            openLoginModal: function openLoginModal() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'login-title',
                    ariaDescribedBy: 'login-body',
                    templateUrl: 'login-modal.html', // found nested in main-nav.html template
                    controller: 'LoginCtrl',
                    backdrop: true,
                    size: 'md'
                });

                // catch the promise propgated by the modal to avoid any errors (required)
                modalInstance.result.then(function (result) {}).catch(function (err) {});
            }
        };
    }]).service('AlertService', ['$timeout', function ($timeout) {

        var alert = {
            show: false,
            type: 'success'
        };

        return {
            showAlert: function showAlert() {
                alert.show = true;
                return true;
            },
            hideAlert: function hideAlert() {
                alert.show = false;
                return true;
            },
            hasAlert: function hasAlert() {
                return alert.show;
            },
            reset: function reset() {
                alert = {};
                return true;
            },
            setAlert: function setAlert(alertObj) {
                console.log("alertObj:", alertObj);

                // update alert 
                alert = angular.copy(alertObj);

                // parse slim application server error
                if (alert.type == 'error' && alert.slimErr) {
                    alert.errList = [];
                    console.log("alert:", alert);
                    alert.title = alert.slimErr && alert.slimErr.data && alert.slimErr.data.exception && alert.slimErr.data.exception[0] && alert.slimErr.data.exception[0].message ? alert.slimErr.data.exception[0].message : 'Error';
                }

                return true;
            },
            getAlert: function getAlert() {
                return alert;
            }
        };
    }]);
})(angular);
'use strict';

(function (angular) {
    // declare app and load dependencies
    angular.module('canvas-raining', []).directive('canvasRaining', ['$interval', function ($interval) {
        return {
            restrict: 'A',
            link: function link(scope, elem) {
                // canvas animation taken from: https://codepen.io/ruigewaard/pen/JHDdF
                elem.ready(function () {
                    var ctx = elem[0].getContext('2d');
                    var w = elem.width();
                    var h = elem.height();

                    ctx.strokeStyle = 'rgba(174,194,224,0.5)';
                    // ctx.strokeStyle              = 'rgba(0,0,0,1)';
                    ctx.lineWidth = 0.5;
                    ctx.lineCap = 'round';
                    ctx.globalCompositeOperation = 'destination-over';

                    var init = [];
                    var maxParts = 2000;
                    for (var a = 0; a < maxParts; a++) {
                        init.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            l: Math.random() * 1,
                            xs: -4 + Math.random() * 4 + 2,
                            ys: Math.random() * 10 + 5
                        });
                    }

                    var particles = [];
                    for (var b = 0; b < maxParts; b++) {
                        particles[b] = init[b];
                    }

                    function draw() {
                        ctx.clearRect(0, 0, w, h);
                        for (var c = 0; c < particles.length; c++) {
                            var p = particles[c];
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
                            ctx.stroke();
                        }
                        move();
                    }

                    function move() {
                        for (var b = 0; b < particles.length; b++) {
                            var p = particles[b];
                            p.x += p.xs + mousePositionRatio * (Math.random() * 20);
                            p.y += p.ys;

                            if (p.x > w || p.y > h) {
                                p.x = Math.random() * w;
                                p.y = -20;
                            }
                        }
                    }

                    $interval(draw, 60);

                    // register mousemove listener
                    var mousePositionRatio = 0;
                    elem.bind('mousemove', function (event) {
                        mousePositionRatio = event.clientX / elem.width() - 0.5;
                    });
                });
            }
        };
    }]);
})(angular);
'use strict';

(function (angular) {
    // declare app and load dependencies
    angular.module('canvas-raining', []).directive('canvasRaining', ['$interval', 'CanvasSystem', function ($interval, CanvasSystem) {
        return {
            restrict: 'A',
            link: function link(scope, elem) {
                // canvas animation taken from: https://codepen.io/ruigewaard/pen/JHDdF
                elem.ready(function () {
                    // let 
                    // ctx     = elem[0].getContext('2d'), 
                    // w       = elem.width(),
                    // h       = elem.height();

                    // ctx.strokeStyle              = 'rgba(174,194,224,0.5)';
                    // // ctx.strokeStyle              = 'rgba(0,0,0,1)';
                    // ctx.lineWidth                = 0.5;
                    // ctx.lineCap                  = 'round';
                    // ctx.globalCompositeOperation ='source-over'; // https://www.w3schools.com/tags/canvas_globalcompositeoperation.asp

                    // start

                });
            }
        };
    }]).factory('CanvasSystem', [function () {
        var cSystem = function cSystem(elem) {
            this.ctx = elem[0].getContext('2d');
            this.w = elem.width();
            this.h = elem.height();
            this.x = 0;
            this.y = 0;
            console.log("this.ctx:", this.ctx);
        };

        cSystem.prototype.draw = function () {
            this.x += 1;
            this.y += 1;
            console.log("this:", this);

            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.w, this.h);

            this.ctx.fillStyle = "#ffffff";
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI, false);
            this.ctx.closePath();

            this.ctx.fill();

            requestAnimationFrame(this.draw);
        };

        return cSystem;
    }]);
})(angular);