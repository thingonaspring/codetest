import {Container, Text, TextStyle} from "pixi.js";
import {TextConstants} from "../../constants/TextConstants";
import {SimpleButton} from "../../components/SimpleButton";
import {DataConstants} from "../../constants/DataConstants";
import {CheatIds} from "../../enums/CheatIds";
import {Utils} from "../../utils/Utils";
import {TextStyleFontStyle} from "@pixi/text";

export class CheatPanel extends Container {
  private _popupPanel: Container;
  private _cheatButton: SimpleButton;
  private _selectedCheatText: Text;

  private _popupOpen: boolean = true;
  private _cheatValueId: number = CheatIds.WEIGHTED;

  public get cheatValueId(): number {
    return this._cheatValueId;
  }

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    this.setupCheatButton();
    this.setupPopupPanel();
    this.setupSelectedCheat();
  }

  private setupCheatButton(): void {
    this._cheatButton = new SimpleButton();
    this._cheatButton.clickHandler = () => {
      this.togglePopupPanel();
    }
    this._cheatButton.updateTextLabel(TextConstants.cheatButton);
    this.addChild(this._cheatButton);
  }

  private setupSelectedCheat(): void {
    const fontStyle: TextStyle = Utils.getTextStyle();
    fontStyle.fontSize = 18;
    fontStyle.align = 'left';
    fontStyle.fontStyle = 'italic';
    this._selectedCheatText = new Text(this.getCheatText(), fontStyle);
    this._selectedCheatText.anchor.set(0.5);
    this._selectedCheatText.y = this._cheatButton.height;
    this.addChild(this._selectedCheatText);
  }

  private getCheatText(): string {
    switch(this._cheatValueId) {
      case CheatIds.RANDOM:
        return TextConstants.cheatRandom;
      case CheatIds.WEIGHTED:
        return TextConstants.cheatWeighted;
      default:
        return DataConstants.wheelValueWeightingData[this._cheatValueId][0].toString();
    }
  }

  private setupPopupPanel(): void {
    this._popupPanel = new Container();
    //add cheat button per segment
    let buttonX: number = 0;
    let button:SimpleButton;
    for (let i: number = 0 ; i < DataConstants.wheelValueWeightingData.length ; i++ ){
      button = new SimpleButton();
      button.updateTextLabel(DataConstants.wheelValueWeightingData[i][0].toString());
      button.x = buttonX;
      buttonX += button.width;
      button.clickHandler = () => {
        this.setCheatValue(i);
      }
      this._popupPanel.addChild(button);
    }
    //totally random cheat without weighting
    button = new SimpleButton();
    button.updateTextLabel(TextConstants.cheatRandom);
    //leave gaps between wheel standard ids' and randoms
    buttonX += 30;
    button.x = buttonX;
    buttonX += button.width + 30;
    button.clickHandler = () => {
      this.setCheatValue(CheatIds.RANDOM);
    }
    this._popupPanel.addChild(button);
    //random weighted cheat (default setting)
    button = new SimpleButton();
    button.updateTextLabel(TextConstants.cheatWeighted);
    button.x = buttonX;
    button.clickHandler = () => {
      this.setCheatValue(CheatIds.WEIGHTED);
    }
    this._popupPanel.addChild(button);

    this.addChild(this._popupPanel);
    this._popupPanel.x = this._cheatButton.width;
    this.togglePopupPanel();
  }

  private setCheatValue(id: number): void {
    this._cheatValueId = id;
    this._selectedCheatText.text = this.getCheatText();
  }

  private togglePopupPanel(): void {
    this._popupOpen = !this._popupOpen;
    this._popupPanel.visible = this._popupOpen;
  }

  public setCheatsEnabled(enabled: boolean): void {
    if(!enabled && this._popupOpen) {
      this.togglePopupPanel();
    }
    this._cheatButton.isEnabled = enabled;
  }
}
