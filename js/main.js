(function() {

	var camera, scene, renderer, material;
	//
	var controls, effect;
	//
	
	var fov = 70,
		texture_placeholder,
		isUserInteracting = false,
		onMouseDownMouseX = 0,
		onMouseDownMouseY = 0,
		lon = 0,
		onMouseDownLon = 0,
		lat = 0,
		onMouseDownLat = 0,
		phi = 0,
		theta = 0;
		
	var ua = navigator.userAgent;
	
	init();
	animate();

	function init() {

		var container, mesh;

		container = document.getElementById('container');

		camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1100);
		camera.target = new THREE.Vector3(0, 0, 0);
		camera.position.set(0, 0, 100);

		scene = new THREE.Scene();

		var geometry = new THREE.SphereGeometry(500, 60, 40);
		geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

		video = document.createElement('video');
		video.src = "R0010004_20161101155836_er.MP4";
		video.autoplay = true;
		video.muted = true;
		video.loop = true;

		texture = new THREE.VideoTexture( video );  
		texture.minFilter = THREE.LinearFilter;  
		texture.magFilter = THREE.LinearFilter;  
		texture.format = THREE.RGBFormat;
    
    material = new THREE.MeshBasicMaterial( { map: texture } );

		mesh = new THREE.Mesh(geometry, material);

		scene.add(mesh);

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		//
		
		if( (navigator.userAgent.indexOf('Android') > 0) || (navigator.userAgent.indexOf('iPhone') > 0) ) {
			controls = new THREE.DeviceOrientationControls(camera);
		}else{
			controls = new THREE.OrbitControls(camera);
			controls.enableZoom = false;
		}
		
		
		effect = new THREE.StereoEffect(renderer);
		//

		window.addEventListener('resize', onWindowResize, false);

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function animate() {

		requestAnimationFrame(animate);
		render();

	}

	function render() {
		
		//controls.update();

		lat = Math.max(-85, Math.min(85, lat));
		phi = THREE.Math.degToRad(90 - lat);
		theta = THREE.Math.degToRad(lon);

		camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
		camera.target.y = 500 * Math.cos(phi);
		camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

		//camera.lookAt(camera.target);

		/*
				// distortion
				camera.position.x = - camera.target.x;
				camera.position.y = - camera.target.y;
				camera.position.z = - camera.target.z;
				*/
		if( (navigator.userAgent.indexOf('Android') > 0) || (navigator.userAgent.indexOf('iPhone') > 0) ) {
			controls.update();
		}
		//renderer.render(scene, camera);
		effect.render(scene, camera);
	}
	
	/*function fullscreen() {
		if (container.requestFullscreen) {
			container.requestFullscreen();
		} else if (container.msRequestFullscreen) {
			container.msRequestFullscreen();
		} else if (container.mozRequestFullScreen) {
			container.mozRequestFullScreen();
		} else if (container.webkitRequestFullscreen) {
			container.webkitRequestFullscreen();
		}
	}*/

	/**
	 *画像Drag＆Drop処理
	 */

	function cancelEvent(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	function handllerDroppedFile(e) {
		//単一ファイルの想定
		var file = e.dataTransfer.files[0];

		if (!file.type.match('video.*') && !file.type.match('image.*')) {
			alert('imageファイルかvideoファイルを選択してください');
			cancelEvent(e);
		}
		
		var img = document.createElement("img");

		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			if (file.type.match('video.*')) {
				video.src = e.target.result;
				video.autoplay = true;
				video.muted = true;
				video.loop = true;
				material.map = new THREE.VideoTexture(video);
				material.map.needsUpdate = true;
			} else if (file.type.match('image.*')) {
				img.src = e.target.result;
				material.map = new THREE.Texture(img);
				material.map.needsUpdate = true;
			}
		};
		fileReader.readAsDataURL(file);
		//デフォルトのイベントキャンセルしないとブラウザでイメージが表示されてしまう
		cancelEvent(e);
	}

	var droppable = document.getElementById('container');
	droppable.addEventListener('dradenter', cancelEvent);
	droppable.addEventListener('dragover', cancelEvent);
	droppable.addEventListener('drop', handllerDroppedFile);
	
})();
