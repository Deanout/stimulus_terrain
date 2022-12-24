import { Controller } from "@hotwired/stimulus";
import { makeNoise2D } from "open-simplex-noise";

// Connects to data-controller="terrain"
export default class Terrain extends Controller {
  static targets = [
    "canvas",
    "seed_input",
    "seed_value",
    "amplitude_input",
    "amplitude_value",
    "frequency_input",
    "frequency_value",
    "octaves_input",
    "octaves_value",
    "persistence_input",
    "persistence_value",
    "lacunarity_input",
    "lacunarity_value",
  ];
  static colors = {
    air: "#ffffff",
    grass: "#00ff00",
    sand: "#C2B280",
    stone: "#808080",
    water: "#0000ff",
    snow: "#fffafa ",
  };
  connect() {
    console.log("Connected");
    this.instantiateNoiseConfig();
    this.instantiateNodeTypes();
    this.initializeInputValues();
    this.constructTerrain();
  }

  constructTerrain() {
    this.noise = makeNoise2D(this.noiseConfig.seed);
    this.grid = this.generateTerrain();
    this.drawTerrain();
  }

  drawTerrain() {
    const context = this.canvasTarget.getContext("2d");
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        const node = this.grid[x][y];
        context.fillStyle = node.nodeType.color;
        context.fillRect(x, y, 1, 1);
      }
    }
  }

  generateTerrain() {
    const grid = [];
    for (let x = 0; x < this.canvasTarget.width; x++) {
      grid[x] = [];
      for (let y = 0; y < this.canvasTarget.height; y++) {
        grid[x][y] = this.getNode(x, y);
      }
    }
    return grid;
  }

  getNode(x, y) {
    const nodeType = this.getNodeType(x, y);
    return new Node(x, y, nodeType);
  }

  getNodeType(x, y) {
    const noiseValue = this.getNoiseValue(x, y);

    if (noiseValue < 0.5) {
      return this.nodeTypes.water;
    } else if (noiseValue < 0.55) {
      return this.nodeTypes.sand;
    } else if (noiseValue < 0.7) {
      return this.nodeTypes.grass;
    } else if (noiseValue < 0.9) {
      return this.nodeTypes.stone;
    } else {
      return this.nodeTypes.snow;
    }
  }

  getNoiseValue(x, y) {
    let noiseValue = 0;

    let persistence = this.noiseConfig.persistence;
    let lacunarity = this.noiseConfig.lacunarity;
    let frequency = this.noiseConfig.frequency;
    let amplitude = this.noiseConfig.amplitude;
    for (let i = 0; i < this.noiseConfig.octaves; i++) {
      noiseValue += this.noise(x * frequency, y * frequency) * amplitude;
      frequency *= lacunarity;
      amplitude *= persistence;
    }

    let normalizedNoise = this.normalizeValue(noiseValue, -1, 1);
    return normalizedNoise;
  }

  normalizeValue(value, min, max, newMin = 0, newMax = 1) {
    return ((value - min) / (max - min)) * (newMax - newMin) + newMin;
  }

  instantiateNoiseConfig() {
    this.noiseConfig = {
      seed: 1337,
      amplitude: 1,
      frequency: 0.02,
      octaves: 4,
      persistence: 0.1,
      lacunarity: 6.0,
    };
  }

  instantiateNodeTypes() {
    this.nodeTypes = {
      air: new NodeType("air", Terrain.colors.air),
      grass: new NodeType("grass", Terrain.colors.grass),
      sand: new NodeType("sand", Terrain.colors.sand),
      stone: new NodeType("stone", Terrain.colors.stone),
      water: new NodeType("water", Terrain.colors.water),
      snow: new NodeType("snow", Terrain.colors.snow),
    };
  }

  initializeInputValues() {
    this.seed_inputTarget.value = this.noiseConfig.seed;
    this.amplitude_inputTarget.value = this.noiseConfig.amplitude;
    this.frequency_inputTarget.value = this.noiseConfig.frequency;
    this.octaves_inputTarget.value = this.noiseConfig.octaves;
    this.persistence_inputTarget.value = this.noiseConfig.persistence;
    this.lacunarity_inputTarget.value = this.noiseConfig.lacunarity;

    this.seed_valueTarget.innerText = this.noiseConfig.seed;
    this.amplitude_valueTarget.innerText = this.noiseConfig.amplitude;
    this.frequency_valueTarget.innerText = this.noiseConfig.frequency;
    this.octaves_valueTarget.innerText = this.noiseConfig.octaves;
    this.persistence_valueTarget.innerText = this.noiseConfig.persistence;
    this.lacunarity_valueTarget.innerText = this.noiseConfig.lacunarity;
  }

  setNoiseConfigToInputValues() {
    this.noiseConfig.seed = this.seed_inputTarget.value;
    this.noiseConfig.amplitude = this.amplitude_inputTarget.value;
    this.noiseConfig.frequency = this.frequency_inputTarget.value;
    this.noiseConfig.octaves = this.octaves_inputTarget.value;
    this.noiseConfig.persistence = this.persistence_inputTarget.value;
    this.noiseConfig.lacunarity = this.lacunarity_inputTarget.value;

    this.seed_valueTarget.innerText = this.noiseConfig.seed;
    this.amplitude_valueTarget.innerText = this.noiseConfig.amplitude;
    this.frequency_valueTarget.innerText = this.noiseConfig.frequency;
    this.octaves_valueTarget.innerText = this.noiseConfig.octaves;
    this.persistence_valueTarget.innerText = this.noiseConfig.persistence;
    this.lacunarity_valueTarget.innerText = this.noiseConfig.lacunarity;
  }

  update() {
    this.setNoiseConfigToInputValues();
    this.constructTerrain();
  }
}

class Node {
  constructor(x, y, nodeType) {
    this.x = x;
    this.y = y;
    this.nodeType = nodeType;
  }
}

class NodeType {
  constructor(name, color) {
    this.name = name;
    this.color = color;
  }
}
