#version 300 es
in vec2 position;
out vec2 tex;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    tex = position.xy;
}
