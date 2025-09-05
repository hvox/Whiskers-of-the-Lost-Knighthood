const QUADS_VS = await(await fetch("./quads.vs.glsl", { cache: "no-store" })).text();
const QUADS_FS = await(await fetch("./quads.fs.glsl", { cache: "no-store" })).text();

let canvas = document.createElement("canvas");
canvas.style = "position: absolute; width: 100%; height: 100%; inset: 0px;";
let gl = canvas.getContext("webgl2");
document.body.appendChild(canvas);
let shader = buildShaderProgram(QUADS_VS, QUADS_FS);
let glIndicesBuffer = gl.createBuffer(); {
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
};

let vertices = gl.createBuffer(); {
	gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
	const positions = new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function buildShaderProgram(vs, fs) {
	let vshader = loadShader("Vertex", gl.VERTEX_SHADER, vs);
	let fshader = loadShader("Fragment", gl.FRAGMENT_SHADER, fs);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vshader);
	gl.attachShader(shaderProgram, fshader);
	gl.bindAttribLocation(shaderProgram, 0, "position");
	// gl.bindAttribLocation(shaderProgram, 1, "vertex_normal");
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

let x = 1;
let last_t = 0;
function onFrame(t) {
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
	let dt = (t - last_t) / 1000;
	x += 1 * dt;

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.clearDepth(1.0);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(shader);
	gl.bindBuffer(gl.ARRAY_BUFFER, (vertices));
	gl.vertexAttribPointer(0, 2, gl.FLOAT, 0, 0, 0);
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
	gl.uniform2f(gl.getUniformLocation(shader, "scale"), 640 / canvas.clientWidth, 640 / canvas.clientHeight);
	gl.drawElements(gl.TRIANGLE_STRIP, 6, gl.UNSIGNED_SHORT, 0);

	window.requestAnimationFrame(onFrame);
	last_t = t;
}

window.requestAnimationFrame(onFrame);
