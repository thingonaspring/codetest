import {Container, Sprite, Text, TextStyle, Texture} from "pixi.js";
import {ButtonStates} from "../enums/ButtonStates";
import {Utils} from "../utils/Utils";

export class SimpleButton extends Container {
  private _isEnabled: boolean;
  private _onClickHandler: Function;
  private _clickArea: Sprite;
  private _textLabel: Text;

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public set isEnabled(enabled: boolean) {
    this._isEnabled = enabled;
    this._clickArea.buttonMode = enabled;
    this._clickArea.interactive = enabled;
  }

  public set clickHandler(handler: Function) {
    this._onClickHandler = handler;
  }

  constructor() {
    super();
    this.init();
    this.isEnabled = true;
  }

  private init(): void {

    this._clickArea = new Sprite(Texture.WHITE);
    this._clickArea.alpha = 0.5;
    this._clickArea.anchor.set(0.5);
    this._clickArea.interactive = true;
    this._clickArea.buttonMode = true;
    this.addChild(this._clickArea);

    this._clickArea.on(ButtonStates.OVER, this.handlePointerOver, this);
    this._clickArea.on(ButtonStates.OUT, this.handlePointerOut, this);
    this._clickArea.on(ButtonStates.DOWN, this.handlePointerDown, this);
    this._clickArea.on(ButtonStates.UP, this.handlePointerUp, this);

    const textStyle: TextStyle = Utils.getTextStyle();
    this._textLabel = new Text('button', textStyle);
    this._textLabel.anchor.set(0.5);
    this.addChild(this._textLabel);
    this.updateClickArea();
  }

  private updateClickArea(): void {
    this._clickArea.width = this.width;
    this._clickArea.height = this.height;
  }

  public updateTextLabel(text: string): void {
    this._textLabel.text = text;
    this.updateClickArea();
  }

  public setVisible(visible: boolean): void {
    this.visible = visible;
  }

  private handlePointerOver(): void {
    this.changeState(ButtonStates.OVER);
  }

  private handlePointerOut(): void {
    this.changeState(ButtonStates.OUT);
  }

  private handlePointerDown(): void {
    this.changeState(ButtonStates.DOWN);
  }

  private handlePointerUp(): void {
    this.changeState(ButtonStates.UP);
    if (this._onClickHandler) {
      this._onClickHandler.call(this);
    }
  }

  private changeState(state: string): void {
    //console.log('bgb', 'button state now', state);
  }

}
