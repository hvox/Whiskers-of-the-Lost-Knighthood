#version 300 es
uniform vec4 transform;

in vec2 position;
in vec2 uv;
out vec2 tex;

void main() {
    gl_Position = vec4(position.xy * transform.zw + transform.xy, 0.0, 1.0);
	tex = uv;
}
