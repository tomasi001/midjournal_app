import * as THREE from "three";
import Experience from "./Experience.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.debug = this.experience.debug;
    this.stats = this.experience.stats;
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.usePostprocess = true;

    if (this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: "renderer",
      });
    }

    this.setInstance();
    this.setPostProcess();
  }

  setInstance() {
    this.clearColor = "#ffffff";

    // Renderer
    this.instance = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
    });
    this.instance.domElement.style.position = "absolute";
    this.instance.domElement.style.top = 0;
    this.instance.domElement.style.left = 0;
    this.instance.domElement.style.width = "100%";
    this.instance.domElement.style.height = "100%";

    // this.instance.setClearColor(0x414141, 1)
    this.instance.setClearColor(this.clearColor, 1);
    this.instance.setSize(this.config.width, this.config.height);
    this.instance.setPixelRatio(this.config.pixelRatio);

    // this.instance.physicallyCorrectLights = true
    // this.instance.gammaOutPut = true
    // this.instance.outputEncoding = THREE.sRGBEncoding
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    // this.instance.shadowMap.enabled = false
    // this.instance.toneMapping = THREE.ReinhardToneMapping
    // this.instance.toneMapping = THREE.ReinhardToneMapping
    // this.instance.toneMappingExposure = 1.3

    this.context = this.instance.getContext();

    // Add stats panel
    if (this.stats) {
      this.stats.setRenderPanel(this.context);
    }
  }

  setPostProcess() {
    this.postProcess = {};

    /**
     * Passes
     */
    // Render pass
    this.postProcess.renderPass = new RenderPass(
      this.scene,
      this.camera.instance
    );

    // Bloom pass
    // To understand the bloom effect, you need to know about the UnrealBloomPass.
    // It's a post-processing effect that creates a glow around bright objects in the scene.
    // The constructor takes four main parameters:
    // 1. resolution: The resolution of the bloom texture. Usually the same as the viewport.
    // 2. strength: The intensity of the bloom. Higher values make the glow stronger.
    //    A value of 0.8 is quite high, which might be why the effect feels too strong.
    //    Try reducing this value to something like 0.4 or 0.5 for a more subtle effect.
    // 3. radius: The radius of the bloom. This controls how far the glow spreads from the bright areas.
    // 4. threshold: The luminance threshold. Only pixels brighter than this value will start to "bloom".
    //    A value of 0 means every pixel contributes to the bloom, which can make the whole scene glow.
    //    To make only the brightest parts of your scene glow, you should increase this value.
    //    For example, a threshold of 0.8 would mean only very bright pixels (above 80% luminance) will bloom.

    this.postProcess.unrealBloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      0.1, // strength
      0.01, // radius
      1 // threshold
    );
    this.postProcess.unrealBloomPass.enabled = true;

    // Here, we are adding a custom tint to the bloom effect.
    // This will color the bloom glow. The color is set to a purple hue ('#7f00ff').
    this.postProcess.unrealBloomPass.tintColor = {};
    // this.postProcess.unrealBloomPass.tintColor.value = "#7f00ff";
    this.postProcess.unrealBloomPass.tintColor.value = "#ffffff";
    this.postProcess.unrealBloomPass.tintColor.instance = new THREE.Color(
      this.postProcess.unrealBloomPass.tintColor.value
    );

    // These lines are passing the tint color and its strength to the shader.
    // `uTintColor` is the color itself.
    // `uTintStrength` controls how much the original bloom color is mixed with the tint color.
    // A value of 0.15 means it's a 15% mix of the tint color.
    this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintColor = {
      value: this.postProcess.unrealBloomPass.tintColor.instance,
    };
    this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintStrength =
      { value: 0.15 };
    // This is a custom fragment shader for the bloom pass.
    // A fragment shader is a piece of code that runs for every pixel on the screen.
    // This one is responsible for calculating the final color of the bloom.
    // The key part of this shader is the main() function.
    // It calculates the bloom color by combining multiple blurred textures (blurTexture1 to blurTexture5).
    // The `lerpBloomFactor` function seems to be a custom logic to weigh the bloom factors.
    //
    // The final two lines are where the magic happens:
    // 1. A `color` is calculated based on the bloom strength and the blurred textures.
    // 2. `color.rgb = mix(color.rgb, uTintColor, uTintStrength);`
    //    This line mixes the calculated bloom color with the `uTintColor` we defined earlier.
    //    The `uTintStrength` controls the intensity of this mix.
    //    By changing `uTintColor` and `uTintStrength`, you can alter the bloom's color and intensity of the tint.
    //
    // To reduce the bloom's overall strength, you can either:
    // - Lower the `strength` parameter of the UnrealBloomPass.
    // - Increase the `threshold` parameter to make fewer pixels bloom.
    // - Modify the `bloomStrength` uniform within the shader if you want more fine-grained control,
    //   though modifying the pass parameters is usually easier.
    this.postProcess.unrealBloomPass.compositeMaterial.fragmentShader = `
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform sampler2D dirtTexture;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
uniform vec3 uTintColor;
uniform float uTintStrength;

float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, bloomRadius);
}

void main() {
    vec4 color = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
        lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
        lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
        lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
        lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );

    color.rgb = mix(color.rgb, uTintColor, uTintStrength);
    gl_FragColor = color;
}
        `;

    if (this.debug) {
      const debugFolder = this.debugFolder.addFolder({
        title: "UnrealBloomPass",
      });

      debugFolder.addInput(this.postProcess.unrealBloomPass, "enabled", {});

      debugFolder.addInput(this.postProcess.unrealBloomPass, "strength", {
        min: 0,
        max: 3,
        step: 0.001,
      });

      debugFolder.addInput(this.postProcess.unrealBloomPass, "radius", {
        min: 0,
        max: 1,
        step: 0.001,
      });

      debugFolder.addInput(this.postProcess.unrealBloomPass, "threshold", {
        min: 0,
        max: 1,
        step: 0.001,
      });

      debugFolder
        .addInput(this.postProcess.unrealBloomPass.tintColor, "value", {
          view: "uTintColor",
          label: "color",
        })
        .on("change", () => {
          this.postProcess.unrealBloomPass.tintColor.instance.set(
            this.postProcess.unrealBloomPass.tintColor.value
          );
        });

      debugFolder.addInput(
        this.postProcess.unrealBloomPass.compositeMaterial.uniforms
          .uTintStrength,
        "value",
        { label: "uTintStrength", min: 0, max: 1, step: 0.001 }
      );
    }

    /**
     * Effect composer
     */
    const RenderTargetClass =
      this.config.pixelRatio >= 2
        ? THREE.WebGLRenderTarget
        : THREE.WebGLMultisampleRenderTarget;
    // const RenderTargetClass = THREE.WebGLRenderTarget
    this.renderTarget = new RenderTargetClass(
      this.config.width,
      this.config.height,
      {
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        encoding: THREE.sRGBEncoding,
      }
    );
    this.postProcess.composer = new EffectComposer(
      this.instance,
      this.renderTarget
    );
    this.postProcess.composer.setSize(this.config.width, this.config.height);
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio);

    this.postProcess.composer.addPass(this.postProcess.renderPass);
    this.postProcess.composer.addPass(this.postProcess.unrealBloomPass);
  }

  resize() {
    // Instance
    this.instance.setSize(this.config.width, this.config.height);
    this.instance.setPixelRatio(this.config.pixelRatio);

    // Post process
    this.postProcess.composer.setSize(this.config.width, this.config.height);
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio);
  }

  update() {
    if (this.stats) {
      this.stats.beforeRender();
    }

    if (this.usePostprocess) {
      this.postProcess.composer.render();
    } else {
      this.instance.render(this.scene, this.camera.instance);
    }

    if (this.stats) {
      this.stats.afterRender();
    }
  }

  destroy() {
    this.instance.renderLists.dispose();
    this.instance.dispose();
    this.renderTarget.dispose();
    this.postProcess.composer.renderTarget1.dispose();
    this.postProcess.composer.renderTarget2.dispose();
  }
}
