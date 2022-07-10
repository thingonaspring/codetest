import {AnimatedSprite, Application, DisplayObject, Loader} from 'pixi.js';
import {AnimationNames, ImageNames, LoaderPath, SoundNames} from "./constants/AssetConstants";
import {TitleScreen} from "./modules/TitleScreen/TitleScreen";
import {Background} from "./modules/Background/Background";
import gsap from "gsap";
import {Wheel} from "./modules/Wheel/Wheel";
import {sound} from "@pixi/sound";
import {UserInterface} from "./modules/UserInterface/UserInterface";
import {CheatPanel} from "./modules/cheats/CheatPanel";
import {DataConstants} from "./constants/DataConstants";

export class CodeTest {
  private _app: Application;

  private _imageLoader: Loader;
  private _animLoader: Loader;
  private _loadersCompleted: number = 0;
  private _totalLoaders: number = 2; //TODO BGB refactor

  private _background: Background;
  private _titleScreen: TitleScreen;
  private _wheel: Wheel;
  private _userInterface: UserInterface;
  private _cheatPanel: CheatPanel;

  constructor() {
    this._app = new Application({
      width: 1280,
      height: 720
    });
    document.body.appendChild(this._app.view);
    this._imageLoader = new Loader();
    this._animLoader = new Loader();
    this.loadAssets();
  }

  protected loadAssets(): void {
    DataConstants.imageNames.forEach((imageName: string) => {
      const imagePath: string = LoaderPath.assetPath + LoaderPath.imageFolder + imageName + LoaderPath.imageSuffix;
      this._imageLoader.add(imageName, imagePath);
    });
    this._imageLoader.load();
    this._imageLoader.onComplete.add(() => {
      this.checkAllLoaded();
    });
    DataConstants.animationNames.forEach((animName: string) => {
      const animPath: string = LoaderPath.assetPath + LoaderPath.imageFolder + animName + LoaderPath.jsonSuffix;
      this._animLoader.add(animName, animPath);
    });
    this._animLoader.load();
    this._animLoader.onComplete.add(() => {
      this.checkAllLoaded();
    });
    DataConstants.soundNames.forEach((soundName: string) => {
      const soundPath: string = LoaderPath.assetPath + LoaderPath.soundFolder + soundName + LoaderPath.soundSuffix;
      sound.add(soundName, soundPath);
    });
  }

  private playSound(soundName: string, loop: boolean = false): void {
    if (sound.exists(soundName)) {
      sound.play(soundName, {loop: loop});
    }
  }

  private stopSound(soundName: string): void {
    sound.stop(soundName);
  }

  private checkAllLoaded(): void {
    this._loadersCompleted++;
    if (this._loadersCompleted === this._totalLoaders) {
      this.loadingComplete();
    }
  }

  private loadingComplete(): void {
    this.setupBackground();
    this.setupTitleScreen();
    this.setupWheel();
    this.setupUserInterface();
    this.setupCheatPanel();

    gsap.delayedCall(0.5, () => {
      this.showTitleScreen();
    });
  }

  private setupBackground(): void {
    this._background = new Background();
    this._background.alpha = 0;
    this.addChild(this._background);
  }

  private setupTitleScreen(): void {
    this._titleScreen = new TitleScreen();
    this.centrallyAlign(this._titleScreen);
    this._titleScreen.alpha = 0;
    this.addChild(this._titleScreen);

    const sheet = this._animLoader.resources[AnimationNames.COIN_ANIM].spritesheet;
    this._titleScreen.createSpinningCoin(sheet);

  }

  private setupWheel(): void {
    this._wheel = new Wheel();
    this._wheel.playSoundSignal.add((soundName: string, loop: boolean = false) => {
      this.playSound(soundName, loop);
    });
    this.centrallyAlign(this._wheel);
  }

  private setupUserInterface(): void {
    this._userInterface = new UserInterface();
    this._userInterface.y = this._app.view.height - this._userInterface.height;
    this.addChild(this._userInterface);
  }

  private setupCheatPanel(): void {
    this._cheatPanel = new CheatPanel();
    this._cheatPanel.x = this._cheatPanel.width / 2;
    this._cheatPanel.y = this._cheatPanel.height / 2;
    this.addChild(this._cheatPanel);
  }

  private centrallyAlign(item: DisplayObject): void {
    item.x = this._app.view.width / 2;
    item.y = this._app.view.height / 2;
  }

  private showTitleScreen(): void {
    this._cheatPanel.setCheatsEnabled(true);
    gsap.to([this._titleScreen, this._background], 3, {
      alpha: 1,
      onComplete: () => {
        this._titleScreen.clickStart.add(() => {
          this.onStartClicked();
        });
        this._titleScreen.activate();
      }
    });
  }

  private onStartClicked(): void {
    this._cheatPanel.setCheatsEnabled(false);
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
        this._wheel.wheelSpinComplete.add((winValue: number) => {
          this.doWinCountup(winValue);
        });
        this._wheel.spinWheel(this._cheatPanel.cheatValueId);
      }
    });
  }

  protected doWinCountup(winValue: number): void {
    this.playSound(SoundNames.COUNTUP, true);
    this._userInterface.addToBalance(winValue, () => {
      this.stopSound(SoundNames.COUNTUP);
      this.playSound(SoundNames.LANDING);
      gsap.delayedCall(1, () => {
        this.completeWheelSpin();
      });
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

  private addChild(child: DisplayObject): void {
    this._app.stage.addChild(child);
  }

}
