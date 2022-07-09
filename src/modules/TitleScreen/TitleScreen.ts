import gsap from "gsap";
import Signal from 'signals';
import {Container, Sprite, Text, TextStyle, Texture} from "pixi.js";
import {TextConstants} from "../../constants/TextConstants";
import {Utils} from "../../utils/Utils";

export class TitleScreen extends Container {
  public clickStart: Signal = new Signal();
  private _titleText: Text;
  private _startButton: Container;

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    this.setupTitleText();
    this.setupStartButton();
  }

  private setupTitleText(): void {
    const style: TextStyle = Utils.getTextStyle();
    style.fontSize = 96;
    this._titleText = new Text(TextConstants.gameTitle, style);
    this._titleText.anchor.set(0.5);
    this.addChild(this._titleText);
  }

  private setupStartButton(): void {
    this._startButton = new Container();
    const style: TextStyle = Utils.getTextStyle();
    style.fontSize = 48;
    const buttonText: Text = new Text(TextConstants.clickToSpin, style);
    buttonText.anchor.set(0.5);
    this._startButton.addChild(buttonText);
    this._startButton.x = this._titleText.x;
    this._startButton.y = this._titleText.y + this._titleText.height;
    const clickArea: Sprite = new Sprite(Texture.WHITE);
    clickArea.alpha = 0;
    clickArea.anchor.set(0.5);
    clickArea.interactive = true;
    clickArea.buttonMode = true;
    clickArea.width = this._startButton.width * 1.5;
    clickArea.height = this._startButton.height * 1.5;
    clickArea.on('pointerup', () => {
      this.onStartButtonClick();
    });
    clickArea.on('pointerover', () => {
      this.disableButtonAnimation();
      buttonText.tint = 0xffff00;
    });
    clickArea.on('pointerout', () => {99
      buttonText.tint = 0xffffff;
      this.animateButton();
    });
    this._startButton.addChild(clickArea);
    this.addChild(this._startButton);
  }

  public activate(): void {
    this.animateButton();
    this.setButtonState(true);
  }

  private onStartButtonClick(): void {
      this.disableButtonAnimation();
      this.setButtonState(false);
      this.removeTitleScreen();
  }

  private animateButton(): void {
    gsap.to(this._startButton, 0.5, {
      alpha: 0.25,
      repeat: -1,
      ease: 'sine.inOut',
      yoyo: true
    });
  }

  private setButtonState(enabled: boolean): void {
    this._startButton.buttonMode = enabled;
    this._startButton.interactive = enabled;
  }

  private disableButtonAnimation(): void {
    gsap.killTweensOf(this._startButton);
    this._startButton.alpha = 1;
  }

  private removeTitleScreen(): void {
    gsap.to(this, 1, {
      alpha: 0,
      onComplete: () => {
        this.clickStart.dispatch();
      }
    });
  }

}
