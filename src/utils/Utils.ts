import {DisplayObject, TextStyle} from "pixi.js";
import gsap from "gsap";

export class Utils {
  public static getTextStyle(): TextStyle {
    const textStyle: TextStyle = new TextStyle(null);
    textStyle.fontFamily = 'Arial';
    textStyle.fontSize = 24;
    textStyle.fill = 0xffffff;
    textStyle.align = 'center';
    return textStyle;
  }

  public static getWeightedRandom(values: number[], weights: number[]): number {
    const cumulativeWeights: number[] = [];
    for (let i: number = 0 ; i < weights.length ; i++) {
      cumulativeWeights[i] = weights[i] + (cumulativeWeights[i-1] || 0);
    }
    const maxWeight: number = cumulativeWeights[cumulativeWeights.length -1];
    const result: number = maxWeight * Math.random();
    for (let i: number = 0 ; i < values.length ; i++) {
      if (cumulativeWeights[i] >= result) {
        return i;
      }
    }
  }

  public static transitionScene(previousScene:DisplayObject, newScene: DisplayObject, callback: Function = () => {}, duration: number = 0.5): void {
    gsap.to(previousScene, {
      duration: duration,
      alpha: 0,
      onComplete: () => {
        previousScene.visible = false;
      }
    });
    gsap.to(newScene, {
      duration: duration,
      alpha: 1,
      onComplete: () => {
        if(callback) {
          callback.call(null);
        }
      }
    });
  }
}
