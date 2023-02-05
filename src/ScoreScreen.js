class ScoreScreen {

  constructor(bg) {
    this.bg = bg;
    this.counter = 0;
  }

  update(events) {

    this.counter++;

    let goToNext = false;
    for (let ev of events) {
      if (ev.type === 'TAP' && this.counter > FPS) {
        goToNext = true;
      }
    }

    if (goToNext) {
      setNextScene(new TitleScene());
    }
  }

  render(gfx, renderCounter) {
    let x = Math.floor(Math.random() * 3 + WIDTH / 3);
    let y = 100 + Math.floor(Math.cos(renderCounter / 20 * Math.PI * 2 * 3) * 3 + Math.random() * 3)

    let fadeInDuration = FPS / 2;
    let alpha = Math.floor(160 * this.counter / fadeInDuration);
    alpha = Math.max(0, Math.min(160, alpha));

    this.bg.render(gfx, renderCounter);
    gfx.rectangle(0, 0, WIDTH, HEIGHT, 0, 0, 0, alpha);
    {
      let lose = gfx.getImage('images/ui/lose-kanji.png');
      let x = 3 * (WIDTH - lose.width) / 4;
      let y = (HEIGHT - lose.height) / 3;
      x += Math.random() * 6 - 3;
      y += Math.random() * 8 - 4;
      gfx.drawImage(lose, Math.floor(x), Math.floor(y));
    }
    gfx.drawImage(gfx.getImage('images/ui/weeds-won2.png'), x, y);

    if ((renderCounter / FPS * 2) % 1 < 0.6) {
      let msg = gfx.getImage('images/ui/press-anywhere.png');
      gfx.drawImage(msg, Math.floor((WIDTH - msg.width) / 2), 200);
    }
  }
}