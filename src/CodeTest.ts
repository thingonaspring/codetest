import {Application, DisplayObject, Loader, LoaderResource} from 'pixi.js';
import {ImageNames, LoaderPath, SoundNames} from "./constants/AssetConstants";
import {TitleScreenView} from "./modules/TitleScreen/TitleScreenView";
import {BackgroundView} from "./modules/Background/BackgroundView";
import gsap from "gsap";
import {Wheel} from "./modules/Wheel/Wheel";

export class CodeTest {
  private _app: Application;
  private _loader: Loader;

  private _background: BackgroundView;
  private _titleScreen: TitleScreenView;
  private _wheel: Wheel;

  private _images: string[] = [
    ImageNames.BACKGROUND,
    ImageNames.GLOW,
    ImageNames.POINTER,
    ImageNames.SUNBURST,
    ImageNames.CENTER,
    ImageNames.SLICE
  ];

  private _sounds: string[] = [
    SoundNames.COUNTUP,
    SoundNames.CLICK,
    SoundNames.LANDING
  ];

  constructor() {
    this._app =  new Application({
      width: 1280,
      height: 720
    });
    document.body.appendChild(this._app.view);
    this._loader = Loader.shared;
    this.loadAssets();
  }

  protected loadAssets(): void {
    this._images.forEach((imageName: string) => {
      const imagePath: string = LoaderPath.assetPath + LoaderPath.imageFolder + imageName + LoaderPath.imageSuffix;
      this._loader.add(imageName, imagePath);
    });
    this._sounds.forEach((soundName: string) => {
      const soundPath: string = LoaderPath.assetPath + LoaderPath.soundFolder + soundName + LoaderPath.soundSuffix;
      this._loader.add(soundName, soundPath);
    });
    this._loader.onComplete.add( () => {
      this.loadingComplete();
    });
    //debug
    this._loader.onLoad.add((loader: Loader, resource: LoaderResource) => {
      console.info(':BGB:', 'loaded', resource.name);
    });
    this._loader.onError.add( (error: Error) => {
      console.warn(':BGB:', 'error', error.message);
    });
    this._loader.load();
  }

  private loadingComplete(): void {
    this.setupBackground();
    this.setupTitleScreen();
    this.setupWheel();
    gsap.delayedCall(0.5, () => {
      this.showTitleScreen();
    });
  }

  private setupBackground(): void {
    this._background = new BackgroundView();
    this._background.alpha = 0;
    this.addChild(this._background);
  }

  private setupTitleScreen(): void {
    this._titleScreen = new TitleScreenView();
    this.centrallyAlign(this._titleScreen);
    this._titleScreen.alpha = 0;
    this.addChild(this._titleScreen);
  }

  private setupWheel(): void {
    this._wheel = new Wheel();
    this.centrallyAlign(this._wheel);
  }

  private centrallyAlign(item: DisplayObject): void {
    item.x = this._app.view.width / 2;
    item.y = this._app.view.height / 2;
  }

  private showTitleScreen(): void {
    gsap.to([this._titleScreen, this._background], 3, {
      alpha: 1,
      onComplete: () => {
        this._titleScreen.clickStart.add( () => {
          this.onStartClicked();
        });
        this._titleScreen.activate();
      }
    });
  }

  private onStartClicked(): void {
    this._titleScreen.visible = false;
    this.showWheelScreen();
  }

  private showWheelScreen(): void {
    this._wheel.alpha = 0;
    this.addChild(this._wheel);
    this._wheel.visible = true;
    gsap.to(this._wheel, {
      duration: 0.5,
      alpha: 1,
      onComplete: () => {
        this._wheel.wheelSpinComplete.add(() => {
          this.completeWheelSpin();
        });
        this._wheel.spinWheel();
      }
    });
  }

  private completeWheelSpin(): void {
    this._wheel.visible = false;
    this._wheel.reset();
    this._titleScreen.alpha = 0;
    this.addChild(this._titleScreen);
    this._titleScreen.visible = true;
    this.showTitleScreen();
  }

  private addChild(child:DisplayObject): void {
    this._app.stage.addChild(child);
  }

}
