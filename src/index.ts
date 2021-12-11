import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';
import OverScene from './scenes/Over';

function loadFont(name: string, url: string) {
  var newFont = new FontFace(name, `url(${url})`);
  newFont.load().then(function (loaded) {
      document.fonts.add(loaded);
  }).catch(function (error) {
      return error;
  });
}

loadFont('rainy', 'src/resources/font/rainyhearts.ttf');

new Phaser.Game(
  Object.assign(config, {
    scene: [GameScene, OverScene]
  })
);
