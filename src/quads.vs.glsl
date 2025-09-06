#version 300 es
uniform vec2 scale;

in vec3 position;
out vec2 tex;

void main() {
    gl_Position = vec4((position.xy - vec2(1, 0)) * scale / position.z, 0.0, 1.0);
    tex = position.xy;
}
