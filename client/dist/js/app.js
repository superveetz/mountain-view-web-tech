'use strict';

(function (angular) {
    // declare app and load dependencies
    angular.module('app', ['smoothScroll', 'firebase', 'ui.router', 'ui.bootstrap', 'ui.validate', 'ngAnimate', 'app.controllers', 'app.directives', 'app.services', 'canvas-raining', 'ngResource', 'lbServices']).run(['$rootScope', '$state', '$window', '$firebaseAuth', '$location', '$anchorScroll', '$timeout', function ($rootScope, $state, $window, $firebaseAuth, $location, $anchorScroll, $timeout) {
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
    }]).controller('MainFooterCtrl', ['$scope', '$document', '$location', '$state', 'smoothScroll', function ($scope, $document, $location, $state, smoothScroll) {}]).controller('AppCtrl', ['$rootScope', '$state', function ($rootScope, $state) {}]).controller('ContactCtrl', ['$scope', '$http', 'AlertService', 'Mail', function ($scope, $http, AlertService, Mail) {
        // defaults
        var dUser = {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        };

        var dServerResponse = {
            loginErr: false,
            signUpErr: false
        };

        // init $scope
        $scope.user = angular.copy(dUser);
        $scope.serverResponse = angular.copy(dServerResponse);

        $scope.sendEmail = function () {
            $scope.submitSendEmail = true;
            Mail.create({
                name: $scope.user.name,
                email: $scope.user.email,
                phone: $scope.user.phone,
                subject: $scope.user.subject,
                message: $scope.user.message
            }).$promise.then(function (res) {
                $scope.submitSendEmail = false;
                $scope.user = angular.copy(dUser);
                $scope.contactForm.$setPristine();
                $scope.contactForm.$setUntouched();
                AlertService.setAlert({
                    show: true,
                    type: 'success',
                    title: 'We have received your request and will get back to you as soon as we can.'
                });
            }).catch(function (err) {
                $scope.submitSendEmail = false;
                AlertService.setAlert({
                    show: true,
                    type: 'error',
                    title: 'An unexpected error occured.'
                });
            });
        };
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
                // update alert 
                alert = angular.copy(alertObj);

                // parse slim application server error
                if (alert.type == 'error' && alert.slimErr) {
                    alert.errList = [];
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

// CommonJS package manager support
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  // Export the *name* of this Angular module
  // Sample usage:
  //
  //   import lbServices from './lb-services';
  //   angular.module('app', [lbServices]);
  //
  module.exports = "lbServices";
}

(function (window, angular, undefined) {
  'use strict';

  var urlBase = "/api";
  var authHeader = 'authorization';

  function getHost(url) {
    var m = url.match(/^(?:https?:)?\/\/([^\/]+)/);
    return m ? m[1] : null;
  }

  var urlBaseHost = getHost(urlBase) || location.host;

  /**
   * @ngdoc overview
   * @name lbServices
   * @module
   * @description
   *
   * The `lbServices` module provides services for interacting with
   * the models exposed by the LoopBack server via the REST API.
   *
   */
  var module = angular.module("lbServices", ['ngResource']);

  /**
   * @ngdoc object
   * @name lbServices.Person
   * @header lbServices.Person
   * @object
   *
   * @description
   *
   * A $resource object for interacting with the `Person` model.
   *
   * ## Example
   *
   * See
   * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
   * for an example of using this object.
   *
   */
  module.factory("Person", ['LoopBackResource', 'LoopBackAuth', '$injector', '$q', function (LoopBackResource, LoopBackAuth, $injector, $q) {
    var R = LoopBackResource(urlBase + "/People/:id", { 'id': '@id' }, {

      /**
       * @ngdoc method
       * @name lbServices.Person#prototype$__findById__accessTokens
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Find a related item by id for accessTokens.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Person id
       *
       *  - `fk` – `{*}` - Foreign key for accessTokens
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "prototype$__findById__accessTokens": {
        params: {
          'fk': '@fk'
        },
        url: urlBase + "/People/:id/accessTokens/:fk",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#prototype$__destroyById__accessTokens
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Delete a related item by id for accessTokens.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Person id
       *
       *  - `fk` – `{*}` - Foreign key for accessTokens
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * This method returns no data.
       */
      "prototype$__destroyById__accessTokens": {
        params: {
          'fk': '@fk'
        },
        url: urlBase + "/People/:id/accessTokens/:fk",
        method: "DELETE"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#prototype$__updateById__accessTokens
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Update a related item by id for accessTokens.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Person id
       *
       *  - `fk` – `{*}` - Foreign key for accessTokens
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "prototype$__updateById__accessTokens": {
        params: {
          'fk': '@fk'
        },
        url: urlBase + "/People/:id/accessTokens/:fk",
        method: "PUT"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#prototype$__get__accessTokens
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Queries accessTokens of Person.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Person id
       *
       *  - `filter` – `{object=}` -
       *
       * @param {function(Array.<Object>,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Array.<Object>} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "prototype$__get__accessTokens": {
        isArray: true,
        url: urlBase + "/People/:id/accessTokens",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#prototype$__create__accessTokens
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Creates a new instance in accessTokens of this model.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Person id
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "prototype$__create__accessTokens": {
        url: urlBase + "/People/:id/accessTokens",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#prototype$__delete__accessTokens
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Deletes all accessTokens of this model.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Person id
       *
       *  - `where` – `{object=}` -
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * This method returns no data.
       */
      "prototype$__delete__accessTokens": {
        url: urlBase + "/People/:id/accessTokens",
        method: "DELETE"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#prototype$__count__accessTokens
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Counts accessTokens of Person.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Person id
       *
       *  - `where` – `{object=}` - Criteria to match model instances
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Data properties:
       *
       *  - `count` – `{number=}` -
       */
      "prototype$__count__accessTokens": {
        url: urlBase + "/People/:id/accessTokens/count",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#create
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Create a new instance of the model and persist it into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "create": {
        url: urlBase + "/People",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#createMany
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Create a new instance of the model and persist it into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Array.<Object>,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Array.<Object>} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "createMany": {
        isArray: true,
        url: urlBase + "/People",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#upsert
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Patch an existing model instance or insert a new one into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "upsert": {
        url: urlBase + "/People",
        method: "PUT"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#replaceOrCreate
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Replace an existing model instance or insert a new one into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "replaceOrCreate": {
        url: urlBase + "/People/replaceOrCreate",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#upsertWithWhere
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Update an existing model instance or insert a new one into the data source based on the where criteria.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `where` – `{object=}` - Criteria to match model instances
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "upsertWithWhere": {
        url: urlBase + "/People/upsertWithWhere",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#exists
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Check whether a model instance exists in the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Model id
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Data properties:
       *
       *  - `exists` – `{boolean=}` -
       */
      "exists": {
        url: urlBase + "/People/:id/exists",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#findById
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Find a model instance by {{id}} from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Model id
       *
       *  - `filter` – `{object=}` - Filter defining fields and include - must be a JSON-encoded string ({"something":"value"})
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "findById": {
        url: urlBase + "/People/:id",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#replaceById
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Replace attributes for a model instance and persist it into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Model id
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "replaceById": {
        url: urlBase + "/People/:id/replace",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#find
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Find all instances of the model matched by filter from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
       *
       * @param {function(Array.<Object>,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Array.<Object>} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "find": {
        isArray: true,
        url: urlBase + "/People",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#findOne
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Find first instance of the model matched by filter from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "findOne": {
        url: urlBase + "/People/findOne",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#updateAll
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Update instances of the model matched by {{where}} from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `where` – `{object=}` - Criteria to match model instances
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Information related to the outcome of the operation
       */
      "updateAll": {
        url: urlBase + "/People/update",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#deleteById
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Delete a model instance by {{id}} from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Model id
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "deleteById": {
        url: urlBase + "/People/:id",
        method: "DELETE"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#count
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Count instances of the model matched by where from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `where` – `{object=}` - Criteria to match model instances
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Data properties:
       *
       *  - `count` – `{number=}` -
       */
      "count": {
        url: urlBase + "/People/count",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#prototype$updateAttributes
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Patch attributes for a model instance and persist it into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Person id
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Person` object.)
       * </em>
       */
      "prototype$updateAttributes": {
        url: urlBase + "/People/:id",
        method: "PUT"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#createChangeStream
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Create a change stream.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       *  - `options` – `{object=}` -
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Data properties:
       *
       *  - `changes` – `{ReadableStream=}` -
       */
      "createChangeStream": {
        url: urlBase + "/People/change-stream",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#login
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Login a user with username/email and password.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `include` – `{string=}` - Related objects to include in the response. See the description of return value for more details.
       *   Default value: `user`.
       *
       *  - `rememberMe` - `boolean` - Whether the authentication credentials
       *     should be remembered in localStorage across app/browser restarts.
       *     Default: `true`.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * The response body contains properties of the AccessToken created on login.
       * Depending on the value of `include` parameter, the body may contain additional properties:
       *   - `user` - `U+007BUserU+007D` - Data of the currently logged in user. (`include=user`)
       *
       */
      "login": {
        params: {
          include: 'user'
        },
        interceptor: {
          response: function response(_response) {
            var accessToken = _response.data;
            LoopBackAuth.setUser(accessToken.id, accessToken.userId, accessToken.user);
            LoopBackAuth.rememberMe = _response.config.params.rememberMe !== false;
            LoopBackAuth.save();
            return _response.resource;
          }
        },
        url: urlBase + "/People/login",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#logout
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Logout a user with access token.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       *  - `access_token` – `{string=}` - Do not supply this argument, it is automatically extracted from request headers.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * This method returns no data.
       */
      "logout": {
        interceptor: {
          response: function response(_response2) {
            LoopBackAuth.clearUser();
            LoopBackAuth.clearStorage();
            return _response2.resource;
          },
          responseError: function responseError(_responseError) {
            LoopBackAuth.clearUser();
            LoopBackAuth.clearStorage();
            return _responseError.resource;
          }
        },
        url: urlBase + "/People/logout",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#confirm
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Confirm a user registration with email verification token.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `uid` – `{string}` -
       *
       *  - `token` – `{string}` -
       *
       *  - `redirect` – `{string=}` -
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * This method returns no data.
       */
      "confirm": {
        url: urlBase + "/People/confirm",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#resetPassword
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Reset password for a user with email.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * This method returns no data.
       */
      "resetPassword": {
        url: urlBase + "/People/reset",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Person#getCurrent
       * @methodOf lbServices.Person
       *
       * @description
       *
       * Get data of the currently logged user. Fail with HTTP result 401
       * when there is no user logged in.
       *
       * @param {function(Object,Object)=} successCb
       *    Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *    `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       */
      'getCurrent': {
        url: urlBase + "/People" + '/:id',
        method: 'GET',
        params: {
          id: function id() {
            var id = LoopBackAuth.currentUserId;
            if (id == null) id = '__anonymous__';
            return id;
          }
        },
        interceptor: {
          response: function response(_response3) {
            LoopBackAuth.currentUserData = _response3.data;
            return _response3.resource;
          },
          responseError: function responseError(_responseError2) {
            LoopBackAuth.clearUser();
            LoopBackAuth.clearStorage();
            return $q.reject(_responseError2);
          }
        },
        __isGetCurrentUser__: true
      }
    });

    /**
     * @ngdoc method
     * @name lbServices.Person#patchOrCreate
     * @methodOf lbServices.Person
     *
     * @description
     *
     * Patch an existing model instance or insert a new one into the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *   This method does not accept any parameters.
     *   Supply an empty object or omit this argument altogether.
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Person` object.)
     * </em>
     */
    R["patchOrCreate"] = R["upsert"];

    /**
     * @ngdoc method
     * @name lbServices.Person#updateOrCreate
     * @methodOf lbServices.Person
     *
     * @description
     *
     * Patch an existing model instance or insert a new one into the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *   This method does not accept any parameters.
     *   Supply an empty object or omit this argument altogether.
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Person` object.)
     * </em>
     */
    R["updateOrCreate"] = R["upsert"];

    /**
     * @ngdoc method
     * @name lbServices.Person#patchOrCreateWithWhere
     * @methodOf lbServices.Person
     *
     * @description
     *
     * Update an existing model instance or insert a new one into the data source based on the where criteria.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `where` – `{object=}` - Criteria to match model instances
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Person` object.)
     * </em>
     */
    R["patchOrCreateWithWhere"] = R["upsertWithWhere"];

    /**
     * @ngdoc method
     * @name lbServices.Person#update
     * @methodOf lbServices.Person
     *
     * @description
     *
     * Update instances of the model matched by {{where}} from the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `where` – `{object=}` - Criteria to match model instances
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Information related to the outcome of the operation
     */
    R["update"] = R["updateAll"];

    /**
     * @ngdoc method
     * @name lbServices.Person#destroyById
     * @methodOf lbServices.Person
     *
     * @description
     *
     * Delete a model instance by {{id}} from the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `id` – `{*}` - Model id
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Person` object.)
     * </em>
     */
    R["destroyById"] = R["deleteById"];

    /**
     * @ngdoc method
     * @name lbServices.Person#removeById
     * @methodOf lbServices.Person
     *
     * @description
     *
     * Delete a model instance by {{id}} from the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `id` – `{*}` - Model id
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Person` object.)
     * </em>
     */
    R["removeById"] = R["deleteById"];

    /**
     * @ngdoc method
     * @name lbServices.Person#patchAttributes
     * @methodOf lbServices.Person
     *
     * @description
     *
     * Patch attributes for a model instance and persist it into the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `id` – `{*}` - Person id
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Person` object.)
     * </em>
     */
    R["patchAttributes"] = R["prototype$updateAttributes"];

    /**
     * @ngdoc method
     * @name lbServices.Person#getCachedCurrent
     * @methodOf lbServices.Person
     *
     * @description
     *
     * Get data of the currently logged user that was returned by the last
     * call to {@link lbServices.Person#login} or
     * {@link lbServices.Person#getCurrent}. Return null when there
     * is no user logged in or the data of the current user were not fetched
     * yet.
     *
     * @returns {Object} A Person instance.
     */
    R.getCachedCurrent = function () {
      var data = LoopBackAuth.currentUserData;
      return data ? new R(data) : null;
    };

    /**
     * @ngdoc method
     * @name lbServices.Person#isAuthenticated
     * @methodOf lbServices.Person
     *
     * @returns {boolean} True if the current user is authenticated (logged in).
     */
    R.isAuthenticated = function () {
      return this.getCurrentId() != null;
    };

    /**
     * @ngdoc method
     * @name lbServices.Person#getCurrentId
     * @methodOf lbServices.Person
     *
     * @returns {Object} Id of the currently logged-in user or null.
     */
    R.getCurrentId = function () {
      return LoopBackAuth.currentUserId;
    };

    /**
    * @ngdoc property
    * @name lbServices.Person#modelName
    * @propertyOf lbServices.Person
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Person`.
    */
    R.modelName = "Person";

    return R;
  }]);

  /**
   * @ngdoc object
   * @name lbServices.Mail
   * @header lbServices.Mail
   * @object
   *
   * @description
   *
   * A $resource object for interacting with the `Mail` model.
   *
   * ## Example
   *
   * See
   * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
   * for an example of using this object.
   *
   */
  module.factory("Mail", ['LoopBackResource', 'LoopBackAuth', '$injector', '$q', function (LoopBackResource, LoopBackAuth, $injector, $q) {
    var R = LoopBackResource(urlBase + "/Mails/:id", { 'id': '@id' }, {

      /**
       * @ngdoc method
       * @name lbServices.Mail#create
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Create a new instance of the model and persist it into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "create": {
        url: urlBase + "/Mails",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#createMany
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Create a new instance of the model and persist it into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Array.<Object>,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Array.<Object>} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "createMany": {
        isArray: true,
        url: urlBase + "/Mails",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#upsert
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Patch an existing model instance or insert a new one into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "upsert": {
        url: urlBase + "/Mails",
        method: "PUT"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#replaceOrCreate
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Replace an existing model instance or insert a new one into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "replaceOrCreate": {
        url: urlBase + "/Mails/replaceOrCreate",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#upsertWithWhere
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Update an existing model instance or insert a new one into the data source based on the where criteria.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `where` – `{object=}` - Criteria to match model instances
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "upsertWithWhere": {
        url: urlBase + "/Mails/upsertWithWhere",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#exists
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Check whether a model instance exists in the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Model id
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Data properties:
       *
       *  - `exists` – `{boolean=}` -
       */
      "exists": {
        url: urlBase + "/Mails/:id/exists",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#findById
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Find a model instance by {{id}} from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Model id
       *
       *  - `filter` – `{object=}` - Filter defining fields and include - must be a JSON-encoded string ({"something":"value"})
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "findById": {
        url: urlBase + "/Mails/:id",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#replaceById
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Replace attributes for a model instance and persist it into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Model id
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "replaceById": {
        url: urlBase + "/Mails/:id/replace",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#find
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Find all instances of the model matched by filter from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
       *
       * @param {function(Array.<Object>,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Array.<Object>} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "find": {
        isArray: true,
        url: urlBase + "/Mails",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#findOne
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Find first instance of the model matched by filter from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "findOne": {
        url: urlBase + "/Mails/findOne",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#updateAll
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Update instances of the model matched by {{where}} from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `where` – `{object=}` - Criteria to match model instances
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Information related to the outcome of the operation
       */
      "updateAll": {
        url: urlBase + "/Mails/update",
        method: "POST"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#deleteById
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Delete a model instance by {{id}} from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Model id
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "deleteById": {
        url: urlBase + "/Mails/:id",
        method: "DELETE"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#count
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Count instances of the model matched by where from the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `where` – `{object=}` - Criteria to match model instances
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Data properties:
       *
       *  - `count` – `{number=}` -
       */
      "count": {
        url: urlBase + "/Mails/count",
        method: "GET"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#prototype$updateAttributes
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Patch attributes for a model instance and persist it into the data source.
       *
       * @param {Object=} parameters Request parameters.
       *
       *  - `id` – `{*}` - Mail id
       *
       * @param {Object} postData Request data.
       *
       * This method expects a subset of model properties as request parameters.
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * <em>
       * (The remote method definition does not provide any description.
       * This usually means the response is a `Mail` object.)
       * </em>
       */
      "prototype$updateAttributes": {
        url: urlBase + "/Mails/:id",
        method: "PUT"
      },

      /**
       * @ngdoc method
       * @name lbServices.Mail#createChangeStream
       * @methodOf lbServices.Mail
       *
       * @description
       *
       * Create a change stream.
       *
       * @param {Object=} parameters Request parameters.
       *
       *   This method does not accept any parameters.
       *   Supply an empty object or omit this argument altogether.
       *
       * @param {Object} postData Request data.
       *
       *  - `options` – `{object=}` -
       *
       * @param {function(Object,Object)=} successCb
       *   Success callback with two arguments: `value`, `responseHeaders`.
       *
       * @param {function(Object)=} errorCb Error callback with one argument:
       *   `httpResponse`.
       *
       * @returns {Object} An empty reference that will be
       *   populated with the actual data once the response is returned
       *   from the server.
       *
       * Data properties:
       *
       *  - `changes` – `{ReadableStream=}` -
       */
      "createChangeStream": {
        url: urlBase + "/Mails/change-stream",
        method: "POST"
      }
    });

    /**
     * @ngdoc method
     * @name lbServices.Mail#patchOrCreate
     * @methodOf lbServices.Mail
     *
     * @description
     *
     * Patch an existing model instance or insert a new one into the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *   This method does not accept any parameters.
     *   Supply an empty object or omit this argument altogether.
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Mail` object.)
     * </em>
     */
    R["patchOrCreate"] = R["upsert"];

    /**
     * @ngdoc method
     * @name lbServices.Mail#updateOrCreate
     * @methodOf lbServices.Mail
     *
     * @description
     *
     * Patch an existing model instance or insert a new one into the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *   This method does not accept any parameters.
     *   Supply an empty object or omit this argument altogether.
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Mail` object.)
     * </em>
     */
    R["updateOrCreate"] = R["upsert"];

    /**
     * @ngdoc method
     * @name lbServices.Mail#patchOrCreateWithWhere
     * @methodOf lbServices.Mail
     *
     * @description
     *
     * Update an existing model instance or insert a new one into the data source based on the where criteria.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `where` – `{object=}` - Criteria to match model instances
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Mail` object.)
     * </em>
     */
    R["patchOrCreateWithWhere"] = R["upsertWithWhere"];

    /**
     * @ngdoc method
     * @name lbServices.Mail#update
     * @methodOf lbServices.Mail
     *
     * @description
     *
     * Update instances of the model matched by {{where}} from the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `where` – `{object=}` - Criteria to match model instances
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Information related to the outcome of the operation
     */
    R["update"] = R["updateAll"];

    /**
     * @ngdoc method
     * @name lbServices.Mail#destroyById
     * @methodOf lbServices.Mail
     *
     * @description
     *
     * Delete a model instance by {{id}} from the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `id` – `{*}` - Model id
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Mail` object.)
     * </em>
     */
    R["destroyById"] = R["deleteById"];

    /**
     * @ngdoc method
     * @name lbServices.Mail#removeById
     * @methodOf lbServices.Mail
     *
     * @description
     *
     * Delete a model instance by {{id}} from the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `id` – `{*}` - Model id
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Mail` object.)
     * </em>
     */
    R["removeById"] = R["deleteById"];

    /**
     * @ngdoc method
     * @name lbServices.Mail#patchAttributes
     * @methodOf lbServices.Mail
     *
     * @description
     *
     * Patch attributes for a model instance and persist it into the data source.
     *
     * @param {Object=} parameters Request parameters.
     *
     *  - `id` – `{*}` - Mail id
     *
     * @param {Object} postData Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @param {function(Object,Object)=} successCb
     *   Success callback with two arguments: `value`, `responseHeaders`.
     *
     * @param {function(Object)=} errorCb Error callback with one argument:
     *   `httpResponse`.
     *
     * @returns {Object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Mail` object.)
     * </em>
     */
    R["patchAttributes"] = R["prototype$updateAttributes"];

    /**
    * @ngdoc property
    * @name lbServices.Mail#modelName
    * @propertyOf lbServices.Mail
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Mail`.
    */
    R.modelName = "Mail";

    return R;
  }]);

  /**
   * @ngdoc object
   * @name lbServices.Gmail
   * @header lbServices.Gmail
   * @object
   *
   * @description
   *
   * A $resource object for interacting with the `Gmail` model.
   *
   * ## Example
   *
   * See
   * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
   * for an example of using this object.
   *
   */
  module.factory("Gmail", ['LoopBackResource', 'LoopBackAuth', '$injector', '$q', function (LoopBackResource, LoopBackAuth, $injector, $q) {
    var R = LoopBackResource(urlBase + "/Gmails/:id", { 'id': '@id' }, {});

    /**
    * @ngdoc property
    * @name lbServices.Gmail#modelName
    * @propertyOf lbServices.Gmail
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Gmail`.
    */
    R.modelName = "Gmail";

    return R;
  }]);

  module.factory('LoopBackAuth', function () {
    var props = ['accessTokenId', 'currentUserId', 'rememberMe'];
    var propsPrefix = '$LoopBack$';

    function LoopBackAuth() {
      var self = this;
      props.forEach(function (name) {
        self[name] = load(name);
      });
      this.currentUserData = null;
    }

    LoopBackAuth.prototype.save = function () {
      var self = this;
      var storage = this.rememberMe ? localStorage : sessionStorage;
      props.forEach(function (name) {
        save(storage, name, self[name]);
      });
    };

    LoopBackAuth.prototype.setUser = function (accessTokenId, userId, userData) {
      this.accessTokenId = accessTokenId;
      this.currentUserId = userId;
      this.currentUserData = userData;
    };

    LoopBackAuth.prototype.clearUser = function () {
      this.accessTokenId = null;
      this.currentUserId = null;
      this.currentUserData = null;
    };

    LoopBackAuth.prototype.clearStorage = function () {
      props.forEach(function (name) {
        save(sessionStorage, name, null);
        save(localStorage, name, null);
      });
    };

    return new LoopBackAuth();

    // Note: LocalStorage converts the value to string
    // We are using empty string as a marker for null/undefined values.
    function save(storage, name, value) {
      try {
        var key = propsPrefix + name;
        if (value == null) value = '';
        storage[key] = value;
      } catch (err) {
        console.log('Cannot access local/session storage:', err);
      }
    }

    function load(name) {
      var key = propsPrefix + name;
      return localStorage[key] || sessionStorage[key] || null;
    }
  }).config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('LoopBackAuthRequestInterceptor');
  }]).factory('LoopBackAuthRequestInterceptor', ['$q', 'LoopBackAuth', function ($q, LoopBackAuth) {
    return {
      'request': function request(config) {
        // filter out external requests
        var host = getHost(config.url);
        if (host && host !== urlBaseHost) {
          return config;
        }

        if (LoopBackAuth.accessTokenId) {
          config.headers[authHeader] = LoopBackAuth.accessTokenId;
        } else if (config.__isGetCurrentUser__) {
          // Return a stub 401 error for User.getCurrent() when
          // there is no user logged in
          var res = {
            body: { error: { status: 401 } },
            status: 401,
            config: config,
            headers: function headers() {
              return undefined;
            }
          };
          return $q.reject(res);
        }
        return config || $q.when(config);
      }
    };
  }])

  /**
   * @ngdoc object
   * @name lbServices.LoopBackResourceProvider
   * @header lbServices.LoopBackResourceProvider
   * @description
   * Use `LoopBackResourceProvider` to change the global configuration
   * settings used by all models. Note that the provider is available
   * to Configuration Blocks only, see
   * {@link https://docs.angularjs.org/guide/module#module-loading-dependencies Module Loading & Dependencies}
   * for more details.
   *
   * ## Example
   *
   * ```js
   * angular.module('app')
   *  .config(function(LoopBackResourceProvider) {
   *     LoopBackResourceProvider.setAuthHeader('X-Access-Token');
   *  });
   * ```
   */
  .provider('LoopBackResource', function LoopBackResourceProvider() {
    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#setAuthHeader
     * @methodOf lbServices.LoopBackResourceProvider
     * @param {string} header The header name to use, e.g. `X-Access-Token`
     * @description
     * Configure the REST transport to use a different header for sending
     * the authentication token. It is sent in the `Authorization` header
     * by default.
     */
    this.setAuthHeader = function (header) {
      authHeader = header;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#getAuthHeader
     * @methodOf lbServices.LoopBackResourceProvider
     * @description
     * Get the header name that is used for sending the authentication token.
     */
    this.getAuthHeader = function () {
      return authHeader;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#setUrlBase
     * @methodOf lbServices.LoopBackResourceProvider
     * @param {string} url The URL to use, e.g. `/api` or `//example.com/api`.
     * @description
     * Change the URL of the REST API server. By default, the URL provided
     * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
     */
    this.setUrlBase = function (url) {
      urlBase = url;
      urlBaseHost = getHost(urlBase) || location.host;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#getUrlBase
     * @methodOf lbServices.LoopBackResourceProvider
     * @description
     * Get the URL of the REST API server. The URL provided
     * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
     */
    this.getUrlBase = function () {
      return urlBase;
    };

    this.$get = ['$resource', function ($resource) {
      var LoopBackResource = function LoopBackResource(url, params, actions) {
        var resource = $resource(url, params, actions);

        // Angular always calls POST on $save()
        // This hack is based on
        // http://kirkbushell.me/angular-js-using-ng-resource-in-a-more-restful-manner/
        resource.prototype.$save = function (success, error) {
          // Fortunately, LoopBack provides a convenient `upsert` method
          // that exactly fits our needs.
          var result = resource.upsert.call(this, {}, this, success, error);
          return result.$promise || result;
        };
        return resource;
      };

      LoopBackResource.getUrlBase = function () {
        return urlBase;
      };

      LoopBackResource.getAuthHeader = function () {
        return authHeader;
      };

      return LoopBackResource;
    }];
  });
})(window, window.angular);
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