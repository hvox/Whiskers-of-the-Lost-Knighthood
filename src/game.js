const QUADS_VS = await(await fetch("./quads.vs.glsl", { cache: "no-store" })).text();
const QUADS_FS = await(await fetch("./quads.fs.glsl", { cache: "no-store" })).text();
const MAX_BUFFER_SIZE = 8192;

let canvas = document.createElement("canvas");
canvas.style = "position: absolute; width: 100%; height: 100%; inset: 0px;";
let gl = canvas.getContext("webgl2");
document.body.appendChild(canvas);
let shader = buildShaderProgram(QUADS_VS, QUADS_FS);
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
// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array());
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
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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

let sprites = {
	"big": { x: 18, y: 17, b: 80, r: 76 },
	"face": { x: 0, y: 18, b: 45, r: 22 },
	"mini": { x: 0, y: 0, b: 16, r: 16 }
};

let vertices = new Float32Array(MAX_BUFFER_SIZE);
let verticesBuffer = gl.createBuffer();
let uvs = new Float32Array(MAX_BUFFER_SIZE);
let uvBuffer = gl.createBuffer();
let camera = { x: 1, y: 0 };

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
function drawQuad(x, y, z, sprite) {
	if (bufferSize == MAX_BUFFER_SIZE) drawBatch();
	let uv = sprites[sprite] ?? { x: 0, y: 0, r: 16, b: 16 };
	let u0 = uv.x / textureResolution.w;
	let u1 = uv.r / textureResolution.w;
	let v0 = uv.y / textureResolution.h;
	let v1 = uv.b / textureResolution.h;
	uvs[bufferSize + 0] = u0;
	uvs[bufferSize + 1] = v0;
	uvs[bufferSize + 2] = u0;
	uvs[bufferSize + 3] = v1;
	uvs[bufferSize + 4] = u1;
	uvs[bufferSize + 5] = v1;
	uvs[bufferSize + 6] = u1;
	uvs[bufferSize + 7] = v0;
	x = (x - camera.x) / z;
	y = (y - camera.y) / z;
	let dx = (uv.r - uv.x) / 2;
	let dy = (uv.b - uv.y) / 2;
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
	gl.uniform2f(gl.getUniformLocation(shader, "scale"), 8 / canvas.clientWidth, 8 / canvas.clientHeight);
	gl.drawElements(gl.TRIANGLES, bufferSize * 3 >> 2, gl.UNSIGNED_SHORT, 0);
	bufferSize = 0;
}

let x = 1;
let last_t = 0;
function onFrame(t) {
	canvas.width = canvas.clientWidth * window.devicePixelRatio / 1;
	canvas.height = canvas.clientHeight * window.devicePixelRatio / 1;
	let dt = (t - last_t) / 1000;
	x += 1 * dt;

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.depthFunc(gl.LEQUAL);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clearDepth(1.0);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	t /= 1000;
	drawQuad(16 * Math.sin(t) - 16, 16 * Math.cos(t), 6, "big");
	drawQuad(16 * Math.sin(t) - 16, 16 * Math.cos(t), 5, "face");
	drawQuad(16 * Math.sin(t) - 16, 16 * Math.cos(t), 4, "face");
	drawQuad(16 * Math.sin(t) - 16, 16 * Math.cos(t), 3, "face");
	drawQuad(16 * Math.sin(t) - 16, 16 * Math.cos(t), 2, "face");
	drawQuad(16 * Math.sin(t) - 16, 16 * Math.cos(t), 1, "face");
	drawQuad(16, 0, 1, "mini");
	drawQuad(48, 0, 1, "OEARWOHREA02R");
	drawBatch();

	window.requestAnimationFrame(onFrame);
	last_t = t;
}

function onKeydown(key) {
	if (key.key == "ArrowLeft") {
		camera.x -= 0.5;
	} else if (key.key == "ArrowRight") {
		camera.x += 0.5;
	}
}

document.addEventListener("keydown", onKeydown);
window.requestAnimationFrame(onFrame);
