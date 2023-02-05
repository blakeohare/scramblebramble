class TitleScene {
  constructor() {
    this.images = null;
  }

  update(events) {

    let goToNext = false;
    for (let ev of events) {
      if (ev.type === 'TAP') {
        goToNext = true;
      }
    }

    if (DEV_MODE) {
      goToNext = true;
    }

    if (goToNext) {
      setNextScene(new PlayScene());
    }
  }

  render(gfx, renderCounter) {

    if (!this.images) {
      this.images = {};
      'su ku ra n bu ru'.split(' ').forEach(t => { this.images[t] = gfx.getImage('images/ui/' + t + '.png'); });
    }

    let x = 40 + Math.floor(Math.random() * 5);
    let y = 100 + Math.floor(Math.cos(renderCounter / 60 * Math.PI * 2 / 3) * 12)
    
    // Scramble Bramble in Katakana
    {
      let kana = 'su ku ra n bu ru bu ra n bu ru'.split(' ').map(t => this.images[t]);
      let kanaWidth = kana.map(t => t.width).reduce((a, b) => a + b);
      let x = 15;
      let y = (HEIGHT - kana[0].height) / 3;
      for (let char of kana) {
        let rx = Math.floor(x + Math.random() * 0 - 1);
        let ry = Math.floor(y + Math.random() * 0 - 1 + -Math.abs(Math.cos(x * x + renderCounter / FPS * 2 * Math.PI * 2) * 8));
        gfx.drawImage(char, rx, ry);
        x += char.width - 12  ;
      }
    }
    
    gfx.drawText("Scramble Bramble", "M", x, y + 60, 0, 128, 0);
    // gfx.rectangle(this.x, this.y, 30, 30, 0, 0, 255);
    gfx.drawText("(press anywhere)", "M", 200, 200, 180, 180, 180);
  }
}
