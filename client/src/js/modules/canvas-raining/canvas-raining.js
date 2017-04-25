(function (angular) {
    // declare app and load dependencies
    angular.module('canvas-raining', [
    ])
    .directive('canvasRaining', ['$interval', function ($interval) {
        return {
            restrict: 'A',
            link: function (scope, elem) {
                // canvas animation taken from: https://codepen.io/ruigewaard/pen/JHDdF
                elem.ready(() => {
                    let ctx     = elem[0].getContext('2d');
                    const w     = elem.width();
                    const h     = elem.height();

                    ctx.strokeStyle              = 'rgba(174,194,224,0.5)';
                    // ctx.strokeStyle              = 'rgba(0,0,0,1)';
                    ctx.lineWidth                = 0.5;
                    ctx.lineCap                  = 'round';
                    ctx.globalCompositeOperation ='destination-over';

                    var init = [];
                    var maxParts = 2000;
                    for(var a = 0; a < maxParts; a++) {
                        init.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            l: Math.random() * 1,
                            xs: -4 + Math.random() * 4 + 2,
                            ys: Math.random() * 10 + 5
                        })
                    }

                    var particles = [];
                    for(var b = 0; b < maxParts; b++) {
                        particles[b] = init[b];
                    }

                    function draw() {
                        ctx.clearRect(0, 0, w, h);
                        for(var c = 0; c < particles.length; c++) {
                            var p = particles[c];
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
                            ctx.stroke();
                        }
                        move();
                    }

                    function move() {
                        for(var b = 0; b < particles.length; b++) {
                            var p = particles[b];
                            p.x += (p.xs + (mousePositionRatio * (Math.random() * 20)));
                            p.y += p.ys;
                            
                            if(p.x > w || p.y > h) {
                                p.x = Math.random() * w;
                                p.y = -20;
                            }
                        }
                    }
                    
                    $interval(draw, 60);

                    // register mousemove listener
                    let mousePositionRatio = 0;
                    elem.bind('mousemove', (event) => {
                        mousePositionRatio = event.clientX / elem.width() - 0.5;
                        
                    });
                });
            }
        };
    }]);
})(angular);