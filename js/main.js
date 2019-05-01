class PatternPlay {
  constructor(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;

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
    this.sounds = ['./sounds/C.mp3', './sounds/Eflat.mp3', './sounds/G.mp3', './sounds/Bflat.mp3'];

    this.numRows = 5;
    this.rows = this.initRows();

    this.nonTargetColor = 'rgba(150,150,150,1.0)';

    this.isDelayed = false;
    this.failedIndex = null;

    this.score = 0;

    canvas.addEventListener('touchstart', this.handleClickEvent.bind(this), false);
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

    setInterval(() => {
      this.draw();
    }, 1000/30);
//     window.requestAnimationFrame(this.draw.bind(this));
  }

  draw(timestamp) {
    this.drawBackground();
    this.drawPaths();
    this.drawTargets();
    this.drawButtons();

//     window.requestAnimationFrame(this.draw.bind(this));
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

  handleClickEvent(event) {
    event.preventDefault();
    if (this.isDelayed) return;

    const x = event.pageX;
    const y = event.pageY;

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

    // Different notes for each index and bad sound when missed. TODO: ******************
//     (new Audio(this.sounds[clickedButtonIndex])).play();


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
  const canvas = document.getElementById('canvas');
  const patternPlay = new PatternPlay(canvas, window.innerWidth, window.innerHeight);

  patternPlay.start();
})()
