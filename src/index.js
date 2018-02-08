var Tree = (function() {
  //常量
  var GOLDEN_RATIO = 0.618;
  var ANGLE_2_RADIAN = Math.PI / 180;
  //帮助函数
  function randomValueInRange(range) {
    return range.min + (range.max - range.min) * Math.random();
  }

  function or(v1, v2) {
    if (v1 === undefined || v1 === null) return v2;
    else return v1;
  }

  var requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(handler) {
      setTimeout(handler, 1 / 60 * 1000);
    };

  var cancelAnimFrame =
    window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    function(id) {
      clearTimeout(id);
    };

  var canvas = document.querySelector('canvas');
  var flower = document.querySelector('.flower');

  var tweens = [];
  var currentFrame = 0;
  var animId;
  var flowerPositions = [];

  function update() {
    var liveTween = false;
    Array.prototype.forEach.call(tweens, function(tween) {
      if (tween.delay <= currentFrame && tween.currentFrame <= tween.duration) {
        liveTween = true;
        tween.on();
      }
    });
    if (liveTween === false) {
      cancelAnimFrame(animId);
      tree.bloom();
    }

    currentFrame += 1;
    animId = requestAnimFrame(update);
  }

  function Tree(canvas, options) {
    this.context = canvas.getContext('2d');
    this.flowers = [];

    options = or(options, {});
    options.flower = or(options.flower, {});

    this.options = {
      startX: or(options.startX, 300),
      startY: or(options.startY, 800),
      startAngle: or(options.startAngle, 90),
      strokeStyle: or(options.strokeColor, '#000'),
      level: or(options.level, 7),
      length: or(options.length, 200),
      thicknessPerLevel: or(options.thicknessPerLevel, 1),
      angle: or(options.angle, {
        min: 30,
        max: 60
      }),
      framePerPx: or(options.framePerPx, 0.1),
      flower: {
        width: or(options.flower.width, { min: 4, max: 8 })
      }
    };
  }

  Tree.prototype = {
    grow: function() {
      this.drawTrunkAndBranch(
        this.options.startX,
        this.options.startY,
        this.options.startAngle,
        1,
        0
      );
      return this;
    },
    drawTrunkAndBranch: function(x, y, angle, level, delay) {
      if (level <= this.options.level) {
        var trunkLength =
          this.options.length * Math.pow(GOLDEN_RATIO, level - 1, delay);
        var radian = angle * ANGLE_2_RADIAN;
        var x2 = x + trunkLength * Math.cos(radian);
        var y2 = y - trunkLength * Math.sin(radian); //canvas的坐标系统与平面直角坐标系y轴相反
        var duration = Math.round(trunkLength * this.options.framePerPx);
        new Tween(
          { x: x, y: y },
          { x: x2, y: y2 },
          duration,
          delay,
          function(current, last) {
            this.context.beginPath();
            this.context.strokeStyle = this.options.strokeStyle;
            this.context.lineWidth =
              (this.options.level - level + 1) * this.options.thicknessPerLevel;
            this.context.moveTo(last.x, last.y);
            this.context.lineTo(current.x, current.y);
            this.context.stroke();
          }.bind(this)
        );

        this.drawTrunkAndBranch(
          x2,
          y2,
          angle + randomValueInRange(this.options.angle) * 0.5,
          level + 1,
          delay + duration
        ); //左树枝
        this.drawTrunkAndBranch(
          x2,
          y2,
          angle - randomValueInRange(this.options.angle) * 0.5,
          level + 1,
          delay + duration
        ); //右树枝

        this.getFlowerPosition(x, y, x2, y2);
      }
    },
    /**
     * 在(x2,y2)，线段的两个黄金分割点，选取一个点绘制flower
     */
    getFlowerPosition: function(x1, y1, x2, y2) {
      var random = Math.random();
      var position = {};

      if (random < 1 / 3) {
        position['x'] = (x2 - x1) * (1 - GOLDEN_RATIO) + x1;
        position['y'] = (y2 - y1) * (1 - GOLDEN_RATIO) + y1;
      } else if (random < 2 / 3) {
        position['x'] = (x2 - x1) * GOLDEN_RATIO + x1;
        position['y'] = (y2 - y1) * GOLDEN_RATIO + y1;
      } else {
        position['x'] = x2;
        position['y'] = y2;
      }

      this.flowers.push(position);
    },
    bloom: function() {
      this.flowers.forEach(
        function(_flower) {
          var flowerWidth = randomValueInRange(this.options.flower.width);
          var flowerHeight = flower.width / flower.height * flowerWidth;
          this.context.drawImage(
            flower,
            0,
            0,
            flower.width,
            flower.height,
            _flower.x - flowerWidth * 0.5, //对齐中心点
            _flower.y - flowerHeight * 0.5,
            flowerWidth,
            flowerHeight
          );
        }.bind(this)
      );
    }
  };

  function Tween(from, to, duration, delay, onUpdate) {
    this.from = this.current = from;
    this.to = to;
    this.duration = duration;
    this.currentFrame = 0;
    this.delay = delay;
    this.onUpdate = onUpdate;

    tweens.push(this);
  }

  Tween.prototype.on = function() {
    let current = {};
    Object.keys(this.from).forEach(
      function(key) {
        current[key] =
          this.from[key] +
          this.currentFrame / this.duration * (this.to[key] - this.from[key]);
      }.bind(this)
    );
    this.onUpdate(current, this.current);

    this.current = current;
    this.currentFrame += 1;
  };

  var tree = new Tree(canvas).grow();
  var tree2 = new Tree(canvas, {
    startX: 0,
    startY: 800
  }).grow();
  animId = requestAnimFrame(update);

  return Tree;
})();
