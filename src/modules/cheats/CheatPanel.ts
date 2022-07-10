import {Container, Text} from "pixi.js";
import {TextConstants} from "../../constants/TextConstants";
import {SimpleButton} from "../../components/SimpleButton";

export class CheatPanel extends Container {
  private _popupPanel: Container;
  private _cheatButton: SimpleButton;

  private _popupOpen: boolean = true;

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    this._cheatButton = new SimpleButton();
    this._cheatButton.clickHandler = () => {
      this.togglePopupPanel();
    }
    this._cheatButton.updateTextLabel(TextConstants.cheatButton);

    this._popupPanel = new Container();
    this._popupPanel.addChild(new Text('TESTESTESTEST'));
    this.addChild(this._popupPanel);

    this._popupPanel.x = this._cheatButton.width;
    this.addChild(this._cheatButton);

    this.togglePopupPanel();
  }

  private togglePopupPanel(): void {
    this._popupOpen = !this._popupOpen;
    this._popupPanel.visible = this._popupOpen;
  }


}
