import Signal from 'signals';
import {Container, Point, Sprite, Text, TextStyle, utils} from "pixi.js";
import {ImageNames} from "../constants/AssetConstants";
import {WheelConstants} from "../constants/WheelConstants";
import {Utils} from "../utils/Utils";
import {gsap} from "gsap/gsap-core";
import {IWheelSegment} from "../interfaces/IWheelSegment";
import {WheelSegmentSprite} from "./WheelSegmentSprite";

export class Wheel extends Container {
  public wheelSpinComplete: Signal = new Signal();
  public playSoundSignal: Signal = new Signal();

  private _wheel: Container;
  private _pointer: Sprite;
  private _wheelSegments: WheelSegmentSprite[] = [];

  private _spinResult: IWheelSegment;

  //TODO ideally the data would all be handled in a model/proxy
  private _wheelSegmentsData: IWheelSegment[] = [];
  private _wheelValueWeightingData: number[][] = [
    [5000, 4, 0],
    [200, 100, 45],
    [1000, 20, 90],
    [400, 50, 135],
    [2000, 10, 180],
    [200, 100, 225],
    [1000, 20, 270],
    [400, 50, 315]
  ];

  constructor() {
    super();
    this.createWheelData();
    this.init();
  }

  private createWheelData(): void {
    for (let i: number = 0 ; i < WheelConstants.numSegments ; i++) {
       this.addNewSegment(i, this._wheelValueWeightingData[i][0], this._wheelValueWeightingData[i][1], this._wheelValueWeightingData[i][2]);
    }
  }

  private addNewSegment(id: number, value: number, weighting: number, wheelAngle: number ): void {
    const newSegment: IWheelSegment = {
      id: id,
      value: value,
      weighting: weighting,
      wheelAngle: wheelAngle
    };
    console.log('bgb', 'segment data created', newSegment);
    this._wheelSegmentsData.push(newSegment);
  }

  private init(): void {
    this.setupWheel();
    this.setupPointer();

    this.debugWheel();
  }

  private _num: number = 0;
  private debugWheel(): void {
    this.hideAllHighlights();
    this.highlightCurrentSegment(this._wheelSegmentsData[this._num].id);
    gsap.to(this._wheel, {
      duration: 0.5,
      rotation: -this._wheelSegmentsData[this._num].wheelAngle
    });
    //this._wheel.rotation = this._wheelSegmentsData[this._num].wheelAngle;
    gsap.delayedCall( 3, () => {
      this._num++;
      if(this._num === WheelConstants.numSegments) {
        this._num = 0;
      }
      this.debugWheel();
    });
  }


  private setupWheel(): void {
    this._wheel = new Container();
    let wheelSlice: WheelSegmentSprite;
    let wheelText: Text;
    let wheelData: IWheelSegment;
    const segmentAngle: number = 360 / WheelConstants.numSegments;
    const wheelTextStyle: TextStyle = Utils.getTextStyle();
    wheelTextStyle.fill = 0x000000;
    wheelTextStyle.fontSize = 100;
    for (let i: number = 0 ; i < WheelConstants.numSegments ; i++) {
        wheelData = this._wheelSegmentsData[i];
        wheelSlice = new WheelSegmentSprite(utils.TextureCache[ImageNames.SLICE]);
        wheelSlice.scale.set(0.5);
        wheelSlice.anchor.set(0.5, 1);
        wheelSlice.angle = segmentAngle * i;
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
    this._pointer.anchor.set(0.5);
    this._pointer.y = this._wheel.getLocalBounds().top;
    this.addChild(this._pointer);
  }

  public spinWheel(): void {
    this._wheel.rotation = 0;
    this.getSpinResult();

    this.hideAllHighlights();
    this.highlightCurrentSegment(this._spinResult.id);

    console.log('bgb', 'WIN:', this._spinResult.value, 'ROTATION', this._spinResult.wheelAngle);
    const finalAngle: number = this._spinResult.wheelAngle + (WheelConstants.numRotations * Math.PI);
    console.log('bgb', 'SPIN TO ANGLE: ', finalAngle);
    gsap.killTweensOf(this._wheel);
    gsap.to(this._wheel, {
      duration: WheelConstants.wheelSpinDuration,
      rotation: finalAngle,
      onUpdate: () => {
        this.checkNextSegment(this.rotation);
      },
      onComplete: () => {
        this.completeWheelSpin();
      }
    });
  }

  private checkNextSegment(rotation: number): void {
    console.log('bgb', "SPINNING", rotation);
  }

  private completeWheelSpin(): void {
    this.hideAllHighlights();
    this.highlightCurrentSegment(this._spinResult.id);
    this._wheel.rotation = this._wheel.rotation % 360;

    console.log('bgb', this._wheel.rotation);
    gsap.delayedCall(4, () => {
      this.wheelSpinComplete.dispatch();

    });
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
    this._spinResult = null;
    this._wheel.rotation = 0;
  }

  private deg2Rad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private getSpinResult(): void {
    //TODO BGB weighting, debug
    this._spinResult = this._wheelSegmentsData[Math.floor(Math.random() * this._wheelSegmentsData.length)];
  }


}
