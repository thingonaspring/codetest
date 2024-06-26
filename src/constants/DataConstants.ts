import {AnimationNames, ImageNames, SoundNames} from "./AssetConstants";
import {Point} from "pixi.js";

export class DataConstants {
  //TODO BGB turn this in to a key/value pairing rather than [0] and [1] access
  public static wheelValueWeightingData: number[][] = [
    [5000, 4],
    [200, 100],
    [1000, 20],
    [400, 50],
    [2000, 10],
    [200, 100],
    [1000, 20],
    [400, 50]
  ];

  public static screenDimensions: Point = new Point(1280, 720)

  public static imageNames: string[] = [
    ImageNames.BACKGROUND,
    ImageNames.POINTER,
    ImageNames.CENTER,
    ImageNames.SLICE
  ];

  public static soundNames: string [] = [
    SoundNames.COUNTUP,
    SoundNames.CLICK,
    SoundNames.LANDING
  ]

  public static animationNames: string[] = [
    AnimationNames.COIN_ANIM
  ]
}
