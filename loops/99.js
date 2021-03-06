import THREE from '../third_party/three.js';
import {renderer, getCamera} from '../modules/three.js';
import easings from '../modules/easings.js';
import RoundedBoxGeometry from '../third_party/three-rounded-box.js';
import Maf from '../modules/maf.js';

const canvas = renderer.domElement;
const camera = getCamera();
const scene = new THREE.Scene();
const group = new THREE.Group();

const objects = [];
const r = .5;
const geo = new RoundedBoxGeometry(r,r,r,.05,5);

const CUBES = 32;
const RINGS = 8;
for (let j=0; j<RINGS; j++) {
  const material = new THREE.MeshStandardMaterial({color: 0xdedede, metalness: .1, roughness: .1});
  material.color.setHSL(.25-.5*j/RINGS,.65,.5);
  const pivot = new THREE.Group();
  const r = 2;
  const a = j * Maf.TAU / RINGS;
  const x = r * Math.cos(a);
  const y = r * Math.sin(a);
  const z = 0;
  pivot.position.set(x,y,z);
  pivot.rotation.x = Math.PI / 2;
  pivot.rotation.y = a + Math.PI/2;
  const pivot2 = new THREE.Group();
  pivot2.rotation.y = .3;
  pivot2.rotation.x = .2;
  pivot.add(pivot2);
  const offset = j % 2;
  for (let i=0; i<CUBES; i+=2) {
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = mesh.receiveShadow = true;
    const ma = ( i+offset ) * Maf.TAU / CUBES;
    const mr = 2;
    const mx = mr * Math.cos(ma);
    const my = mr * Math.sin(ma);
    const mz = 0;
    mesh.position.set(mx,my,mz);
    mesh.rotation.z = ma;
    pivot2.add(mesh);
  }
  group.add(pivot);
  objects.push({pivot:pivot2});
}
group.scale.setScalar(.5);
scene.add(group);

const directionalLight = new THREE.DirectionalLight( 0xffffff, .5 );
directionalLight.position.set(-2,2,2);
directionalLight.castShadow = true;
scene.add( directionalLight );

const directionalLight2 = new THREE.DirectionalLight( 0xffffff, .5 );
directionalLight2.position.set(4,8,4);
directionalLight2.castShadow = true;
scene.add( directionalLight2 );

const ambientLight = new THREE.AmbientLight(0x808080, .5);
scene.add(ambientLight);

const light = new THREE.HemisphereLight( 0xcefeff, 0xb3eaf0, .5 );
scene.add( light );

camera.position.set(0,0,6);
camera.lookAt(0,0,0);
renderer.setClearColor(0,1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const loopDuration = 3;

function draw(startTime) {

  const time = ( .001 * (performance.now()-startTime)) % loopDuration;
  const t = time/loopDuration;

  objects.forEach( (o,i) => {
    o.pivot.rotation.z = t * Maf.PI;
  });

  renderer.render(scene, camera);
}

export { draw, loopDuration, canvas };
