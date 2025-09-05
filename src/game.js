const QUADS_VS = await(await fetch("./quads.vs.glsl", { cache: "no-store" })).text();
const QUADS_FS = await(await fetch("./quads.fs.glsl", { cache: "no-store" })).text();

let canvas = document.createElement("canvas");
canvas.style = "position: absolute; width: 100%; height: 100%; inset: 0px;";
let gl = canvas.getContext("webgl2");
document.body.appendChild(canvas);
let shader = buildShaderProgram(QUADS_VS, QUADS_FS);
let vertices = gl.createBuffer();
{
	gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
	const positions = new Float32Array([0.5, 0.0, -0.5, 0.0, 0.0, 0.5, 0.5, -0.5]);
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
		alert(`GPU program error: ${gl.getProgramInfoLog(shaderProgram)}`);
	return shaderProgram;
}

function loadShader(name, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		alert(`${name} shader error: ${gl.getShaderInfoLog(shader)}`);
	return shader;
}


function onResize() {
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}


let x = 1;
let last_t = 0;
function onFrame(t) {
	let dt = (t - last_t) / 1000;
	x += 1 * dt;

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.disable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.clearDepth(1.0);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(shader);
	gl.bindBuffer(gl.ARRAY_BUFFER, (vertices));
	gl.vertexAttribPointer(0, 2, gl.FLOAT, 0, 0, 0);
	gl.enableVertexAttribArray(0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	window.requestAnimationFrame(onFrame);
	last_t = t;
}

document.addEventListener("resize", onResize);
window.requestAnimationFrame(onFrame);
