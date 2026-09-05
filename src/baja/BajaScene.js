import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { FINISH } from './paintData';

/* ------------------------------------------------------------------ helpers */

const HOME_CAMERA = new THREE.Vector3(3.21, 2.20, 7.93);
const HOME_TARGET = new THREE.Vector3(-1.98, 0.95, 0.12);

/** hash-based value noise, enough for a mountain profile and a road surface */
function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function valueNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
function fbm(x, y, octaves) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i += 1) {
    sum += amp * valueNoise(x * freq, y * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return sum;
}

/** film grain + vignette + a light warm grade, matching the site's grain motif */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.021 },
    uExposure: { value: 1.45 },
    uVignette: { value: 0.12 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uVignette;
    uniform float uExposure;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    // Khronos PBR Neutral. ACES is a film-emulation curve: it desaturates and
    // skews saturated hues, so paint never matches its swatch. This one is
    // specified for colour-accurate product viewing, which is the whole job here.
    vec3 pbrNeutral(vec3 color) {
      const float startCompression = 0.8 - 0.04;
      const float desaturation = 0.15;
      float x = min(color.r, min(color.g, color.b));
      float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
      color -= offset;
      float peak = max(color.r, max(color.g, color.b));
      if (peak < startCompression) return color;
      float d = 1.0 - startCompression;
      float newPeak = 1.0 - d * d / (peak + d - startCompression);
      color *= newPeak / peak;
      float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
      return mix(color, vec3(newPeak), g);
    }

    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      c.rgb = pbrNeutral(c.rgb * uExposure);
      c.rgb *= vec3(1.008, 1.001, 0.994);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      float g = hash(vUv * vec2(1927.0, 1081.0) + fract(uTime)) - 0.5;
      c.rgb += g * uGrain * (0.30 + 0.70 * (1.0 - abs(l * 2.0 - 1.0)));
      vec2 d = vUv - 0.5;
      c.rgb *= 1.0 - uVignette * dot(d, d) * 1.85;
      gl_FragColor = c;
    }`,
};

/* ------------------------------------------------------------------- scene  */

/**
 * Owns every Three.js object for the Baja viewer. React never touches the scene
 * graph directly — it calls the setters below, which keeps the component tree
 * free of imperative 3D code and makes teardown a single dispose() call.
 */
export default class BajaScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.disposed = false;

    this.driving = true;
    this.studio = false;
    this.dusk = false;
    this.autoOrbit = false;
    this.steerInput = 0;
    this.steer = 0;
    this.carX = 0;
    this.spin = 0;
    this.lastFrame = performance.now();

    this.paintMaterials = [];
    this.claddingMaterials = [];
    this.reflectors = {};
    this.lenses = {};
    this.wheels = [];
    this.frontWheels = [];
    this.beams = { head: [], fog: [], roof: [] };
    this.scenery = [];
    this.posts = [];
    this.lightState = {};

    this._initRenderer();
    this._initScene();
    this._initEnvironment();
    this._initLighting();
    this._initRoad();
    this._initBackdrop();
    this._initForest();
    this._initComposer();

    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
    window.addEventListener('resize', this._onResize);
    this._onResize();
    this._frame = requestAnimationFrame(this._tick);
  }

  /* --------------------------------------------------------------- plumbing */

  _initRenderer() {
    const renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // tone mapping happens in the grade pass instead, see pbrNeutral()
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer = renderer;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xa8b4b4, 45, 300);

    this.camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.25, 12000);
    this.camera.position.copy(HOME_CAMERA);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.copy(HOME_TARGET);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 2.9;
    this.controls.maxDistance = 16;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.045;
    this.controls.enablePan = false;
  }

  _skyTexture(dusk) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    if (dusk) {
      g.addColorStop(0.0, '#0b1626');
      g.addColorStop(0.3, '#1f3550');
      g.addColorStop(0.44, '#4d5470');
      g.addColorStop(0.497, '#b06f48');
      g.addColorStop(0.525, '#4a3f38');
      g.addColorStop(0.63, '#2a2523');
      g.addColorStop(0.80, '#17161a');
      g.addColorStop(1.0, '#101015');
    } else {
      g.addColorStop(0.0, '#1d3149');
      g.addColorStop(0.3, '#5c7f9e');
      g.addColorStop(0.47, '#bccbd4');
      g.addColorStop(0.497, '#ded8cb');
      g.addColorStop(0.525, '#9c958a');
      g.addColorStop(0.62, '#7e786e');
      g.addColorStop(0.80, '#655f58');
      g.addColorStop(1.0, '#514d47');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 512);
    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _studioTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0, '#3a3f45');
    g.addColorStop(0.46, '#cfd4d8');
    g.addColorStop(0.52, '#a9b0b6');
    g.addColorStop(0.62, '#7d848a');
    g.addColorStop(1.0, '#3a3e42');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _initEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.skyDay = this._skyTexture(false);
    this.skyDusk = this._skyTexture(true);
    this.skyStudio = this._studioTexture();
    this.envDay = pmrem.fromEquirectangular(this.skyDay).texture;
    this.envDusk = pmrem.fromEquirectangular(this.skyDusk).texture;
    this.envStudio = pmrem.fromEquirectangular(this.skyStudio).texture;
    pmrem.dispose();
    this.scene.background = this.skyDay;
    this.scene.environment = this.envDay;
  }

  _initLighting() {
    const sun = new THREE.DirectionalLight(0xffe0b8, 3.6);
    sun.position.set(-7.4, 7.6, 5.0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 26 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    this.scene.add(sun);
    this.sun = sun;

    this.hemi = new THREE.HemisphereLight(0xc2d8ea, 0x7d776c, 1.15);
    this.scene.add(this.hemi);

    // +X is the car's left: forward is +Z, so right = forward x up = -X
    const beam = (x, y, z, tx, ty, tz, colour, base, angle, dist) => {
      const light = new THREE.SpotLight(colour, 0, dist, angle, 0.55, 1.2);
      light.position.set(x, y, z);
      light.target.position.set(tx, ty, tz);
      light.userData.base = base;
      this.scene.add(light);
      this.scene.add(light.target);
      return light;
    };
    [1, -1].forEach((s) => {
      this.beams.head.push(beam(s * 0.68, 0.77, 2.08, s * 1.05, 0.05, 30, 0xfff0d8, 190, 0.3, 55));
      this.beams.fog.push(beam(s * 0.6, 0.45, 2.2, s * 1.6, 0.02, 14, 0xffe6b4, 110, 0.52, 24));
      this.beams.roof.push(beam(s * 0.2, 1.66, -0.05, s * 0.72, 0.3, 34, 0xfff6e6, 250, 0.22, 70));
    });
  }

  _roadTexture() {
    const S = 512;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#5a5c60';
    ctx.fillRect(0, 0, S, S);
    const img = ctx.getImageData(0, 0, S, S);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 34;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = '#e6e3d8';
    ctx.fillRect(S * 0.208 - 3, 0, 6, S);
    ctx.fillRect(S * 0.792 - 3, 0, 6, S);
    ctx.fillStyle = '#f2efe3';
    ctx.fillRect(S * 0.5 - 4, S * 0.06, 8, S * 0.3);
    ctx.fillRect(S * 0.5 - 4, S * 0.56, 8, S * 0.3);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 26);
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _initRoad() {
    this.roadTexture = this._roadTexture();
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 320),
      new THREE.MeshStandardMaterial({ map: this.roadTexture, roughness: 0.86 }),
    );
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    this.scene.add(road);
    this.scenery.push(road);

    const verge = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 320),
      new THREE.MeshStandardMaterial({ map: this._vergeTexture(), roughness: 1 }),
    );
    verge.rotation.x = -Math.PI / 2;
    verge.position.y = -0.035;
    this.scene.add(verge);
    this.scenery.push(verge);

    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.15, 7);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xd6d2c4, roughness: 0.8 });
    for (let i = 0; i < 40; i += 1) {
      [-7.4, 7.4].forEach((sx) => {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(sx, 0.575, -300 + i * 15);
        post.castShadow = true;
        this.scene.add(post);
        this.posts.push(post);
        this.scenery.push(post);
      });
    }

    // a plain shadow catcher used only in the paint-shop backdrop
    this.studioFloor = new THREE.Mesh(
      new THREE.CircleGeometry(14, 64),
      new THREE.MeshStandardMaterial({ color: 0xb9bec2, roughness: 0.55 }),
    );
    this.studioFloor.rotation.x = -Math.PI / 2;
    this.studioFloor.position.y = 0.001;
    this.studioFloor.receiveShadow = true;
    this.studioFloor.visible = false;
    this.scene.add(this.studioFloor);
  }

  /** Mount Rainier, sized to its true ~8 degrees of elevation and pre-hazed */
  _initBackdrop() {
    const RINGS = 64;
    const SEGS = 128;
    const RMAX = 2650;
    const PEAK = 760;
    const positions = [];
    const colours = [];
    const indices = [];
    const rock = new THREE.Color(0x8fa2b0);
    const snow = new THREE.Color(0xf2f7fa);
    const treeline = new THREE.Color(0x6d848e);

    for (let i = 0; i <= RINGS; i += 1) {
      const t = i / RINGS;
      const r = t * RMAX;
      for (let j = 0; j <= SEGS; j += 1) {
        const a = (j / SEGS) * Math.PI * 2;
        const ridge = fbm(Math.cos(a) * 2.4 + 5, Math.sin(a) * 2.4 + 5, 4);
        const profile = Math.pow(1 - t, 1.75);
        let h = PEAK * profile * (1 + 0.2 * (ridge - 0.5) * (1 - profile));
        if (t < 0.055) h = PEAK * (0.985 + 0.012 * ridge);
        h += PEAK * 0.035 * fbm(Math.cos(a) * 7 + r * 0.004, Math.sin(a) * 7 + r * 0.004, 3) * (1 - profile * 0.4);
        positions.push(Math.cos(a) * r, h, Math.sin(a) * r);

        const snowline = 0.2 + 0.09 * ridge;
        const f = h / PEAK;
        let c;
        if (f > snowline + 0.05) c = snow;
        else if (f > snowline - 0.05) c = rock.clone().lerp(snow, (f - (snowline - 0.05)) / 0.1);
        else c = rock.clone().lerp(treeline, Math.min(1, (snowline - 0.05 - f) * 2.6));
        colours.push(c.r, c.g, c.b);
      }
    }
    for (let i = 0; i < RINGS; i += 1) {
      for (let j = 0; j < SEGS; j += 1) {
        const a = i * (SEGS + 1) + j;
        indices.push(a, a + SEGS + 1, a + 1, a + 1, a + SEGS + 1, a + SEGS + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    // at 4km the peak is scattering-dominated, so unlit reads truer than shaded
    this.mountain = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
    this.mountain.position.set(-1900, -50, -4200);
    this.scene.add(this.mountain);
    this.scenery.push(this.mountain);

    const ridge = (dist, height, tint, seed) => {
      const N = 170;
      const W = dist * 2.6;
      const pos = [];
      const idx = [];
      for (let i = 0; i <= N; i += 1) {
        const t = i / N;
        const x = -W / 2 + t * W;
        const h = height * (0.42 + 0.58 * fbm(t * 7 + seed, seed * 3.1, 4));
        pos.push(x, h, 0, x, -height * 0.9, 0);
      }
      for (let i = 0; i < N; i += 1) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: tint, fog: false }));
      mesh.position.z = -dist;
      mesh.userData.baseColour = mesh.material.color.clone();
      this.scene.add(mesh);
      this.scenery.push(mesh);
      return mesh;
    };
    this.ridges = [ridge(3100, 210, 0x71858f, 1.7), ridge(1500, 120, 0x5a6f6d, 4.3), ridge(720, 62, 0x44584f, 8.1)];
  }

  /** Douglas fir silhouette: a cone tiered into branch whorls */
  _initForest() {
    const geo = new THREE.ConeGeometry(1, 1, 7, 9, true);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const t = pos.getY(i) + 0.5;
      const k = (1 + 0.26 * Math.abs(Math.sin(t * Math.PI * 4.2))) * Math.pow(1 - t, 0.85) * 1.35;
      pos.setX(i, pos.getX(i) * k);
      pos.setZ(i, pos.getZ(i) * k);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x3d6b48, roughness: 1, flatShading: true,
    });
    // foliage shouldn't mirror the sky the way car paint does
    material.envMapIntensity = 0.32;

    const COUNT = 520;
    this.forest = new THREE.InstancedMesh(geo, material, COUNT);
    this.forest.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.forest.frustumCulled = false;
    this.trees = [];
    for (let i = 0; i < COUNT; i += 1) {
      this.trees.push({
        x: (i % 2 ? 1 : -1) * (16 + Math.pow(Math.random(), 0.5) * 78),
        z: -300 + Math.random() * 600,
        h: 13 + Math.random() * 17,
        w: 0.55 + Math.random() * 0.35,
        r: Math.random() * Math.PI,
      });
    }
    this._syncForest();
    this.scene.add(this.forest);
    this.scenery.push(this.forest);
  }

  _syncForest() {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const s = new THREE.Vector3();
    const axis = new THREE.Vector3(0, 1, 0);
    this.trees.forEach((t, i) => {
      q.setFromAxisAngle(axis, t.r);
      v.set(t.x, t.h * 0.5 - 0.2, t.z);
      s.set(t.w * t.h * 0.115, t.h, t.w * t.h * 0.115);
      m.compose(v, q, s);
      this.forest.setMatrixAt(i, m);
    });
    this.forest.instanceMatrix.needsUpdate = true;
  }

  _vergeTexture() {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const x = c.getContext('2d');
    x.fillStyle = '#596f4c';
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i += 1) {
      const g = 58 + Math.random() * 42;
      const r = 60 + Math.random() * 34;
      x.fillStyle = `rgba(${Math.round(r)},${Math.round(g + 20)},${Math.round(g - 18)},0.5)`;
      x.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(40, 90);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }

  _initComposer() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(size.width, size.height, { type: THREE.HalfFloatType });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Ambient occlusion. Without contact darkening in the wheel arches, panel
    // gaps and under the body, the truck reads as pasted onto the road.
    const small = typeof window !== 'undefined' && window.innerWidth < 820;
    this.gtao = new GTAOPass(this.scene, this.camera, size.width, size.height);
    this.gtao.output = GTAOPass.OUTPUT.Default;
    this.gtao.blendIntensity = 0.95;
    this.gtao.updateGtaoMaterial({
      radius: 0.30,          // metres: crevices and arch contact only
      distanceExponent: 1.4,
      thickness: 0.5,
      distanceFallOff: 1,
      scale: 1.0,
      samples: small ? 8 : 16,
    });
    this.composer.addPass(this.gtao);

    this.grade = new ShaderPass(GradeShader);
    this.grade.renderToScreen = true;
    this.composer.addPass(this.grade);
  }

  /* ------------------------------------------------------------------ model */

  load(url) {
    return new Promise((resolve, reject) => {
      new GLTFLoader().load(
        url,
        (gltf) => {
          if (this.disposed) return;
          this._adoptModel(gltf.scene);
          resolve();
        },
        undefined,
        reject,
      );
    });
  }

  _adoptModel(root) {
    root.traverse((o) => {
      if (/^Wheel_(FL|FR|RL|RR)$/.test(o.name)) {
        this.wheels.push(o);
        // steer (Y) must apply before spin (X), or the wheel tumbles
        if (/F[LR]$/.test(o.name)) {
          o.rotation.order = 'YXZ';
          this.frontWheels.push(o);
        }
      }
      if (o.name === 'Scoop') this.scoop = o;
      if (!o.isMesh) return;

      o.castShadow = true;
      o.receiveShadow = true;
      const material = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!material) return;
      const name = (material.name || '').toLowerCase();

      const reflector = o.name.match(/^Refl_([A-Za-z]+)/);
      const lens = o.name.match(/^Lens_([A-Za-z]+)/);

      if (reflector) {
        const key = reflector[1];
        this.reflectors[key] = material;
        material.emissive = new THREE.Color(REFLECTOR_COLOURS[key] || 0xffffff);
        material.emissiveIntensity = 0;
        if (/^(tail|brake)/.test(key)) {
          // a tail housing behind a red lens is dark and red-tinted, not a mirror
          material.color.setHex(0x4e0c08);
          material.metalness = 0.35;
          material.roughness = 0.44;
          material.envMapIntensity = 0.45;
        } else {
          material.metalness = 1;
          material.roughness = 0.13;
        }
      }

      if (lens) {
        const key = lens[1];
        this.lenses[key] = material;
        const amber = /amber/.test(key);
        const coloured = amber || /^(red|brake)/.test(key);
        material.transparent = true;
        material.metalness = 0;
        material.roughness = 0.05;
        material.opacity = coloured ? 0.94 : 0.3;
        material.depthWrite = false;
        o.renderOrder = 3;
        if (coloured) {
          // a coloured tail lens is itself what glows; a clear lens shows the bulb
          material.color.setHex(amber ? 0xc4560b : 0x9e1108);
          material.emissive = new THREE.Color(amber ? 0xff6a08 : 0xf00c03);
          material.emissiveIntensity = 0;
        }
      }

      if (name.startsWith('carpaint_second')) this.claddingMaterials.push(material);
      else if (name.startsWith('carpaint')) this.paintMaterials.push(material);

      if (name.startsWith('licplate')) {
        // retire the European plate the model ships with
        material.transparent = true;
        material.opacity = 0;
        material.depthWrite = false;
      }
      if (/^(windowglass|darkglass|clearglass)/.test(name)) {
        material.transparent = true;
        material.opacity = 0.36;
        material.roughness = 0.05;
        material.metalness = 0;
      }
    });

    this.scene.add(root);
    this.car = root;
    this._fitPlates();
    // beams were built against the scene; re-parent so they steer with the body
    ['head', 'fog', 'roof'].forEach((k) =>
      this.beams[k].forEach((l) => {
        this.car.add(l);
        this.car.add(l.target);
      }));
  }

  _plateTexture() {
    const W = 640;
    const H = 320;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const r = 26;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(W - r, 0);
    ctx.quadraticCurveTo(W, 0, W, r);
    ctx.lineTo(W, H - r);
    ctx.quadraticCurveTo(W, H, W - r, H);
    ctx.lineTo(r, H);
    ctx.quadraticCurveTo(0, H, 0, H - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.62, '#f7f9fa');
    g.addColorStop(1, '#e8edef');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = '#7FA6C4';
    ctx.beginPath();
    ctx.moveTo(-20, H * 0.92);
    ctx.lineTo(150, H * 0.52);
    ctx.lineTo(215, H * 0.6);
    ctx.lineTo(286, H * 0.3);
    ctx.lineTo(330, H * 0.34);
    ctx.lineTo(392, H * 0.24);
    ctx.lineTo(452, H * 0.55);
    ctx.lineTo(520, H * 0.45);
    ctx.lineTo(W + 20, H * 0.92);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(330, H * 0.34);
    ctx.lineTo(392, H * 0.24);
    ctx.lineTo(430, H * 0.42);
    ctx.lineTo(392, H * 0.38);
    ctx.lineTo(360, H * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#25497E';
    ctx.font = "italic 700 52px Georgia, 'Times New Roman', serif";
    ctx.fillText('Washington', W / 2, 60);
    ctx.fillStyle = '#13315D';
    ctx.font = "700 124px 'Arial Narrow', 'Helvetica Neue', Impact, sans-serif";
    ctx.fillText('BAJA 04', W / 2, 218);
    ctx.fillStyle = '#5E7183';
    ctx.font = "600 26px 'Arial Narrow', Helvetica, sans-serif";
    ctx.fillText('EVERGREEN STATE', W / 2, 278);
    ctx.fillStyle = '#C6462F';
    ctx.fillRect(W - 96, 22, 62, 62);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 30px Helvetica, sans-serif';
    ctx.fillText('06', W - 65, 62);
    ctx.strokeStyle = '#25497E';
    ctx.lineWidth = 9;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  /** the model ships 520x110mm European plates; these are 12x6in US plates */
  _fitPlates() {
    const material = new THREE.MeshStandardMaterial({ map: this._plateTexture(), roughness: 0.44 });
    const geo = new THREE.PlaneGeometry(0.325, 0.1625);
    const front = new THREE.Mesh(geo, material);
    front.position.set(0, 0.511, 2.4295);
    const rear = new THREE.Mesh(geo, material);
    rear.position.set(0, 0.761, -2.3425);
    rear.rotation.y = Math.PI;
    this.car.add(front);
    this.car.add(rear);
    this.plates = [front, rear];
  }

  /* ---------------------------------------------------------------- setters */

  setPaint({ bodyHex, claddingHex, bodyFinish, claddingFinish }) {
    const body = FINISH[bodyFinish] || FINISH.pearl;
    const clad = FINISH[claddingFinish] || FINISH.solid;
    this.paintMaterials.forEach((m) => {
      m.color.set(bodyHex);
      m.metalness = body.metalness;
      m.roughness = body.roughness;
      m.envMapIntensity = body.envIntensity;
      if ('clearcoat' in m) {
        m.clearcoat = 1;
        m.clearcoatRoughness = body.clearcoatRoughness;
      }
      m.needsUpdate = true;
    });
    // cladding is textured composite, not glossy panel: same pigment, far rougher
    this.claddingMaterials.forEach((m) => {
      m.color.set(claddingHex);
      m.metalness = clad.metalness * 0.3;
      m.roughness = 0.56;
      m.envMapIntensity = 0.8;
      if ('clearcoat' in m) m.clearcoat = 0;
      m.needsUpdate = true;
    });
  }

  setScoop(visible) {
    if (this.scoop) this.scoop.visible = visible;
  }

  setLights(state) {
    this.lightState = { ...state };
    const set = (key, on, value) => {
      if (this.reflectors[key]) this.reflectors[key].emissiveIntensity = on ? value : 0;
    };
    set('head', state.head, 3.4);
    set('fog', state.fog, 3.0);
    set('roof', state.roof, 4.0);
    this.beams.head.forEach((l) => { l.intensity = state.head ? l.userData.base : 0; });
    this.beams.fog.forEach((l) => { l.intensity = state.fog ? l.userData.base : 0; });
    this.beams.roof.forEach((l) => { l.intensity = state.roof ? l.userData.base : 0; });
  }

  setDusk(on) {
    this.dusk = on;
    if (this.studio) return;
    this.scene.background = on ? this.skyDusk : this.skyDay;
    this.scene.environment = on ? this.envDusk : this.envDay;
    this.scene.fog.color.setHex(on ? 0x2b3742 : 0xa8b4b4);
    this.sun.intensity = on ? 0.7 : 3.6;
    this.sun.color.setHex(on ? 0xffb478 : 0xffdcaf);
    this.hemi.intensity = on ? 0.3 : 1.15;
    if (this.grade) this.grade.uniforms.uExposure.value = on ? 1.35 : 1.45;
    // the peak and ridges are unlit, so they need tinting by hand at dusk
    this.mountain.material.color.setRGB(on ? 0.46 : 1, on ? 0.37 : 1, on ? 0.4 : 1);
    this.ridges.forEach((r) => {
      r.material.color.copy(r.userData.baseColour);
      if (on) r.material.color.multiplyScalar(0.26);
    });
  }

  /** paint-shop backdrop: no landscape, neutral light, slow turntable */
  setStudio(on) {
    this.studio = on;
    this.scenery.forEach((o) => { o.visible = !on; });
    this.studioFloor.visible = on;
    this.scene.fog.far = on ? 4000 : 300;
    if (on) {
      this.scene.background = this.skyStudio;
      this.scene.environment = this.envStudio;
      this.sun.intensity = 3.2;
      this.sun.color.setHex(0xffffff);
      this.hemi.intensity = 1.7;
      if (this.grade) this.grade.uniforms.uExposure.value = 1.45;
      this.carX = 0;
      this.steer = 0;
    } else {
      this.setDusk(this.dusk);
    }
  }

  setDriving(on) { this.driving = on; }
  setAutoOrbit(on) { this.autoOrbit = on; }
  setSteerInput(value) { this.steerInput = value; }

  resetView() {
    this.carX = 0;
    this.steer = 0;
    this.camera.position.copy(HOME_CAMERA);
    this.controls.target.copy(HOME_TARGET);
    this.controls.update();
  }

  /* -------------------------------------------------------------- main loop */

  _onResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    if (this.gtao) this.gtao.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _tick(now) {
    if (this.disposed) return;
    this._frame = requestAnimationFrame(this._tick);
    const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;

    if (this.driving && !this.studio) {
      const v = 13.5;
      this.roadTexture.offset.y -= (v * dt) / 12.3;
      this.spin += (v / 0.32) * dt;
      this.wheels.forEach((w) => { w.rotation.x = this.spin; });
      this.posts.forEach((p) => {
        p.position.z -= v * dt;
        if (p.position.z < -300) p.position.z += 600;
      });
      this.trees.forEach((t) => {
        t.z -= v * dt;
        if (t.z < -300) t.z += 600;
      });
      this._syncForest();
    }

    // steering: +1 is the car's left, which is +X
    this.steer += (this.steerInput - this.steer) * Math.min(1, dt * 7);
    if (!this.studio) {
      this.carX = Math.max(-3.3, Math.min(3.3, this.carX + this.steer * 4.4 * dt));
      if (this.car) {
        this.car.position.x = this.carX;
        this.car.rotation.y = this.steer * 0.075;
        this.car.rotation.z = this.steer * 0.022;
      }
      this.frontWheels.forEach((w) => { w.rotation.y = this.steer * 0.46; });
      const tx = HOME_TARGET.x + this.carX * 0.72;
      this.camera.position.x += tx - this.controls.target.x;
      this.controls.target.x = tx;
    }

    this._updateRearLamps(now);

    this.controls.autoRotate = this.autoOrbit || this.studio;
    this.controls.autoRotateSpeed = this.studio ? 1.4 : 0.9;
    this.controls.update();
    this.grade.uniforms.uTime.value = now * 0.001;
    this.composer.render();
  }

  _updateRearLamps(now) {
    const s = this.lightState;
    const blink = Math.floor(now / 430) % 2 === 0;
    const left = s.hazard || s.left;
    const right = s.hazard || s.right;
    const running = s.head ? 0.5 : 0;
    const braking = s.brake ? 1.75 : running;
    // the coloured lens carries the glow; its reflector adds a dimmer inner glint
    const pair = (lens, reflector, value) => {
      if (this.lenses[lens]) this.lenses[lens].emissiveIntensity = value;
      if (this.reflectors[reflector]) this.reflectors[reflector].emissiveIntensity = value * 0.35;
    };
    pair('amberL', 'turnL', left && blink ? 3.2 : 0);
    pair('amberR', 'turnR', right && blink ? 3.2 : 0);
    // a combined rear bulb: the indicator interrupts the brake on that side
    pair('redL', 'tailL', left ? (blink ? 1.9 : 0) : braking);
    pair('redR', 'tailR', right ? (blink ? 1.9 : 0) : braking);
    pair('brake', 'brake', s.brake ? 2.0 : 0);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this._frame);
    window.removeEventListener('resize', this._onResize);
    this.controls.dispose();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const materials = Array.isArray(o.material) ? o.material : [o.material];
      materials.forEach((m) => m && m.dispose());
    });
    [this.skyDay, this.skyDusk, this.skyStudio, this.envDay, this.envDusk, this.envStudio, this.roadTexture]
      .forEach((t) => t && t.dispose());
    this.composer.dispose();
    this.renderer.dispose();
  }
}

const REFLECTOR_COLOURS = {
  head: 0xfff2dc,
  fog: 0xffe6b4,
  roof: 0xfff5e4,
  turnL: 0xff7a12,
  turnR: 0xff7a12,
  tailL: 0xff2008,
  tailR: 0xff2008,
  brake: 0xff2008,
};
