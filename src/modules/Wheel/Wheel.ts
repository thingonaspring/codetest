import Signal from 'signals';
import {Container, Point, Sprite, Text, TextStyle, utils} from "pixi.js";
import {ImageNames, SoundNames} from "../../constants/AssetConstants";
import {WheelConstants} from "../../constants/WheelConstants";
import {Utils} from "../../utils/Utils";
import {gsap} from "gsap/gsap-core";
import {IWheelSegment} from "../../interfaces/IWheelSegment";
import {WheelSegmentSprite} from "./WheelSegmentSprite";
import {TextConstants} from "../../constants/TextConstants";

export class Wheel extends Container {
  public wheelSpinComplete: Signal = new Signal();
  public playSoundSignal: Signal = new Signal();

  private _wheel: Container;
  private _pointer: Sprite;
  private _segmentAngle: number;
  private _wheelSegments: WheelSegmentSprite[] = [];

  private _spinResult: IWheelSegment;

  private _previousRotation: number = 0;

  private _winMessageText: Text;

  //TODO ideally the data would all be handled in a model/proxy
  private _wheelSegmentsData: IWheelSegment[] = [];
  private _wheelValueWeightingData: number[][] = [
    [5000, 4],
    [200, 100],
    [1000, 20],
    [400, 50],
    [2000, 10],
    [200, 100],
    [1000, 20],
    [400, 50]
  ];

  constructor() {
    super();
    this.createWheelData();
    this.init();
  }

  private createWheelData(): void {
    this._segmentAngle = 360 / WheelConstants.numSegments;
    for (let i: number = 0 ; i < WheelConstants.numSegments ; i++) {
       this.addNewSegment(i, this._wheelValueWeightingData[i][0], this._wheelValueWeightingData[i][1], this._segmentAngle * i);
    }
  }

  private addNewSegment(id: number, value: number, weighting: number, wheelAngle: number ): void {
    const newSegment: IWheelSegment = {
      id: id,
      value: value,
      weighting: weighting,
      wheelAngle: -wheelAngle
    };
    this._wheelSegmentsData.push(newSegment);
  }

  private init(): void {
    this.setupWheel();
    this.setupPointer();
    this.setupWinText();
  }

  private setupWheel(): void {
    this._wheel = new Container();
    let wheelSlice: WheelSegmentSprite;
    let wheelText: Text;
    let wheelData: IWheelSegment;
    const wheelTextStyle: TextStyle = Utils.getTextStyle();
    wheelTextStyle.fill = 0x000000;
    wheelTextStyle.fontSize = 100;
    for (let i: number = 0 ; i < WheelConstants.numSegments ; i++) {
        wheelData = this._wheelSegmentsData[i];
        wheelSlice = new WheelSegmentSprite(utils.TextureCache[ImageNames.SLICE]);
        wheelSlice.scale.set(0.5);
        wheelSlice.anchor.set(0.5, 1);
        wheelSlice.angle = this._segmentAngle * i;
        wheelSlice.id = wheelData.id;
        wheelSlice.value = wheelData.value;
        this._wheelSegments.push(wheelSlice);
        wheelText = new Text(wheelData.value.toString(), wheelTextStyle);
        wheelText.anchor.set(0.5);
        wheelText.position = (new Point(wheelSlice.position.x, wheelSlice.position.y - 300));
        wheelText.angle = 90;
        wheelSlice.addChild(wheelText);
        this._wheel.addChild(wheelSlice);
    }

    const centre: Sprite = new Sprite(utils.TextureCache[ImageNames.CENTER]);
    centre.anchor.set(0.5);
    centre.scale.set(0.5);
    this._wheel.addChild(centre);

    this.addChild(this._wheel);
  }

  private setupPointer(): void {
    this._pointer = new Sprite(utils.TextureCache[ImageNames.POINTER]);
    this._pointer.anchor.set(0.5, 0);
    this._pointer.y = this._wheel.getLocalBounds().top - 20;
    this.addChild(this._pointer);
  }

