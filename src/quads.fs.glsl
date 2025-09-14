#version 300 es
precision mediump float;
precision mediump int;

uniform sampler2D image;
// centroid in vec2 tex;
in vec2 tex;
in vec4 tone;
in vec2 inner_position;
out vec4 color;
flat in vec2 min_tex;
flat in vec2 max_tex;

void main() {
    vec2 texture_size = vec2(textureSize(image, 0));
    // vec2 pixel = clamp(tex * texture_size, min_tex * texture_size + 0.5, max_tex * texture_size - 0.5);
    vec2 pixel = tex * texture_size;
    vec2 d = fwidth(inner_position) / fwidth(pixel);
    // vec2 dx = fwidth(inner_position.x) / fwidth(pixel.x);
    // if (inner_position.x > 1.0 - 0.5 * dx) pixel.x -= (inner_position.x - (1.0 - 0.5 * dx)) / dx;
    // if (inner_position.x < -1.0 + 0.5 * dx) pixel.x += distance(inner_position.x, (-1.0 + 0.5 * dx)) / dx;
    vec2 inner = clamp(inner_position, -1.0 + 0.5 * d, 1.0 - 0.5 * d);
    pixel += (inner - inner_position) / d;
    // float fix = fwidth(pixel).x;
    // if (inner_position.x <= -0.9) pixel.x += fix;
    // if (inner_position.x >= +0.9) pixel.x -= fix;
    // if (inner_position.y <= -0.9) pixel.y += fix;
    // if (inner_position.y >= +0.9) pixel.y -= fix;
    vec2 seam = floor(pixel + 0.5);
    pixel = seam + clamp((pixel - seam) / fwidth(pixel), -0.5, 0.5);
    // pixel = round(tex * texture_size + 0.5) - 0.5;
    color = texture(image, pixel / texture_size) * tone;
    // if (max(abs(inner_position.x), abs(inner_position.y)) > 1.0) color = vec4(1, 0.2, 0.2, 1);
    // color.rg = 0.5 + 0.5 * inner_position;
}
