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
    let x = 8 + Math.floor(Math.random() * 5);
    let y = 100 + Math.floor(Math.cos(renderCounter / 20 * Math.PI * 2 * 3) * 3 + Math.random() * 5)

    let fadeInDuration = FPS / 2;
    let alpha = Math.floor(160 * this.counter / fadeInDuration);
    alpha = Math.max(0, Math.min(160, alpha));

    this.bg.render(gfx, renderCounter);
    gfx.rectangle(0, 0, WIDTH, HEIGHT, 0, 0, 0, alpha);
    {
      let lose = gfx.getImage('images/ui/lose-kanji.png');
      let x = (WIDTH - lose.width) / 1;
      let y = (HEIGHT - lose.height) / 3;
      x += Math.random() * 6 - 3;
      y += Math.random() * 8 - 4;
      gfx.drawImage(lose, Math.floor(x), Math.floor(y));
    }
    gfx.drawText("THE WEEDS HAVE WON", "XL", x, y, 255, 255, 255);
    gfx.drawText("(press anywhere)", "M", 200, 400, 180, 180, 180);
  }
}