import {Container, Text, TextStyle} from "pixi.js";
import {Utils} from "../../utils/Utils";
import {TextConstants} from "../../constants/TextConstants";
import gsap from "gsap";

export class UserInterface extends Container {
  private _balance: number = 0;
  private _balanceDisplay: Text;

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    const textStyle: TextStyle = Utils.getTextStyle();
    this._balanceDisplay = new Text(TextConstants.credits + this._balance.toString(), textStyle);
    this.addChild(this._balanceDisplay);
  }

  public addToBalance(winValue: number, callback: Function = () => {
  }): void {
    const newBalanceValue: number = this._balance + winValue;
    const newBalance: any = {balance: this._balance};

    gsap.to(newBalance, {
      duration: winValue / 200,
      balance: newBalanceValue,
      ease: 'power3.easeOut',
      onUpdate: () => {
        this._balanceDisplay.text = TextConstants.credits + newBalance.balance.toFixed(2).toString();
      },
      onComplete: () => {
        this._balance = newBalanceValue;
        callback.call(null);
      }
    });
  }
}
