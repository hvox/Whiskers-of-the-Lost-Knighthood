#version 300 es
precision highp float;
precision highp int;

uniform sampler2D image;
// centroid in vec2 tex;
in vec2 tex;
out vec4 color;

void main() {
    // color.r += float(int(gl_FragCoord.x + gl_FragCoord.y) % 2) / 100.0;
    float dither = float(int(2.0 * gl_FragCoord.x + gl_FragCoord.y) % 4 - 2) / 128.0 * 0.0;
	dither = 0.0;
    color = vec4(
            0.1 * (1.0 - tex.y), 0.0, 0.1 * (1.0 - tex.y),
            max(0.0, -0.3 + distance(vec2(0.5, 0.5), tex)) * 4.0 + dither
        );
}
