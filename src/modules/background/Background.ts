import {Container, Sprite, utils} from "pixi.js";
import {ImageNames} from "../../constants/AssetConstants";

export class Background extends Container {
  private _background: Sprite;

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    this._background = new Sprite();
    this._background.texture = utils.TextureCache[ImageNames.BACKGROUND];
    this.addChild(this._background);
  }
}
