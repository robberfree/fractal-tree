(function() {
  var canvas = document.querySelector('canvas');
  var flower = document.querySelector('.flower');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var tree = new Tree(canvas, {
    flower: {
      image: flower
    }
  }).grow();

  canvas.addEventListener('click', function(e) {
    var tree = new Tree(canvas, {
      startX: e.clientX,
      startY: canvas.height,
      level: Math.round(1 + Math.random() * 8),
      flower: {
        image: flower
      }
    }).grow();
  });
})();
