const QUADS_VS = await(await fetch("./quads.vs.glsl", { cache: "no-store" })).text();
const QUADS_FS = await(await fetch("./quads.fs.glsl", { cache: "no-store" })).text();
const FOG_VS = await(await fetch("./fog.vs.glsl", { cache: "no-store" })).text();
const FOG_FS = await(await fetch("./fog.fs.glsl", { cache: "no-store" })).text();
const MAX_BUFFER_SIZE = 8192;

let canvas = document.createElement("canvas");
canvas.style = "position: absolute; width: 100%; height: 100%; inset: 0px; image-rendering: pixelated;";
// canvas.style = "position: absolute; width: 100%; height: 100%; inset: 0px;";
let gl = canvas.getContext("webgl2", { alpha: false });
document.body.appendChild(canvas);
let shader = buildShaderProgram(QUADS_VS, QUADS_FS);
let fogShader = buildShaderProgram(FOG_VS, FOG_FS);
let batchColor = 0xffffffff;
let glIndicesBuffer = gl.createBuffer(); {
	let indices = [];
	for (let i = 0; i * 2 < MAX_BUFFER_SIZE; i += 4)
		indices.push(...[i, i + 2, i + 1, i, i + 3, i + 2]);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
};

var texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
let textureResolution = { w: 4, h: 4 };
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
	0, 0, 255, 255, 255, 255, 255, 255,
	255, 0, 255, 255, 255, 128, 0, 255,
	128, 0, 128, 255, 255, 255, 255, 255,
	32, 0, 0, 64, 128, 255, 0, 255,
	0, 128, 128, 255, 0, 255, 0, 192,
	255, 0, 255, 255, 255, 0, 0, 255,
	0, 255, 0, 255, 255, 255, 255, 255,
	255, 0, 255, 255, 255, 255, 0, 255,
]));
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
var image = new Image();
image.onload = function () {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	textureResolution = { w: image.naturalWidth, h: image.naturalHeight };
}
image.src = "./atlas.png";
let vertices = new Float32Array(MAX_BUFFER_SIZE);
let verticesBuffer = gl.createBuffer();
let uvs = new Float32Array(MAX_BUFFER_SIZE);
let uvBuffer = gl.createBuffer();
let camera = { x: 0, y: 8 };
let knight = { x: 0, y: 0, d: 1, dx: 0, dy: 0, state: "idle", t: 0 };
let sprites = {
	"knight/idle0": { x: 0, y: 0, w: 32, h: 32 },
	"knight/idle1": { x: 32, y: 0, w: 32, h: 32 },
	"knight/idle2": { x: 64, y: 0, w: 32, h: 32 },
	"knight/run1": { x: 96, y: 0, w: 32, h: 32 },
	"knight/run2": { x: 128, y: 0, w: 32, h: 32 },
	"knight/run3": { x: 160, y: 0, w: 32, h: 32 },
	"knight/atack1": { x: 192, y: 0, w: 32, h: 32 },
	"knight/atack2": { x: 224, y: 0, w: 32, h: 32 },
	"knight/death1": { x: 256, y: 0, w: 32, h: 32 },
	"knight/death2": { x: 288, y: 0, w: 32, h: 32 },

	"cat/i1": { x: 0, y: 32, w: 32, h: 32 },
	"cat/i2": { x: 32, y: 32, w: 32, h: 32 },
	"cat/i3": { x: 64, y: 32, w: 32, h: 32 },
	"cat/r1": { x: 96, y: 32, w: 32, h: 32 },
	"cat/r2": { x: 128, y: 32, w: 32, h: 32 },
	"cat/a1": { x: 160, y: 32, w: 32, h: 32 },
	"cat/a2": { x: 192, y: 32, w: 32, h: 32 },
	"cat/a3": { x: 224, y: 32, w: 32, h: 32 },
	"cat/d1": { x: 256, y: 32, w: 32, h: 32 },
	"cat/d2": { x: 288, y: 32, w: 32, h: 32 },
	"cat/z1": { x: 0, y: 64, w: 32, h: 32 },
	"cat/z2": { x: 32, y: 64, w: 32, h: 32 },
	"cat/z3": { x: 64, y: 64, w: 32, h: 32 },
	"cat/s1": { x: 96, y: 64, w: 32, h: 32 },
	"cat/s2": { x: 128, y: 64, w: 32, h: 32 },
	"cat/j1": { x: 160, y: 64, w: 32, h: 32 },
	"cat/j2": { x: 192, y: 64, w: 32, h: 32 },
	"cat/h1": { x: 224, y: 64, w: 32, h: 32 },
	"cat/h2": { x: 256, y: 64, w: 32, h: 32 },
	"cat/h3": { x: 288, y: 64, w: 32, h: 32 },

	"lift": { x: 0, y: 96, w: 32, h: 32 },
	"chain": { x: 32, y: 96, w: 16, h: 32 },
	"skull/r1": { x: 48, y: 96, w: 16, h: 16 },
	"skull/r2": { x: 64, y: 96, w: 16, h: 16 },
	"skull/r3": { x: 48, y: 112, w: 16, h: 16 },
	"skull/r4": { x: 64, y: 112, w: 16, h: 16 },
	"skull/w1": { x: 80, y: 96, w: 16, h: 16 },
	"skull/w2": { x: 96, y: 96, w: 16, h: 16 },
	"skull/w3": { x: 80, y: 112, w: 16, h: 16 },
	"skull/w4": { x: 96, y: 112, w: 16, h: 16 },
	"skull/b1": { x: 112, y: 96, w: 16, h: 16 },
	"skull/b2": { x: 128, y: 96, w: 16, h: 16 },
	"skull/b3": { x: 112, y: 112, w: 16, h: 16 },
	"skull/b4": { x: 128, y: 112, w: 16, h: 16 },
	"holy1": { x: 144, y: 96, w: 16, h: 16 },
	"holy2": { x: 160, y: 96, w: 16, h: 16 },
	"shield": { x: 144, y: 112, w: 16, h: 16 },
	"floor": { x: 176, y: 96, w: 48, h: 32 },
	"wall": { x: 224, y: 96, w: 96, h: 32 },
};


