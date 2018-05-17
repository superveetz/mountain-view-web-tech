(function (angular) {
    angular.module('app.services', [
        'app.controllers'
    ])

    .service('MvWtSeoService', [function () {
        let seoObj = {
            firstCall: false,
            mainTitle: '', // main title from the <title> element
            currentTitle: '',
            delimittingChar: '|'
        };

        return {
            setTitle: function (title) {
                // get main title from <title> on first setTitle() call
                if (!seoObj.mainTitle && !seoObj.firstCall) {
                    seoObj.mainTitle    = angular.element('head title').text();
                    seoObj.firstCall    = true;
                }
                
                seoObj.currentTitle     = seoObj.mainTitle ? title + " " + seoObj.delimittingChar + " " + seoObj.mainTitle : title;
                angular.element('head title').text(seoObj.currentTitle);
            },
            setDescription: function (description) {
                angular.element('head meta[name="description"]').attr('contents', description);
            }
        };
    }])
    
    .service('ModalService', ['$uibModal', '$timeout', function ($uibModal, $timeout) {
        return {
            openRegisterAccountModal: function () {
                let modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'register-account-title',
                    ariaDescribedBy: 'register-account-body',
                    templateUrl: 'register-account-modal.html', // found nested in main-nav.html template
                    controller: 'RegisterAccountCtrl',
                    backdrop: true,
                    size: 'md'
                });

                // catch the promise propgated by the modal to avoid any errors (required)
                modalInstance.result
                .then(result => {

                })
                .catch(err => {
                    
                });
            },

            openLoginModal: function () {
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
                modalInstance.result
                .then(result => {

                })
                .catch(err => {
                    
                });
            }
        };
    }])
    
    .service('AlertService', ['$timeout', function ($timeout) {

        let alert = {
            show: false,
            type: 'success'
        };

        return {
            showAlert: function () {
                alert.show = true;
                return true;
            },
            hideAlert: function () {
                alert.show = false;
                return true;
            },
            hasAlert: function () {
                return alert.show;
            },
            reset: function () {
                alert = {};
                return true;
            },
            setAlert: function (alertObj) {
                // update alert 
                alert = angular.copy(alertObj);  

                // parse slim application server error
                if (alert.type == 'error' && alert.slimErr) {
                    alert.errList = [];
                    alert.title = alert.slimErr && 
                                     alert.slimErr.data && 
                                     alert.slimErr.data.exception && 
                                     alert.slimErr.data.exception[0] && 
                                     alert.slimErr.data.exception[0].message ? 
                                     alert.slimErr.data.exception[0].message :
                                     'Error';
                }

                return true;
            },
            getAlert: function () {
                return alert;
            }
        };
    }]);

})(angular);