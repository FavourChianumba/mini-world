import gsap  from 'gsap'
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import vertexShader from './shaders/vertexShade.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
//import countries from './files/custom.geo.json'
//import lines from './files/lines.json'
//import map from './map.json'

const canvasContainer = document.querySelector('#canvasContainer')
const scene = new THREE.Scene()
const group = new THREE.Group()
const camera = new THREE.PerspectiveCamera(75,canvasContainer.offsetWidth/canvasContainer.offsetHeight ,0.1,1000)
camera.position.z = 15
const renderer = new THREE.WebGLRenderer(
  {
    antialias : true,
    canvas: document.querySelector('canvas')
  }
)
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight )
renderer.setPixelRatio(window.devicePixelRatio)
const controls = new OrbitControls(camera, renderer.domElement )
controls.update()
// function onWindowResize(){
//   camera.aspect= window.innerWidth/window.innerHeight;
//   camera.updateProjectionMatrix();
//   window.halfX = window.innerWidth/1.5;
//   window.halfY = window.innerHeight/1.5;
//   canvasContainer.setSize(window.innerWidth, window.innerHeight);
//}

// function resize () {
//   renderer.height = window.innerHeight;
//   renderer.width = window.innerWidth;
//   renderer.setSize(renderer.width, renderer.height);
//   camera.aspect = renderer.width / renderer.height;
//   camera.updateProjectionMatrix();
// }

//create sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50), 
  new THREE.ShaderMaterial({
    vertexShader: vertexShader ,
    fragmentShader: fragmentShader, 
    uniforms: {
      globeTexture: { 
        value: new THREE.TextureLoader().load('./img/globe.jpeg')
      }
    }
  })
)
group.add(sphere)

//create atmosphere
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50), 
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader ,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
    })
)
atmosphere.scale.set(1.2, 1.2, 1.2)
group.add(atmosphere)

let Kyiv = {
  lat: 50.4501,
  lng: 30.5234
}
 let Lagos = {
  lat: 6.5244,
  lng: 3.3792
 }
 let MexCity = {
  lat: 19.4326,
  lng: -99.1332
 }
 let Shanghai = {
  lat: 31.2304,
  lng: 121.4737
 }
 let London = {
  lat: 51.5072,
  lng: -0.1276
 }
 let NewYork = {
  lat: 40.7128,
  lng: -74.0060
 }
 let Paris = {
  lat: 48.8566,
  lng: 2.3522
 }
 let LA = {
  lat: 34.0522,
  lng: -118.2437
 }
 let Dubai = {
  lat: 25.2048,
  lng: 55.2708
 }
 let Mumbai = {
  lat: 19.0760,
  lng: 72.8777
 }
 let Rio = {
  lat: -22.9068,
  lng: -43.1729
 }
 let BuenAr = {
  lat: -34.6037,
  lng: -58.3816
 }
 let places = [Kyiv, Lagos, MexCity, Shanghai, London, NewYork, Paris, LA, Dubai, Mumbai, Rio, BuenAr]

//creating points
function latlngToCoord (p){
  let phi = (90 - p.lat) * (Math.PI/180)
  let theta= (p.lng + 180) * (Math.PI/180)
  let r = sphere.geometry.parameters.radius

  let x = r * -(Math.cos(theta)*Math.sin(phi))
  let z = r * (Math.sin(theta)*Math.sin(phi))
  let y = r * (Math.cos(phi)) 

  return{x,y,z}
}

for (let i = 0; i < places.length; i++){
  let pos = latlngToCoord(places[i])
  let mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 0.5, 0.5), 
    new THREE.MeshBasicMaterial({
      color: 0xff0000
      })
  )
  mesh.position.set(pos.x,pos.y,pos.z)
  group.add(mesh)
  if( i < places.length-1){
    let pos1 = latlngToCoord(places[i+1])
    getCurve(pos, pos1) 
  } 
  
}

function getCurve(p1,p2){
  let v1 = new THREE.Vector3(p1.x, p1.y, p1.z)
  let v2 = new THREE.Vector3(p2.x, p2.y, p2.z)
  let points = []

  for (let i = 0; i <= 40; i++){
    let p = new THREE.Vector3().lerpVectors(v1, v2, i/40);
    p.normalize()
    p.multiplyScalar(5 + 0.3*Math.sin(Math.PI*i/40))
    points.push(p)

  }

  let path = new THREE.CatmullRomCurve3( points, false, "chordal", 0.5);
  const geometry = new THREE.TubeGeometry(path, 32, 0.01, 2000, false );
  const material = new THREE.MeshBasicMaterial( { color: 0xffff00  } );
  const mesh3 = new THREE.Mesh( geometry, material );
  group.add( mesh3 );
  
}
scene.add(group)

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff
})

const starVerticies = []
for (let i = 0; i < 10000; i++){
  const x = (Math.random() - 0.5) * 2000
  const y = (Math.random() - 0.5) * 2000
  const z =  -Math.random() * 2000
  starVerticies.push(x, y, z)
  starVerticies.push(-x, -y, -z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVerticies, 3))
const stars = new THREE.Points( starGeometry, starMaterial)
scene.add(stars)

const mouse = {
  x: undefined,
  y: undefined
}



function animate(){
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  group.rotation.y -= 0.001
  stars.rotation.y += 0.001
  gsap.to(group.rotation,{
    y: mouse.x, 
    x: -mouse.y ,
    duration: 4,
  })
  
}
console.log(group)
//onWindowResize()
// resize()
animate()


addEventListener('mousemove', () => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = (event.clientY / innerHeight) * -2 + 1
})

