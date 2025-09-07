#version 300 es
precision mediump float;
precision mediump int;

uniform sampler2D image;
// centroid in vec2 tex;
in vec2 tex;
out vec4 color;

void main() {
    vec2 texture_size = vec2(textureSize(image, 0));
    vec2 pixel = tex * texture_size;
    vec2 seam = floor(pixel + 0.5);
    pixel = seam + clamp((pixel - seam) / fwidth(pixel), -0.5, 0.5);
    color = texture(image, pixel / texture_size);
}