function buildShaderProgram(vs, fs) {
	let vshader = loadShader("Vertex", gl.VERTEX_SHADER, vs);
	let fshader = loadShader("Fragment", gl.FRAGMENT_SHADER, fs);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vshader);
	gl.attachShader(shaderProgram, fshader);
	gl.bindAttribLocation(shaderProgram, 0, "position");
	gl.bindAttribLocation(shaderProgram, 1, "uv");
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
		alert(`Shader error: ${gl.getProgramInfoLog(shaderProgram)}`);
	return shaderProgram;
}

function loadShader(name, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	// TODO: do I need it?
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		alert(`${name} shader error: ${gl.getShaderInfoLog(shader)}`);
	return shader;
}

let bufferSize = 0;
function draw2d(x, y, direction, sprite, color = 0xffffffff) {
	if (bufferSize == MAX_BUFFER_SIZE || color != batchColor) {
		drawBatch();
		batchColor = color;
	}
	let uv = sprites[sprite] ?? { x: 0, y: 0, w: 64, h: 64 };
	let u0 = uv.x / textureResolution.w;
	let u1 = u0 + uv.w / textureResolution.w;
	let v1 = 1 - uv.y / textureResolution.h;
	let v0 = v1 - uv.h / textureResolution.h;
	if (direction != 1) [u0, u1] = [u1, u0];
	uvs[bufferSize + 0] = u0;
	uvs[bufferSize + 1] = v0;
	uvs[bufferSize + 2] = u0;
	uvs[bufferSize + 3] = v1;
	uvs[bufferSize + 4] = u1;
	uvs[bufferSize + 5] = v1;
	uvs[bufferSize + 6] = u1;
	uvs[bufferSize + 7] = v0;
	x -= camera.x;
	y -= camera.y;
	let dx = uv.w / 2;
	let dy = uv.h / 2;
	vertices[bufferSize++] = x - dx;
	vertices[bufferSize++] = y - dy;
	vertices[bufferSize++] = x - dx;
	vertices[bufferSize++] = y + dy;
	vertices[bufferSize++] = x + dx;
	vertices[bufferSize++] = y + dy;
	vertices[bufferSize++] = x + dx;
	vertices[bufferSize++] = y - dy;
}

