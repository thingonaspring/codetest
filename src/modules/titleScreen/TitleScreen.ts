import gsap from "gsap";
import Signal from 'signals';
import {Container, Sprite, Text, TextStyle, Texture} from "pixi.js";
import {TextConstants} from "../../constants/TextConstants";
import {Utils} from "../../utils/Utils";
import {SimpleButton} from "../../components/SimpleButton";

export class TitleScreen extends Container {
  public clickStart: Signal = new Signal();
  private _titleText: Text;
  private _startButton: SimpleButton;

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
    this._startButton = new SimpleButton();
    const style: TextStyle = Utils.getTextStyle();
    style.fontSize = 48;
    this._startButton.updateTextLabel(TextConstants.clickToSpin, style);
    this._startButton.setClickAreaVisible(false);
    this._startButton.x = this._titleText.x;
    this._startButton.y = this._titleText.y + this._titleText.height;
    this._startButton.clickHandler = () => {
      this._startButton.colourText(0xffff00);
      this.onStartButtonClick();
    }
    this._startButton.overHandler = () => {
      this.disableButtonAnimation();
      this._startButton.colourText(0xffff00);
    }
    this._startButton.outHandler = () => {
      this.animateButton();
      this._startButton.colourText(0xffffff);
    }
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
    this._startButton.isEnabled = enabled;
  }

  private disableButtonAnimation(): void {
    gsap.killTweensOf(this._startButton);
    this._startButton.alpha = 1;
  }

  private removeTitleScreen(): void {
    this.clickStart.dispatch();
    gsap.to(this, 0.5, {
      alpha: 0,
    });
  }

}
