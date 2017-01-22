"use strict";
var camera,
   scene,
   url = getParams('url'),
   element = document.getElementById('vr'), // Inject scene into this
   renderer,
   onPointerDownPointerX,
   onPointerDownPointerY,
   onPointerDownLon,
   onPointerDownLat,
   fov = 70,
   isUserInteracting = false,
   lon = 0,
   lat = 0,
   phi = 0,
   theta = 0,
   onMouseDownMouseX = 0,
   onMouseDownMouseY = 0,
   onMouseDownLon = 0,
   onMouseDownLat = 0,
   width = window.innerWidth,
   height = window.innerHeight,
   effect,
   controls,
   ratio = width / height;

var texture = THREE.ImageUtils.loadTexture(url, {}, function () {
   init();
   animate();
});

// Our preferred controls via DeviceOrientation
function setOrientationControls(e) {
   if (!e.alpha) {
      return;
   }
   controls = new THREE.DeviceOrientationControls(camera, true);
   controls.connect();
   controls.update();
   window.removeEventListener('deviceorientation', setOrientationControls, true);
}
window.addEventListener('deviceorientation', setOrientationControls, true);

function getParams(name) {
   var url = window.location.search;
   var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
   var r = url.substr(1).match(reg);
   var context = "";
   if (r != null) {
      context = r[2];
   }
   reg = null;
   r = null;
   return context == null || context == "" || context == "undefined" ? "" : context;
};

function init() {
   camera = new THREE.PerspectiveCamera(fov, ratio, 1, 1000);
   scene = new THREE.Scene();
   var mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40), new THREE.MeshBasicMaterial({ map: texture }));
   mesh.scale.x = -1;
   scene.add(mesh);
   scene.add(camera);
   renderer = new THREE.WebGLRenderer({ antialias: true });
   renderer.setSize(width, height);
   element.appendChild(renderer.domElement);
   element.addEventListener('mousedown', onDocumentMouseDown, false);
   element.addEventListener('mousewheel', onDocumentMouseWheel, false);
   element.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
   window.addEventListener('resize', onWindowResized, false);
   effect = new THREE.StereoEffect(renderer);
   onWindowResized(null);
}

function onWindowResized(event) {
   renderer.setSize(width, height);
   effect.setSize(width, height);
   camera.projectionMatrix.makePerspective(fov, ratio, 1, 1100);
}

function onDocumentMouseDown(event) {
   event.preventDefault();
   onPointerDownPointerX = event.clientX;
   onPointerDownPointerY = event.clientY;
   onPointerDownLon = lon;
   onPointerDownLat = lat;
   isUserInteracting = true;
   element.addEventListener('mousemove', onDocumentMouseMove, false);
   element.addEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseMove(event) {
   lon = (event.clientX - onPointerDownPointerX) * -0.175 + onPointerDownLon;
   lat = (event.clientY - onPointerDownPointerY) * -0.175 + onPointerDownLat;
}

function onDocumentMouseUp(event) {
   isUserInteracting = false;
   element.removeEventListener('mousemove', onDocumentMouseMove, false);
   element.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseWheel(event) {
   // WebKit
   if (event.wheelDeltaY) {
      fov -= event.wheelDeltaY * 0.05;
      // Opera / Explorer 9
   } else if (event.wheelDelta) {
      fov -= event.wheelDelta * 0.05;
      // Firefox
   } else if (event.detail) {
      fov += event.detail * 1.0;
   }
   if (fov < 45 || fov > 90) {
      fov = (fov < 45) ? 45 : 90;
   }
   camera.projectionMatrix.makePerspective(fov, ratio, 1, 1100);
}

function animate() {
   requestAnimationFrame(animate);
   render();
}

function render() {
   if (isUserInteracting === false) {
      lon += .05;
   }
   lat = Math.max(-85, Math.min(85, lat));
   phi = THREE.Math.degToRad(90 - lat);
   theta = THREE.Math.degToRad(lon);
   camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
   camera.position.y = 100 * Math.cos(phi);
   camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);
   camera.lookAt(scene.position);
   effect.render(scene, camera);
}
