(function() {
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
  var context = canvas.getContext('2d');
  var flower = document.querySelector('.flower');

  var LEVEL = 9; //整个树结构的层级,[0,LEVEL]
  var LENGTH = 200; //树干/树枝的最大长度
  var ANGLE = {
    min: 30,
    max: 60
  }; //两个树枝间的夹角范围
  var GOLDEN_RATIO = 0.618; //黄金比例
  var ANGLE_2_RADIAN = Math.PI / 180; //角度转弧度的常量
  var SPEED = 0.1; //frame/px做动画时每像素需要的帧数
  var FLOWER_WIDTH = {
    min: 10,
    max: 30
  }; //绘制flower时的宽度范围

  var tweens = [];
  var currentFrame = 0;
  var animId;

  context.lineWidth = 1;
  context.strokeStyle = '#212121';

  function randomValueInRange(range) {
    return range.min + (range.max - range.min) * Math.random();
  }

  function drawTrunkAndBranch(x, y, angle, level, delay) {
    if (level <= LEVEL) {
      var trunkLength = LENGTH * Math.pow(GOLDEN_RATIO, level, delay);
      var radian = angle * ANGLE_2_RADIAN;
      var x2 = x + trunkLength * Math.cos(radian);
      var y2 = y - trunkLength * Math.sin(radian); //canvas的坐标系统与平面直角坐标系y轴相反
      var duration = Math.round(trunkLength * SPEED);
      new Tween({ x: x, y: y }, { x: x2, y: y2 }, duration, delay);

      drawTrunkAndBranch(
        x2,
        y2,
        angle + randomValueInRange(ANGLE) * 0.5,
        level + 1,
        delay + duration
      ); //左树枝
      drawTrunkAndBranch(
        x2,
        y2,
        angle - randomValueInRange(ANGLE) * 0.5,
        level + 1,
        delay + duration
      ); //右树枝
    }
  }

  function update() {
    var liveTween = false;
    Array.prototype.forEach.call(tweens, function(tween) {
      if (tween.delay <= currentFrame && tween.currentFrame <= tween.duration) {
        hasTween = true;
        tween.draw();
      }
    });
    if (liveTween === false) {
      cancelAnimFrame(animId);
    }

    currentFrame += 1;
    animId = requestAnimFrame(update);
  }

  drawTrunkAndBranch(300, 800, 90, 0, 0);
  animId = requestAnimFrame(update);

  function Tween(from, to, duration, delay) {
    this.from = this.current = from;
    this.to = to;
    this.duration = duration;
    this.currentFrame = 0;
    this.delay = delay;

    tweens.push(this);
  }

  Tween.prototype.draw = function() {
    var x2 =
      this.from.x +
      this.currentFrame / this.duration * (this.to.x - this.from.x);
    var y2 =
      this.from.y +
      this.currentFrame / this.duration * (this.to.y - this.from.y);

    context.beginPath();
    context.moveTo(this.current.x, this.current.y);
    context.lineTo(x2, y2);
    context.stroke();

    if (Math.random() < 0.02) {
      var flowerWidth = randomValueInRange(FLOWER_WIDTH);
      var flowerHeight = flower.width / flower.height * flowerWidth;
      context.drawImage(
        flower,
        0,
        0,
        flower.width,
        flower.height,
        this.current.x - flowerWidth * 0.5, //对齐中心点
        this.current.y - flowerHeight * 0.5,
        flowerWidth,
        flowerHeight
      );
    }

    this.current = { x: x2, y: y2 };
    this.currentFrame += 1;
  };

  function Flower() {}
})();
