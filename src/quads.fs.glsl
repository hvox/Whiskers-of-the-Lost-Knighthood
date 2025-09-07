#version 300 es
precision mediump float;
precision mediump int;

uniform sampler2D image;
// centroid in vec2 tex;
in vec2 tex;
out vec4 color;

void main() {
    vec2 resolution = vec2(textureSize(image, 0));
    // color = texture(image, tex);
    // if (color.a == 0.0) discard;
    if (gl_FragCoord.x > 960.0) {
        color.g = 0.0;
        vec2 pixels = tex * resolution + vec2(0.5);
        vec2 dt = fwidth(pixels) * 0.5;
        vec2 fracts = (
            clamp(fract(pixels), vec2(0.5) - dt, vec2(0.5) + dt)
                - (vec2(0.5) - dt)
            ) / (2.0 * dt);
        pixels = floor(pixels) + fracts;
        color = texture(image, (pixels - vec2(0.5)) / resolution);
    } else {
        color = texture(image, (round(tex * resolution - vec2(0.5)) + vec2(0.5)) / resolution);
    }
}
