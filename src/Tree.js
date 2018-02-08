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
  //Tween
  function Tween(from, to, duration, delay, onUpdate) {
    this.from = this.current = from;
    this.to = to;
    this.duration = duration;
    this.currentFrame = 0;
    this.delay = delay;
    this.onUpdate = onUpdate;
  }

  Tween.prototype = {
    on: function() {
      let current = {};
      Object.keys(this.from).forEach(
        function(key) {
          current[key] =
            this.from[key] +
            this.currentFrame / this.duration * (this.to[key] - this.from[key]);
        }.bind(this)
      );

      if (this.onUpdate) this.onUpdate(current, this.current);

      this.current = current;
      this.currentFrame += 1;
    }
  };
  //Flower
  function Flower(context, x, y, options) {
    var flowerWidth = randomValueInRange(options.width);
    var flowerHeight = options.image.width / options.image.height * flowerWidth;
    context.globalAlpha = Math.random();
    context.drawImage(
      options.image,
      0,
      0,
      options.image.width,
      options.image.height,
      x - flowerWidth * 0.5, //对齐中心点
      y - flowerHeight * 0.5,
      flowerWidth,
      flowerHeight
    );
    context.globalAlpha = 1;
  }

  //Tree
  function Tree(canvas, options) {
    this.context = canvas.getContext('2d');
    this.flowers = [];
    this.tweens = [];
    this.currentFrame = 0;
    this.animId = undefined;

    options = or(options, {});
    options.flower = or(options.flower, {});
    this.options = {
      startX: or(options.startX, canvas.width * 0.5),
      startY: or(options.startY, canvas.height),
      startAngle: or(options.startAngle, 90),
      strokeStyle: or(options.strokeColor, '#000'),
      widthPerLevel: or(options.widthPerLevel, 1),
      lengthPerLevel: or(options.lengthPerLevel, 30),
      level: or(options.level, 8),
      angle: or(options.angle, {
        min: 30,
        max: 60
      }),
      framePerPx: or(options.framePerPx, 0.1),
      flower: {
        width: or(options.flower.width, { min: 4, max: 12 }),
        image: options.flower.image
      }
    };
  }

  Tree.prototype = {
    update: function() {
      var liveTween = false;
      this.tweens.forEach(
        function(tween) {
          if (
            tween.delay <= this.currentFrame &&
            tween.currentFrame <= tween.duration
          ) {
            liveTween = true;
            tween.on();
          }
        }.bind(this)
      );

      if (liveTween === false) {
        cancelAnimFrame(this.animId);
        this.bloom();
      } else {
        this.currentFrame += 1;
        animId = requestAnimFrame(this.update.bind(this));
      }
    },
    grow: function() {
      this.drawTrunkAndBranch(
        this.options.startX,
        this.options.startY,
        this.options.startAngle,
        1,
        0
      );

      this.animId = requestAnimFrame(this.update.bind(this));

      return this;
    },
    drawTrunkAndBranch: function(x, y, angle, level, delay) {
      if (level <= this.options.level) {
        var length = this.getValue(level, this.options.lengthPerLevel);
        var radian = angle * ANGLE_2_RADIAN;
        var x2 = x + length * Math.cos(radian);
        var y2 = y - length * Math.sin(radian); //canvas的坐标系统与平面直角坐标系y轴相反
        var duration = Math.round(length * this.options.framePerPx);
        this.tweens.push(
          new Tween(
            { x: x, y: y },
            { x: x2, y: y2 },
            duration,
            delay,
            function(current, last) {
              this.context.beginPath();
              this.context.strokeStyle = this.options.strokeStyle;
              this.context.lineWidth = this.getValue(
                level,
                this.options.widthPerLevel
              );
              this.context.moveTo(last.x, last.y);
              this.context.lineTo(current.x, current.y);
              this.context.stroke();
            }.bind(this)
          )
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
    getValue: function(level, per) {
      return Math.pow(GOLDEN_RATIO, level - 1) * this.options.level * per;
    },
    getFlowerPosition: function(x1, y1, x2, y2) {
      //从(x2,y2)、线段的两个黄金分割点中选取一个点绘制flower
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
      let img = this.options.flower.image;
      this.flowers.forEach(
        function(_flower) {
          new Flower(this.context, _flower.x, _flower.y, this.options.flower);
        }.bind(this)
      );
    }
  };

  return Tree;
})();