function drawBatch() {
	if (bufferSize == 0) return;
	gl.useProgram(shader);
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, 0, 0, 0);
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STREAM_DRAW);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, 0, 0, 0);
	gl.enableVertexAttribArray(1);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
	gl.uniform4f(gl.getUniformLocation(shader, "transform"),
		(canvas.width & 1) / canvas.width, (canvas.height & 1) / canvas.height,
		16 / canvas.width, 16 / canvas.height);
	gl.uniform4f(gl.getUniformLocation(shader, "color"),
		Math.trunc(batchColor / 0x01000000) / 0xff,
		(batchColor & 0x00ff0000) / 0x00ff0000,
		(batchColor & 0x0000ff00) / 0x0000ff00,
		(batchColor & 0x000000ff) / 0x000000ff,
	);
	gl.drawElements(gl.TRIANGLES, bufferSize * 3 >> 2, gl.UNSIGNED_SHORT, 0);
	bufferSize = 0;
}

let fps = 0;
let frame = 0;
let fpsT = 0;
function trackFps(t) {
	frame += 1;
	if (t - fpsT > 1000) {
		fps = 1000 * frame / (t - fpsT);
		frame = 0;
		fpsT = t;
	}
}

let last_t = 0;
// let skipFrame = 0;
function onFrame(t) {
	// skipFrame += 1; if (skipFrame % 2) { requestAnimationFrame(onFrame); return; };
	trackFps(t);
	canvas.width = canvas.clientWidth * window.devicePixelRatio / 1;
	canvas.height = canvas.clientHeight * window.devicePixelRatio / 1;
	let debug_info = canvas.width + "x" + canvas.height;
	let dt = (t - last_t) / 1000;
	debug_info += "\nFPS=" + fps.toFixed(2);
	updateKeyStates(dt);
	last_t = t;

	let runDir = (keys["KeyD"] > 0) - (keys["KeyA"] > 0);
	let knightState = runDir != 0 ? "run" : "idle";
	knight.x += runDir * 50 * dt;
	knight.d = runDir || knight.d;
	if (knight.state == knightState) {
		knight.t += dt;
	} else {
		knight.state = knightState;
		knight.t = 0;
	}
	let alpha = Math.min(0.9, 3.0 * dt);
	// let cameraTarget = Math.round(knight.x + knight.d * 16);
	let cameraTarget = knight.x + knight.d * 16;
	camera.x = (1 - alpha) * camera.x + alpha * cameraTarget;
	if (Math.abs(camera.x - cameraTarget) < 0.05) camera.x = cameraTarget;
	switch (knightState) {
		case "idle":
			knight.x = Math.round(knight.x + knight.d * 0.4);
			knightState += 1 + Math.round(knight.t / 0.35) % 2;
			break;
		case "run": knightState += 1 + Math.abs(Math.round(knight.t / 0.15) % 4 - 2); break;
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.depthFunc(gl.LEQUAL);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clearDepth(1.0);
	gl.clearColor(0.0, 0.0, 0.0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	t /= 1000;
	let x0 = Math.round(camera.x / 48) * 48;
	for (let x = x0 - 128; x <= x0 + 176; x += 48)
		draw2d(x, -26, 1, "floor");
	draw2d(knight.x, knight.y, knight.d, "knight/" + knightState);
	drawBatch();

	gl.useProgram(fogShader);
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0]), gl.STREAM_DRAW);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, 0, 0, 0);
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0]), gl.STREAM_DRAW);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, 0, 0, 0);
	gl.enableVertexAttribArray(1);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
	gl.uniform4f(gl.getUniformLocation(fogShader, "transform"),
		(canvas.width & 1) / canvas.width, (canvas.height & 1) / canvas.height,
		16 / canvas.width, 16 / canvas.height);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


	window.requestAnimationFrame(onFrame);
	document.getElementById("debug").innerText = debug_info;
}

let keys = {}

function updateKeyStates(dt = 0) {
	let keysUpdated = {};
	for (const [key, t] of Object.entries(keys))
		if (t > dt) keysUpdated[key] = t - dt;
	keys = keysUpdated;
}

function onKeydown(key) {
	if (key.key == "ArrowLeft") {
		camera.x -= 0.5;
	} else if (key.key == "ArrowRight") {
		camera.x += 0.5;
	}
	keys[key.code] = 1;
}

function onKeyup(key) {
	delete keys[key.code];
}

document.addEventListener("keydown", onKeydown);
document.addEventListener("keyup", onKeyup);
window.requestAnimationFrame(onFrame);
