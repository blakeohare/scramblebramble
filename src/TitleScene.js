class TitleScene {
  constructor() {
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
    let x = 200 + Math.floor(Math.random() * 5);
    let y = 200 + Math.floor(Math.cos(renderCounter / 60 * Math.PI * 2 / 3) * 12)
    gfx.drawText("スクランブルブランブル", "XL", x, y, 0, 128, 0);
    gfx.drawText("Scramble Bramble", "L", x, y + 60, 0, 128, 0);
    // gfx.rectangle(this.x, this.y, 30, 30, 0, 0, 255);
    gfx.drawText("(press anywhere)", "M", 200, 400, 180, 180, 180);
  }
}