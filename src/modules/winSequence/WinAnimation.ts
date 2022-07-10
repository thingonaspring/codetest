import {AnimatedParticle, Emitter, EmitterConfig} from "pixi-particles";
import {ParticleContainer, Spritesheet, Texture} from "pixi.js";
import {AnimationNames} from "../../constants/AssetConstants";
import {DataConstants} from "../../constants/DataConstants";
import {IParticleAnimationTextureConfig} from "../../interfaces/IParticleAnimationTextureConfig";
import gsap from "gsap";

export class WinAnimation {
  private _spriteSheet: Spritesheet;
  private _particleSystem: Emitter;
  public particleContainer: ParticleContainer;
  private _particleSystemTimer: number;

  constructor(spritesheet: Spritesheet) {
    this._spriteSheet = spritesheet;
    this.init();
  }

  private init(): void {
    this.particleContainer = new ParticleContainer()
    this._particleSystem = new Emitter(
      this.particleContainer,
      this.getTextureConfig(),
      this.getAnimationConfig()
    );
    this._particleSystem.particleConstructor = AnimatedParticle;
    this._particleSystemTimer = Date.now();
    this._particleSystem.emit = false;
    this.updateEmitter();
  }

  public startParticleAnimation(maxParticles: number): void {
    this._particleSystem.maxParticles = maxParticles;
    this._particleSystemTimer = Date.now();
    this._particleSystem.emit = true;
    this.updateEmitter();
  }

  public stopParticleAnimation(): void {
    this._particleSystem.maxParticles = 0;
    gsap.delayedCall(3, () => {
      this._particleSystem.cleanup();
      this._particleSystem.emit = false;
    });
  }

  public updateEmitter(): void {
    if (this._particleSystem.emit) {
      requestAnimationFrame(this.updateEmitter.bind(this));
      const now: number = Date.now();
      if (this._particleSystem) {
        this._particleSystem.update( (now - this._particleSystemTimer) * 0.001);
      }
      this._particleSystemTimer = now;
    }
  }

  private getTextureConfig(): IParticleAnimationTextureConfig {
    return {
      textures: this._spriteSheet.animations[AnimationNames.COIN_ANIM],
      loop: true
    }
  }

  //TODO BGB refactor to remove any return type
  private getAnimationConfig(): any {
    return {
      'alpha': {
        'start': 1,
        'end': 1
      },
      'scale': {
        'start': 0.2,
        'end': 0.4,
        'minimumScaleMultiplier': 1
      },
      'color': {
        'start': '#ffffff',
        'end': '#fafafa'
      },
      'speed': {
        'start': 350,
        'end': 300,
        'minimumSpeedMultiplier': 2.5
      },
      'acceleration': {
        'x': 0,
        'y': 750
      },
      'maxSpeed': 0,
      'startRotation': {
        'min': 220,
        'max': 320
      },
      'noRotation': false,
      'rotationSpeed': {
        'min': 130,
        'max': 360
      },
      'lifetime': {
        'min': 2,
        'max': 5
      },
      'blendMode': 'normal',
      'frequency': 0.005,
      'emitterLifetime': -1,
      'maxParticles': 100,
      'pos': {
        'x': DataConstants.screenDimensions.x / 2,
        'y': DataConstants.screenDimensions.y / 2
      },
      'addAtBack': false,
      'spawnType': 'circle',
      'spawnCircle': {
        'x': 1,
        'y': 1,
        'r': 20
      }
    }
  }
}
