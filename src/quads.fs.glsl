#version 300 es
precision mediump float;
precision mediump int;

uniform sampler2D image;
centroid in vec2 tex;
out vec4 color;

void main() {
    color = texture(image, tex);
	// if (color.a == 0.0) discard;
}
