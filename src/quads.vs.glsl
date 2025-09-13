#version 300 es
uniform vec4 transform;
uniform vec4 color;

in vec2 position;
in vec2 uv;
out vec2 tex;
out vec4 tone;

void main() {
    gl_Position = vec4(position.xy * transform.zw + transform.xy, 0.0, 1.0);
    tone = color;
    tex = uv;
}
