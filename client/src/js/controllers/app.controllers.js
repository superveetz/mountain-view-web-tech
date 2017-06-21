(function (angular) {
    angular.module('app.controllers', [
        'app.services'
    ])

    .controller('MainNavCtrl', ['$rootScope', '$timeout', '$scope', '$firebaseAuth', '$http', '$window', '$state', '$timeout', 'ModalService', 'AlertService', function ($rootScope, $timeout, $scope, $firebaseAuth, $http, $window, $state, $timeout, ModalService, AlertService) {
        // init $scope
        $scope.authObj = $firebaseAuth();

        $timeout(() => {
            window.prerenderReady = true;
        }, 500);
        
        // open register account modal
        $scope.openRegisterAccountModal = function (closeMobileNav) {
            AlertService.reset();

            if (closeMobileNav) {
                $scope.closeMobileSideNav();
                // wait for mobile side nav to close, then open modal
                $timeout(() => {
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
                $timeout(() => {
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

    }])
    
    .controller('LoginCtrl', ['$rootScope', '$firebaseAuth', '$scope', '$http', '$window', '$uibModalInstance', 'AlertService', function ($rootScope, $firebaseAuth, $scope, $http, $window, $uibModalInstance, AlertService, AuthService) {
        // defaults
        const dNewUser = {
            email: '',
            pass: '',
            cPass: ''
        };

        const dExistingUser = {
            email: '',
            pass: ''
        };

        const dServerResponse = {
            loginErr: false,
            signUpErr: false
        };

        // init $scope
        $scope.serverResponse   = angular.copy(dServerResponse);
        $scope.authObj          = $firebaseAuth();
        $scope.newUser          = angular.copy(dNewUser);
        $scope.existingUser     = angular.copy(dNewUser);
        
        // submit sign up form
        $scope.submitSignUpForm = function () {
            // turn on loading spinner
            $scope.signUpSubmit = true;

            // make sign up request to our firebase API
            $scope.authObj.$createUserWithEmailAndPassword($scope.newUser.email, $scope.newUser.pass)
            .then(response => {
                // success
                $scope.signUpSubmit = false;
                $scope.closeModal();
            })
            .catch(err => {
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
            $scope.authObj.$signInWithEmailAndPassword($scope.existingUser.email, $scope.existingUser.pass)
            .then(response => {
                // success
                $scope.loginSubmit = false;
                $scope.closeModal();
            })
            .catch(err => {
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

            $scope.authObj.$signInWithPopup("facebook")
            .then(res => {
                // success
                $scope.fbSubmit = false;
                $scope.closeModal();
            })
            .catch(err => {
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

            $scope.authObj.$signInWithPopup("twitter")
            .then(res => {
                // success
                $scope.twitSubmit = false;
                $scope.closeModal();
            })
            .catch(err => {
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

            $scope.authObj.$signInWithPopup("google")
            .then(res => {
                // success
                $scope.googSubmit = false;
                $scope.closeModal();
            })
            .catch(err => {
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
    }])

    .controller('MainFooterCtrl', ['$scope', '$document', '$location', '$state', 'smoothScroll', function ($scope, $document, $location, $state, smoothScroll) {
        
    }])
    
    .controller('AppCtrl', ['$rootScope', '$state', function ($rootScope, $state) {
        
    }])
    
    .controller('ContactCtrl', ['$scope', '$http', 'AlertService', 'Mail', function ($scope, $http, AlertService, Mail) {
        // defaults
        const dUser = {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        };

        const dServerResponse = {
            loginErr: false,
            signUpErr: false
        };

        // init $scope
        $scope.user             = angular.copy(dUser);
        $scope.serverResponse   = angular.copy(dServerResponse);

        $scope.sendEmail = function () {
            $scope.submitSendEmail = true;
            Mail.create({
                name: $scope.user.name,
                email: $scope.user.email,
                phone: $scope.user.phone,
                subject: $scope.user.subject,
                message: $scope.user.message
            })
            .$promise
            .then(res => {
                $scope.submitSendEmail = false;
                $scope.user = angular.copy(dUser);
                $scope.contactForm.$setPristine();
                $scope.contactForm.$setUntouched();
                AlertService.setAlert({
                    show: true,
                    type: 'success',
                    title: 'We have received your request and will get back to you as soon as we can.'
                });
            })
            .catch(err => {
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