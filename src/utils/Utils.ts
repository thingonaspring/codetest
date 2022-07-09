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
