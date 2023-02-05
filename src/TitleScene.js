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
      'su ku ra n bu ru fu dakuten title press-anywhere'.split(' ').forEach(t => { this.images[t] = gfx.getImage('images/ui/' + t + '.png'); });
    }

    let x = 40 + Math.floor(Math.random() * 5);
    let y = 100 + Math.floor(Math.cos(renderCounter / 60 * Math.PI * 2 / 3) * 12)

    // Scramble Bramble in Katakana
    {
      let fu = this.images['fu'];
      let dakuten = this.images['dakuten'];
      let kana = 'su ku ra n bu ru bu ra n bu ru'.split(' ');
      let x = 15;
      let y = (HEIGHT - this.images['su'].height) / 3;
      for (let char of kana) {
        let img = this.images[char];
        let images = [img];
        let offsets = [0];
        // The dakutens should bounce at a slight delay from their attached character
        if (char === 'bu') {
          images = [fu, dakuten];
          offsets = [0, -Math.floor(FPS / 15)];
        }
        for (let i = 0; i <  images.length; i++) {
          let rx = Math.floor(x);
          let ry = Math.floor(y + -Math.abs(Math.cos(x * x * x  + (renderCounter + offsets[i]) / FPS * 2 * Math.PI * 2) * 8));
          gfx.drawImage(images[i], rx, ry);
        }
        x += img.width - 12;
      }
    }

    {
      let msg = this.images['title'];
      gfx.drawImage(msg,
        Math.floor((WIDTH - msg.width) / 2),
        150 - Math.floor(12 * Math.abs(Math.cos(1.5 * renderCounter / FPS * Math.PI * 2))));
    }

    if ((renderCounter / FPS * 2) % 1 < 0.6) {
      let msg = this.images['press-anywhere'];
      gfx.drawImage(msg, Math.floor((WIDTH - msg.width) / 2), 200);
    }
  }
}
