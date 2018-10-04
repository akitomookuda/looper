import THREE from '../third_party/three.js';
import { renderer, getCamera } from '../modules/three.js';
import { MeshLine, MeshLineMaterial } from '../modules/three-meshline.js';
import Maf from '../modules/maf.js';
import { palette2 as palette } from '../modules/floriandelooij.js';
import { gradientLinear } from '../modules/gradient.js';
import OrbitControls from '../third_party/THREE.OrbitControls.js';

import Painted from '../modules/painted.js';

const painted = Painted(renderer, { minLevel: -.5 });

palette.range = ["#296888", "#C39B4B", "#A24218", "#092B44", "#FCFCFB", "#093588"];
//palette.range = ["#000000", "202020"];

const gradient = new gradientLinear(palette.range);

const canvas = renderer.domElement;
const camera = getCamera();
const scene = new THREE.Scene();
const group = new THREE.Group();
const controls = new OrbitControls(camera, canvas);

camera.position.set(8.6, 4, 8);
camera.lookAt(group.position);
renderer.setClearColor(0xF2E9D9, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const strokeTexture = new THREE.TextureLoader().load('./assets/stroke.png');
const resolution = new THREE.Vector2(canvas.width, canvas.height);

const POINTS = 20;
const meshes = [];

function prepareMesh() {

  var geo = new Float32Array(POINTS * 3);
  for (var j = 0; j < geo.length; j += 3) {
    geo[j] = geo[j + 1] = geo[j + 2] = 0;
  }

  var g = new MeshLine();
  g.setGeometry(geo, function(p) { return p; });

  const material = new MeshLineMaterial({
    useMap: true,
    map: strokeTexture,
    color: gradient.getAt(Maf.randomInRange(0, 1)),
    opacity: .9,
    resolution: resolution,
    sizeAttenuation: true,
    lineWidth: .75,
    near: camera.near,
    far: camera.far,
    depthTest: false,
    blending: THREE.NormalBlending,
    transparent: true,
  });

  var mesh = new THREE.Mesh(g.geometry, material);
  mesh.geo = geo;
  mesh.g = g;

  return mesh;

}

for (let i = 0; i < 10; i++) {
  const mesh = prepareMesh();
  group.add(mesh);
  mesh.rotation.set(Maf.randomInRange(0, Maf.TAU), Maf.randomInRange(0, Maf.TAU), Maf.randomInRange(0, Maf.TAU));
  meshes.push({
    mesh,
    radius: Maf.randomInRange(.8, 1.2),
    offset: Maf.randomInRange(0, Maf.TAU),
    range: Maf.randomInRange(Maf.TAU / 32, Maf.TAU / 10),
    a: Math.round(Maf.randomInRange(2, 5)),
    b: Math.round(Maf.randomInRange(2, 5)),
    c: Math.round(Maf.randomInRange(2, 5)),
    d: Math.round(Maf.randomInRange(2, 5)),
    e: Math.round(Maf.randomInRange(2, 5)),
  });
}
scene.add(group);

const loopDuration = 4;

function draw(startTime) {

  const time = (.001 * (performance.now() - startTime)) % loopDuration;
  const t = time / loopDuration;

  meshes.forEach((m) => {
    const geo = m.mesh.geo;
    const g = m.mesh.g;
    const range = m.range;
    const r = m.radius;
    for (var j = 0; j < geo.length; j += 3) {
      const t2 = Maf.TAU - (t * Maf.TAU + j * range / geo.length + m.offset);
      const x = r * Math.cos(m.a * t2) + r * Math.cos(m.b * t2);
      const y = r * Math.sin(m.a * t2) + r * Math.sin(m.d * t2);
      const z = 2 * r * Math.sin(m.e * t2);
      geo[j] = x;
      geo[j + 1] = y;
      geo[j + 2] = z;
    }
    g.setGeometry(geo);
  });

  painted.render(scene, camera);
}

export { draw, loopDuration, canvas };