precision mediump float;

varying vec2 position;
varying vec2 vTextureCoord;
// varying vec4 vColor;

uniform sampler2D uSampler;
uniform float customUniform;

void main(void)
{
    vec2 uvs = vTextureCoord.xy;

    vec4 fg = texture2D(uSampler, vTextureCoord);

    fg.b = uvs.y * 0.5;
    fg.r = .125 - (sin(customUniform) + 1.0) * 0.125 * uvs.y + (cos(customUniform)) * 0.125 * uvs.x;
    // fg.r = uvs.x + cos(customUniform);

    // fg.b = clamp(fg.b,0.18,0.25);
    // fg.r = clamp(fg.r, 0.05, 0.12);

    gl_FragColor = fg;
}