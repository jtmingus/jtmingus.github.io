class PatternPlay {
  constructor(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    this.ctx = canvas.getContext('2d');

    this.width = width;
    this.height = height;
    this.isAnimating = false;
    this.isPaused = false;
    this.gameLength = 60;
    this.numPaths = 4;
    this.pathWidth = 3;
    this.colors = ['#00a894', '#007bb0', '#f14d25', '#ffd400'];
    this.backgroundColor = '#333';

    this.numRows = 5;
    this.rows = this.initRows();

    this.nonTargetColor = 'rgba(150,150,150,1.0)';

    this.isDelayed = false;
    this.failedIndex = null;

    this.score = 0;
    this.time = 60;

    const clickEvent = this.handleClickEvent.bind(this);

    canvas.addEventListener('mousedown', clickEvent, false);
    

//     const intervalId = setInterval(() => {
//       this.time -= 1;
//       if (this.time === 0) {
//         canvas.removeEventListener('click', clickEvent, false);
//         clearInterval(intervalId);
//       }
//     }, 1000);
  }

  initRows() {
    const rows = [];

    for(let i = 0; i < this.numRows; i++) {
      const targetIndex = Math.floor(Math.random() * this.numPaths);
      const row = [];
      for(let j = 0 ; j < this.numPaths; j++) {
        row.push(j === targetIndex ? 1 : 0);
      }
      rows.push(row);
    }

    return rows;
  }

  start() {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    window.requestAnimationFrame(this.draw.bind(this));
  }

  draw(timestamp) {
    this.drawBackground();
    this.drawPaths();
    this.drawTargets();
    this.drawButtons();
//     this.drawScore();
//     this.drawTime();

    window.requestAnimationFrame(this.draw.bind(this));
  }

  drawBackground() {
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawButtons() {
    const size = this.getButtonSize();

    for (let i = 0; i < this.numPaths; i++) {
      if (i === this.failedIndex) continue;

      this.ctx.fillStyle = this.colors[i];
      this.ctx.fillRect(0 + i*size, this.height - size, size, size);
    }
  }

  drawPaths() {
    const buttonSize = this.getButtonSize();
    for (let i = 0; i < this.numPaths; i++) {
      const gradient = this.ctx.createLinearGradient(0, this.height, 0, 0);
      gradient.addColorStop(this.getButtonSize()/this.height, this.backgroundColor);
      gradient.addColorStop(0.5, this.colors[i]);

      const x = i*buttonSize + buttonSize/2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = this.pathWidth;
      this.ctx.lineTo(x, this.height-buttonSize);
      this.ctx.stroke();
    }
  }

  drawTargets() {
    this.ctx.save();

    const buttonSize = this.getButtonSize();
    const rowHeight = (this.height - buttonSize) / 5;
    const targetRadius = buttonSize * 1/4;

    for (let row = 0; row < this.numRows; row++) {
      for (let path = 0; path < this.numPaths; path++) {
        // if (row === this.numRows - 1 && path === this.failedIndex) continue;

        this.ctx.beginPath();
        // this.ctx.globalAlpha = !this.rows[row][path] ? 0.5 : 1.0;
        this.ctx.strokeStyle = this.colors[path];
        this.ctx.lineWidth = this.pathWidth;
        this.ctx.fillStyle = this.rows[row][path] ? this.colors[path] : 'rgba(50, 50, 50)';
        const x = path*buttonSize + buttonSize/2;
        const y = row*rowHeight + rowHeight /2;
        this.ctx.arc(x, y, targetRadius, 0, 2*Math.PI);

        this.ctx.fill();
        if (!this.rows[row][path]) {
          this.ctx.stroke();
        }
      }
    }

    this.ctx.restore();
  }

  drawScore() {
    this.ctx.save();
    const width = this.getButtonSize();
    const height = width/2;
    const curvature = width/8;
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);
    this.ctx.lineTo(width - curvature, height);
    this.ctx.quadraticCurveTo(width, height, width, height - curvature);
    this.ctx.lineTo(width, 0);
    this.ctx.strokeStyle = 'white';
    this.ctx.stroke();
    this.ctx.lineTo(0, 0);
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    this.ctx.fill();
    

    const fontSize = Math.floor(height * 0.6);
    const topOffset = Math.floor(height / 10);
    const leftOffset = Math.floor(height * 2 / 5);
    this.ctx.font = fontSize + "px Arial";
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(this.score, leftOffset, fontSize+topOffset);
    this.ctx.restore();
  }

  drawTime() {
    this.ctx.save();
    const width = this.getButtonSize();
    const height = width/2;
    const curvature = width/8;
    this.ctx.beginPath();
    this.ctx.moveTo(this.width, height);
    this.ctx.lineTo(this.width - width + curvature, height);
    this.ctx.quadraticCurveTo(this.width - width, height, this.width - width, height - curvature);
    this.ctx.lineTo(this.width - width, 0);
    this.ctx.strokeStyle = 'white';
    this.ctx.stroke();
    this.ctx.lineTo(this.width, 0);
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    this.ctx.fill();

    const fontSize = Math.floor(height * 0.6);
    const topOffset = Math.floor(height / 10);
    const leftOffset = Math.floor(height* 2/ 5);
    this.ctx.font = fontSize + "px Arial";
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(this.getTime(), this.width - width + leftOffset, fontSize+topOffset);
    this.ctx.restore();
  }

  getTime() {
    const minutes = Math.floor(this.time / 60);
    const seconds = this.time % 60;
    return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
  }

  handleClickEvent(event) {
    if (this.isDelayed) return;

    const x = event.layerX || (event.clientX - document.getElementById('canvas').offsetLeft);
    const y = event.layerY || event.clientY;

    if (y <= this.height && y >= this.height - this.getButtonSize()) {
      const buttonIndex = Math.floor(x / this.getButtonSize());
      if (this.rows[this.rows.length - 1][buttonIndex]) {
        this.passTarget(buttonIndex);
      } else {
        this.failTarget(buttonIndex);
      }
    }
  }

  passTarget(clickedButtonIndex) {
    this.score += 1;

    for (let row = this.rows.length - 1; row >= 0; row--) {

      for (let path = 0; path < this.numPaths; path++) {
        this.rows[row][path] = row === 0 ? 0 : this.rows[row-1][path];
      }
    }

    const newTargetIndex = Math.floor(Math.random() * this.numPaths);
    this.rows[0][newTargetIndex] = 1;
  }

  failTarget(clickedButtonIndex) {
    this.isDelayed = true;
    this.failedIndex = clickedButtonIndex;

    setTimeout(() => {
      this.failedIndex = null;
    }, 500);

    setTimeout(() => {
      this.failedIndex = clickedButtonIndex;
    }, 1000);

    setTimeout(() => {
      this.failedIndex = null;
      this.isDelayed = false;
    }, 1500)
  }

  getButtonSize() {
    return this.width / this.numPaths;
  }

  setGameLength(time) {
    this.gameLength = time;
  }
}

(function startGame() {
  document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive:false });
  
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  const minRatio = 0.65;
  if (canvasWidth / canvasHeight > minRatio) {
    canvasWidth = canvasHeight * minRatio;
  }
  const canvas = document.getElementById('canvas');
  const patternPlay = new PatternPlay(canvas, canvasWidth, canvasHeight);

  patternPlay.start();
})()
