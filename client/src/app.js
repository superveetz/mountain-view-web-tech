(function (angular, firebase) {
    // declare app and load dependencies
    angular.module('app', [
        'smoothScroll',
        'firebase',
        'ui.router',
        'ui.bootstrap',
        'ui.validate',
        'ngAnimate',
        'app.controllers',
        'app.directives',
        'app.services',
        'canvas-raining',
        'ngResource',
        'lbServices',
        'angulartics',
        'angulartics.google.analytics'
    ])

    .run(['$rootScope', '$state', '$window', '$firebaseAuth', '$location', '$anchorScroll', '$timeout', function ($rootScope, $state, $window, $firebaseAuth, $location, $anchorScroll, $timeout) {
        // Initialize the Firebase SDK
        var config = {
            apiKey: 'AIzaSyDLoNjTWobxBBCIkHVHno2wgL78wAdXdLY',
            authDomain: 'cis245-final-project.firebaseapp.com',
            databaseURL: 'https://cis245-final-project.firebaseio.com',
        };
        firebase.initializeApp(config);

        // attach $state to public $rootScope so that it can be used freely in templates
        $rootScope.$state = $state;
        
        // store Current User data
        $rootScope.CurrentUser = undefined;
        
        // register an event that will listen for firebase authentication
        $firebaseAuth().$onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                $rootScope.CurrentUser = firebaseUser;
            } else {
                $rootScope.CurrentUser = undefined;
            }
        });

        // hook into onStateChangeStart event
        $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
            // cancel state transition if 1 is occuring already
            if ($rootScope.stateChangeOccuring) return e.preventDefault();

            // disable any further state transitions
            $rootScope.stateChangeOccuring = true;
        });

        // hook into onStateChangeSuccess event
        $rootScope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
            // scroll to top on page once state change transition starts
            $location.hash(fromState.name);
            $anchorScroll();
            $location.hash('');

            // wait for transitition animation to end after 1s
            $timeout(() => {
                // allow state changes again
                $rootScope.stateChangeOccuring = false;
            }, 500);
        });
        
    }])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        // enable html5 mode (otherwise angularjs hashes urls with `#/#!/{config}`)
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        });

        // forced client routing sends to 404 for any unrecognized url
        $urlRouterProvider.otherwise('404');
        
        // declare all app states
        // TODO: add dynamic SEO
        $stateProvider
        .state('app', {
            abstract: true,
            url: '',
            templateUrl: '/views/index.html',
            controller: ['$rootScope', '$timeout', function ($rootScope, $timeout) {
                
            }]
        })
        
        .state('app.home', {
            url: '/',
            templateUrl: '/views/home/index.html',
            controller: ['$timeout', function ($timeout) {
                $timeout(() => {
                    window.prerenderReady = true;
                }, 500);
            }]
        })
        
        .state('app.about', {
            url: '/about',
            templateUrl: '/views/about/index.html',
            controller: ['$timeout', function ($timeout) {
                $timeout(() => {
                    window.prerenderReady = true;
                }, 500);
            }]
        })

        .state('app.services', {
            url: '/services',
            templateUrl: '/views/services/index.html',
            controller: ['$timeout', function ($timeout) {
                $timeout(() => {
                    window.prerenderReady = true;
                }, 500);
            }]
        })
        
        .state('app.contact', {
            url: '/contact',
            templateUrl: '/views/contact/index.html',
            controller: 'ContactCtrl'
        })
        .state('404', {
            url: '/404',
            templateUrl: '/views/404/index.html',
            controller: ['$timeout', function ($timeout) {
                $timeout(() => {
                    window.prerenderReady = true;
                }, 500);
            }]
        });
    }]);
})(angular, firebase);