import Experience from "./Experience.js";
import Sphere from "./Sphere.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("groupEnd", (_group) => {
      if (_group.name === "base") {
        this.setSphere();
      }
    });
  }

  setSphere() {
    this.sphere = new Sphere();
  }

  resize() {}

  update() {
    if (this.sphere) this.sphere.update();
  }

  destroy() {
    if (this.sphere) {
      this.sphere.destroy();
    }
  }
}