  private setupWinText(): void {
    const fontStyle: TextStyle = Utils.getTextStyle();
    fontStyle.fontSize = 60;
    this._winMessageText = new Text(TextConstants.youWon, fontStyle);
    this._winMessageText.anchor.set(0.5);
    this._winMessageText.y = this._wheel.y + 275;
  }

  public spinWheel(): void {
    this._wheel.rotation = 0;
    this.getSpinResult();

    let finalAngle: number = this.deg2Rad(this._spinResult.wheelAngle + (WheelConstants.numRotations * 360));
    const plusMinus: number = Math.random() < 0.5 ? -1 : 1;
    const variance: number = Math.random() * WheelConstants.segmentVariance;
    finalAngle = finalAngle + this.deg2Rad(plusMinus * variance);
    gsap.killTweensOf(this._wheel);
    gsap.to(this._wheel, {
      duration: WheelConstants.wheelSpinDuration,
      rotation: finalAngle,
      ease: 'circ.inOut',
      onUpdate: () => {
        this.checkNextSegment(this._wheel.rotation);
      },
      onComplete: () => {
        this.completeWheelSpin();
      }
    });
  }

  private checkNextSegment(rotation: number): void {
    const newSegmentId: number = this.getSegmentId(this.rad2Deg(rotation));
    if (newSegmentId !== this.getSegmentId(this.rad2Deg(this._previousRotation))) {
      this.bumpPointer();
      this.playSoundSignal.dispatch(SoundNames.CLICK);
    }
    this._previousRotation = rotation;
  }

  private bumpPointer(): void {
    gsap.killTweensOf(this._pointer);
    this._pointer.angle = -50;
    gsap.to(this._pointer, {
      duration : 0.25,
      angle: 0
    });
  }

  private getSegmentId(degrees: number): number {
    degrees = degrees % 360;
    for(let i: number = 0 ; i < this._wheelSegmentsData.length ; i++ ) {
      if( (-this._wheelSegmentsData[i].wheelAngle - this._segmentAngle / 2) >= degrees) {
        return this._wheelSegmentsData[i].id;
      }
    }
  }

  private completeWheelSpin(): void {
    this.hideAllHighlights();
    this.highlightCurrentSegment(this._spinResult.id);
    this.showWinMessage();
    this.playSoundSignal.dispatch(SoundNames.LANDING);
    this._wheel.rotation = this._wheel.rotation % 360;
    gsap.delayedCall(0.5, () => {
      this.wheelSpinComplete.dispatch(this._spinResult.value);
    });
  }

  private showWinMessage(): void {
    this._winMessageText.text = TextConstants.youWon.replace('{1}', this._spinResult.value.toString());
    this.addChild(this._winMessageText);
  }

  private highlightCurrentSegment(id: number): void {
    this._wheelSegments[id].alpha = 1;
  }

  private hideAllHighlights(): void {
    this._wheelSegments.forEach( (segment: Sprite) => {
      segment.alpha = 0.75;
    });
  }

  public reset(): void {
    this.hideAllHighlights();
    this._spinResult = null;
    this._wheel.rotation = 0;
    this._previousRotation = 0;
    this._winMessageText.text = '';
  }

  private deg2Rad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private rad2Deg(rad: number): number {
    return rad * (180.0 / Math.PI);
  }

  private getSpinResult(): void {
    //TODO BGB add debug option
    const values: number[] = [];
    const weights: number[] = [];
    for(let i: number = 0 ; i < this._wheelSegmentsData.length ; i++ ) {
      values.push(this._wheelSegmentsData[i].value);
      weights.push(this._wheelSegmentsData[i].weighting);
    }
    const resultIndex: number = Utils.getWeightedRandom(values, weights);
    this._spinResult = this._wheelSegmentsData[resultIndex];
    //this._spinResult = this._wheelSegmentsData[Math.floor(Math.random() * this._wheelSegmentsData.length)];
  }


}
