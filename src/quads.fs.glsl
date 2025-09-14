#version 300 es
precision mediump float;
precision mediump int;

uniform sampler2D image;
// centroid in vec2 tex;
in vec2 tex;
in vec4 tone;
in vec2 inner_position;
out vec4 color;

void main() {
    vec2 texture_size = vec2(textureSize(image, 0));
    vec2 pixel = tex * texture_size;
    vec2 seam = floor(pixel + 0.5);
    pixel = seam + clamp((pixel - seam) / fwidth(pixel), -0.5, 0.5);
    // pixel = round(tex * texture_size + 0.5) - 0.5;
    color = texture(image, pixel / texture_size) * tone;
    // if (max(abs(inner_position.x), abs(inner_position.y)) > 1.0) color = vec4(1, 0.2, 0.2, 1);
}
