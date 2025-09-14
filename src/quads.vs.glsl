#version 300 es
uniform vec4 transform;
uniform vec4 color;

in vec2 position;
in vec2 uv;
out vec2 tex;
out vec4 tone;
out vec2 inner_position;
flat out vec2 min_tex;
flat out vec2 max_tex;

void main() {
    gl_Position = vec4(position.xy * transform.zw + transform.xy, 0.0, 1.0);
    tone = color;
    inner_position = vec2(
            2.0 * float(gl_VertexID / 2 % 2) - 1.0,
            1.0 - 2.0 * float((gl_VertexID + 1) % 4 < 2)
        );
    tex = uv;
    min_tex = max_tex = uv;
    if (gl_VertexID % 4 == 0) max_tex = vec2(1);
    else min_tex = vec2(0);
}
