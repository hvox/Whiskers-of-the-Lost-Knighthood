#version 300 es
precision mediump float;
precision mediump int;

uniform sampler2D image;
in vec2 tex;
out vec4 color;

void main() {
    // color = texture(image, ...);
    color = vec4(tex, 0.5 - max(tex.r, tex.g), sin(gl_FragCoord.x) + sin(gl_FragCoord.y));
}
