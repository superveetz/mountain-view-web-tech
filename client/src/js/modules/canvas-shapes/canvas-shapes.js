(function (angular) {
    // declare app and load dependencies
    angular.module('canvas-raining', [
    ])
    .directive('canvasRaining', ['$interval', 'CanvasSystem', function ($interval, CanvasSystem) {
        return {
            restrict: 'A',
            link: function (scope, elem) {
                // canvas animation taken from: https://codepen.io/ruigewaard/pen/JHDdF
                elem.ready(() => {
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
    }])
    
    .factory('CanvasSystem', [function () {
        var cSystem = function (elem)  {
            this.ctx    = elem[0].getContext('2d');
            this.w      = elem.width();
            this.h      = elem.height();
            this.x      = 0;
            this.y      = 0;
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