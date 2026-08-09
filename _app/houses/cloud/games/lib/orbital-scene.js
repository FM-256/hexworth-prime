/**
 * orbital-scene.js — the reusable half of a Lagrange Edge sortie.
 *
 * WHY THIS FILE EXISTS. cloud-cold-horizon.html is 2,400 lines and roughly 350
 * of them are "what a spacecraft scene looks like": procedural Earth, starfield,
 * and a hand-written bloom chain. None of that is about HELIOS-7. A second
 * sortie built by copy-pasting it would mean any fix to the Earth shader has to
 * be made in two places, then three, then four. There are already fourteen cloud
 * games sharing no substrate at all; this is the point where that stops.
 *
 * Extracted at n=1, deliberately, because extracting after four copies exist
 * means reconciling four divergent copies instead of moving one.
 *
 * WHAT IS HERE AND WHAT IS NOT. Only the parts with no opinion about the
 * mission. The station, the RSV, the thermal camera, the mission state machine
 * and the consequence sequence all stay in the sortie, because they ARE the
 * sortie. If something knows what HELIOS-7 is, it does not belong in this file.
 *
 * NO BUILD STEP. Plain ES modules against the vendored three, resolved by the
 * page's own importmap. Nothing here needs a bundler.
 */
import * as THREE from 'three';

/* ── Shared shader chunk ───────────────────────────────────────────────────
   Hash-based value noise plus fbm. Value noise rather than simplex: shorter, no
   permutation table, and at continent-silhouette scale the difference is
   invisible. Exported because any future body (a moon, an asteroid) wants the
   same generator rather than a second one that looks subtly different. */
export const NOISE_GLSL = `
float hash(vec3 p){ p = fract(p*0.3183099 + vec3(0.71,0.113,0.419));
  p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                 mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                 mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p, int oct){
  float a=0.5, s=0.0;
  for(int i=0;i<8;i++){ if(i>=oct) break; s += a*vnoise(p); p *= 2.02; a *= 0.5; }
  return s;
}`;

/* ── Earth ────────────────────────────────────────────────────────────────
   Three nested spheres, no textures anywhere: continents, ice, city lights and
   weather are all evaluated in the fragment shader.

   Returns { group, uniforms }. The caller adds the group to its own scene and
   drives uniforms.uTime, because the sortie owns its clock. uThermal is exposed
   because the IR camera regrades the whole world, Earth included.

   opts: { radius, center:Vector3, sunDir:Vector3, tilt:Euler|null } */
export function createEarth(o) {
  const earthGroup = new THREE.Group();
  earthGroup.position.copy(o.center);
  // The station sits almost directly over the pole, so an untilted sphere shows
  // the player nothing but ice cap. Tilt the body to bring mid-latitudes — where
  // the continents and city lights are — into the visible face.
  earthGroup.rotation.set(-0.92, 0, 0.28);


  const earthUniforms = {
    uSunDir  : { value: o.sunDir.clone() },
    uTime    : { value: 0 },
    uThermal : { value: 0 },
  };

  const earthMat = new THREE.ShaderMaterial({
    uniforms: earthUniforms,
    vertexShader:`
      varying vec3 vN; varying vec3 vP;
      void main(){ vN = normalize(normalMatrix * normal); vP = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader:`
      uniform vec3 uSunDir; uniform float uTime; uniform float uThermal;
      varying vec3 vN; varying vec3 vP;
      ${NOISE_GLSL}
      void main(){
        vec3 p = vP;

        // ---- continents: warped fbm, thresholded into land / sea
        float warp = fbm(p*1.7 + vec3(11.0,3.0,7.0), 4);
        float h    = fbm(p*2.35 + warp*0.55, 6);
        float land = smoothstep(0.505, 0.545, h);

        // ---- terrain colour: desert/green mix driven by a second noise field,
        //      darkening toward higher "elevation"
        float veg  = fbm(p*5.1 + 21.0, 4);
        vec3 green = vec3(0.106,0.196,0.094);
        vec3 arid  = vec3(0.286,0.223,0.129);
        vec3 soil  = mix(green, arid, smoothstep(0.42,0.62,veg));
        soil *= 0.82 + 0.35*fbm(p*13.0, 3);

        // ---- oceans: deep abyssal blue shelving to a brighter shelf near coasts
        float shelf = smoothstep(0.470, 0.508, h);
        vec3 sea = mix(vec3(0.008,0.031,0.086), vec3(0.031,0.129,0.220), shelf);

        // ---- polar ice, latitude driven, roughened so the edge is not a band.
        //      Pushed poleward so the caps stay caps instead of swallowing the disc.
        float lat = abs(p.y);
        float ice = smoothstep(0.82, 0.945, lat + fbm(p*7.0,3)*0.09);
        vec3 albedo = mix(sea, soil, land);
        albedo = mix(albedo, vec3(0.80,0.85,0.90), ice);

        // ---- lighting + terminator. The soft edge is the only place the day
        //      side bleeds into night, so it gets a warm sunrise tint.
        float ndl  = dot(normalize(vN), normalize(uSunDir));
        float day  = smoothstep(-0.13, 0.16, ndl);
        float dusk = (1.0 - abs(ndl*7.0)) ;
        dusk = clamp(dusk,0.0,1.0) * 0.5;

        // ---- specular glint off water only
        vec3 V = normalize(-vec3(0.0,0.0,-1.0));
        float spec = pow(max(dot(reflect(-normalize(uSunDir), normalize(vN)), V),0.0), 42.0);
        spec *= (1.0-land)*(1.0-ice)*day;

        // ---- night side: city lights clustered on land, flickering very slightly
        float pop = fbm(p*23.0, 4);
        float cities = smoothstep(0.585, 0.70, pop) * land * (1.0-ice);
        cities *= (1.0 - day);
        vec3 night = vec3(1.0,0.72,0.36) * cities * 1.55;

        // Exposure: the day side used to clip to flat white through ACES, which
        // erased every continent. Keep the lit term under 1.0 and let bloom do
        // the brightening instead.
        vec3 col = albedo * (day*0.92 + 0.015);
        col += vec3(1.0,0.55,0.28) * dusk * 0.30 * day;
        col += vec3(1.0,0.94,0.82) * spec * 1.7;
        col += night;

        // IR camera is tuned for near-field targets; Earth reads as a cold wash.
        col = mix(col, vec3(0.012,0.020,0.052) + col*0.10, uThermal);
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(o.radius, 160, 96), earthMat);
  earthGroup.add(earthMesh);

  // --- cloud shell: independent rotation, additive, fbm alpha
  const cloudMat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false,
    uniforms: earthUniforms,
    vertexShader:`varying vec3 vN; varying vec3 vP;
      void main(){ vN=normalize(normalMatrix*normal); vP=normalize(position);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`
      uniform vec3 uSunDir; uniform float uTime; uniform float uThermal;
      varying vec3 vN; varying vec3 vP;
      ${NOISE_GLSL}
      void main(){
        vec3 p = vP;
        // two counter-drifting layers so the weather never looks like a texture
        float c1 = fbm(p*3.1 + vec3(uTime*0.0035,0.0,0.0), 6);
        float c2 = fbm(p*6.4 - vec3(uTime*0.0021,0.0,0.0), 5);
        float c  = smoothstep(0.50,0.72, c1*0.68 + c2*0.42);
        float ndl = dot(normalize(vN), normalize(uSunDir));
        float day = smoothstep(-0.12,0.18,ndl);
        // Thinner than it was: at 0.86 the cloud shell hid the whole planet.
        float a = c * day * 0.52 * (1.0-uThermal*0.85);
        vec3 col = vec3(1.0,0.99,0.97) * (0.42 + day*0.46);
        gl_FragColor = vec4(col, a);
      }`
  });
  earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(o.radius*1.012, 128, 72), cloudMat));

  // --- atmosphere: backside shell, Fresnel-weighted. This is the limb glow that
  //     makes the planet read as a body with air rather than a painted ball.
  const atmoMat = new THREE.ShaderMaterial({
    side:THREE.BackSide, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    uniforms: earthUniforms,
    vertexShader:`varying vec3 vN; varying vec3 vW;
      void main(){ vN=normalize(normalMatrix*normal);
        vW=(modelMatrix*vec4(position,1.0)).xyz;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`
      uniform vec3 uSunDir; uniform float uThermal;
      varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        // BackSide flips the normal, so the rim is where N.V is most negative
        float rim = pow(clamp(1.0 - abs(dot(normalize(vN), V)), 0.0, 1.0), 3.1);
        float ndl = clamp(dot(normalize(-vN), normalize(uSunDir)), 0.0, 1.0);
        // Rayleigh-ish: blue dominates, warming toward the terminator
        vec3 tint = mix(vec3(0.20,0.42,1.0), vec3(1.0,0.52,0.26),
                        pow(1.0-ndl, 3.4)*0.65);
        float a = rim * (0.16 + ndl*1.25);
        gl_FragColor = vec4(tint * a * 1.5 * (1.0-uThermal*0.9), a*(1.0-uThermal*0.9));
      }`
  });
  earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(o.radius*1.055, 96, 56), atmoMat));

  if (o.tilt) earthGroup.rotation.copy(o.tilt);
  return { group: earthGroup, uniforms: earthUniforms };
}

/* ── Starfield ────────────────────────────────────────────────────────────
   Custom points so magnitude and colour temperature vary. A uniform white
   scatter reads as noise; real skies have a few bright anchors and a long faint
   tail, which is what makes rotation legible.

   Returns a Group holding the stars and the sun sprite, for the caller to add.

   uThermal is passed IN rather than owned here. The stars regrade with the IR
   camera along with everything else, so they share the Earth's uniform object.
   That coupling was invisible while both lived in one file and became a
   ReferenceError the moment they did not, which is the extraction earning its
   keep: a copy-pasted second sortie would have inherited the same hidden link.

   opts: { count, radius, sunDir, uThermal } */
export function createStarfield(o) {
  const group = new THREE.Group();
  {
    const n = o.count;
    const pos = new Float32Array(n*3), col = new Float32Array(n*3), siz = new Float32Array(n);
    for(let i=0;i<n;i++){
      // even distribution on a sphere
      const u = Math.random()*2-1, th = Math.random()*Math.PI*2, r = Math.sqrt(1-u*u);
      const d = o.radius;
      pos[i*3]=Math.cos(th)*r*d; pos[i*3+1]=u*d; pos[i*3+2]=Math.sin(th)*r*d;
      // magnitude: heavily weighted to the faint end, a few bright anchors
      const m = Math.pow(Math.random(), 3.1);
      siz[i] = 1.0 + m*4.4;
      // colour temperature from cool red dwarfs to hot blue giants
      const t = Math.random();
      const c = t<0.62 ? [1.0,0.94,0.86] : t<0.85 ? [1.0,0.80,0.62] : [0.74,0.84,1.0];
      const b = 0.35 + m*0.65;
      col[i*3]=c[0]*b; col[i*3+1]=c[1]*b; col[i*3+2]=c[2]*b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos,3));
    g.setAttribute('color',    new THREE.BufferAttribute(col,3));
    g.setAttribute('sz',       new THREE.BufferAttribute(siz,1));
    const m = new THREE.ShaderMaterial({
      uniforms:{ uThermal: o.uThermal },
      vertexShader:`attribute float sz; varying vec3 vC;
        void main(){ vC=color;
          vec4 mv = modelViewMatrix*vec4(position,1.0);
          gl_PointSize = sz; gl_Position = projectionMatrix*mv; }`,
      fragmentShader:`varying vec3 vC; uniform float uThermal;
        void main(){
          vec2 d = gl_PointCoord-0.5;
          float a = smoothstep(0.5,0.06,length(d));
          gl_FragColor = vec4(vC*a, a*(1.0-uThermal*0.92)); }`,
      vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
    });
    group.add(new THREE.Points(g,m));
  }

  // --- the sun itself: a bright additive disc that the bloom pass will bleed
  {
    // depthTest must stay ON: with it off the sun draws over the station whenever
    // the hull is between the camera and the sun direction.
    const g = new THREE.SpriteMaterial({ color:0xfff3dd, transparent:true,
      blending:THREE.AdditiveBlending, depthWrite:false, depthTest:true });
    const s = new THREE.Sprite(g);
    s.position.copy(o.sunDir).multiplyScalar(38000);
    s.scale.setScalar(2600);
    group.add(s);
  }

  return group;
}

/* ── Post chain ───────────────────────────────────────────────────────────
   Hand-written bloom: bright-pass at 1/2 res, separable gaussian at 1/2 and 1/4,
   ACES composite. Deliberately not the addons EffectComposer, so a page carries
   exactly ONE vendored dependency.

   Returns { render(scene,camera), resize(), material }. The composite's uniforms
   stay reachable through .material.uniforms because the sortie drives uThermal,
   uShake and uTime, and those are mission state rather than scene state. */
export function createPostChain(renderer) {
  /* `scene` and `camera` were free variables in the page. They are parameters of
     render() now, because a module that reaches for a global named `scene` works
     in exactly one file and silently breaks in the next. */
  const RT = (w,h)=> new THREE.WebGLRenderTarget(Math.max(2,w|0), Math.max(2,h|0), {
    minFilter:THREE.LinearFilter, magFilter:THREE.LinearFilter,
    type:THREE.HalfFloatType, depthBuffer:true });

  let sceneRT, brightRT, blurA1, blurA2, blurB1, blurB2;

  const fsScene  = new THREE.Scene();
  const fsCam    = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const fsQuad   = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null);
  fsScene.add(fsQuad);

  const brightMat = new THREE.ShaderMaterial({
    uniforms:{ tDiff:{value:null}, uThresh:{value:0.72}, uKnee:{value:0.34} },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
    fragmentShader:`
      uniform sampler2D tDiff; uniform float uThresh, uKnee; varying vec2 vUv;
      void main(){
        vec3 c = texture2D(tDiff, vUv).rgb;
        float l = dot(c, vec3(0.2126,0.7152,0.0722));
        // soft knee so bright regions ramp in rather than popping
        float s = clamp((l - uThresh + uKnee) / (2.0*uKnee), 0.0, 1.0);
        float w = max(l - uThresh, s*s*uKnee) / max(l, 1e-5);
        gl_FragColor = vec4(c*w, 1.0);
      }`
  });

  const blurMat = new THREE.ShaderMaterial({
    uniforms:{ tDiff:{value:null}, uDir:{value:new THREE.Vector2(1,0)},
               uRes:{value:new THREE.Vector2(1,1)} },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
    fragmentShader:`
      uniform sampler2D tDiff; uniform vec2 uDir, uRes; varying vec2 vUv;
      void main(){
        // 9-tap gaussian, weights from the binomial row
        float w[5]; w[0]=0.2270270270; w[1]=0.1945945946; w[2]=0.1216216216;
        w[3]=0.0540540541; w[4]=0.0162162162;
        vec2 t = uDir / uRes;
        vec3 c = texture2D(tDiff, vUv).rgb * w[0];
        for(int i=1;i<5;i++){
          c += texture2D(tDiff, vUv + t*float(i)).rgb * w[i];
          c += texture2D(tDiff, vUv - t*float(i)).rgb * w[i];
        }
        gl_FragColor = vec4(c,1.0);
      }`
  });

  const compMat = new THREE.ShaderMaterial({
    uniforms:{
      tScene:{value:null}, tB1:{value:null}, tB2:{value:null},
      uBloom:{value:0.62}, uThermal:{value:0}, uTime:{value:0},
      uShake:{value:0}, uRes:{value:new THREE.Vector2(1,1)}
    },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
    fragmentShader:`
      uniform sampler2D tScene, tB1, tB2;
      uniform float uBloom, uThermal, uTime, uShake; uniform vec2 uRes;
      varying vec2 vUv;

      // Narkowicz ACES approximation — cheap, and it keeps the sun's core from
      // clipping to a flat white disc.
      vec3 aces(vec3 x){
        const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;
        return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
      }
      void main(){
        vec2 uv = vUv;
        // hull-strike shake, applied as a UV wobble rather than a camera move so
        // it cannot desync the physics
        if(uShake > 0.001){
          uv += vec2(sin(uTime*61.0), cos(uTime*47.0)) * uShake * 0.006;
        }

        // slight chromatic aberration toward the edges — optics, not decoration
        vec2 d = (uv - 0.5);
        float r2 = dot(d,d);
        float ca = (0.0016 + uThermal*0.0026) * r2;
        vec3 col;
        col.r = texture2D(tScene, uv + d*ca).r;
        col.g = texture2D(tScene, uv).g;
        col.b = texture2D(tScene, uv - d*ca).b;

        vec3 bloom = texture2D(tB1, uv).rgb * 0.62 + texture2D(tB2, uv).rgb * 0.38;
        col += bloom * uBloom;

        col = aces(col);

        // IR grade. An earlier version collapsed this to luminance, which threw
        // away the entire false-colour ramp — every object came back grey and the
        // temperature reading was carried only by brightness. The palette IS the
        // signal here, so chroma is preserved; the sensor character comes from
        // fixed-pattern noise and a contrast lift instead.
        if(uThermal > 0.5){
          float n = fract(sin(dot(uv*uRes, vec2(12.9898,78.233)) + uTime*11.0)*43758.5453);
          col += (n - 0.5) * 0.04;                       // sensor noise
          col = clamp((col - 0.5) * 1.07 + 0.5, 0.0, 1.0); // contrast lift
        }

        // vignette
        col *= 1.0 - r2*0.62;
        // linear -> sRGB
        col = pow(max(col, 0.0), vec3(1.0/2.2));
        gl_FragColor = vec4(col, 1.0);
      }`
  });

  function sizeTargets(){
    const w = Math.floor(innerWidth * Math.min(devicePixelRatio,2));
    const h = Math.floor(innerHeight * Math.min(devicePixelRatio,2));
    [sceneRT,brightRT,blurA1,blurA2,blurB1,blurB2].forEach(t=>t&&t.dispose());
    sceneRT  = RT(w,h);
    brightRT = RT(w/2,h/2);
    blurA1   = RT(w/2,h/2);  blurA2 = RT(w/2,h/2);
    blurB1   = RT(w/4,h/4);  blurB2 = RT(w/4,h/4);
    compMat.uniforms.uRes.value.set(w,h);
  }
  sizeTargets();

  function blitPass(mat, target){
    fsQuad.material = mat;
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(fsScene, fsCam);
  }

  function renderFrame(scene, camera){
    // 1. scene -> HDR target
    renderer.setRenderTarget(sceneRT);
    renderer.clear();
    renderer.render(scene, camera);

    // 2. bright pass
    brightMat.uniforms.tDiff.value = sceneRT.texture;
    blitPass(brightMat, brightRT);

    // 3. half-res blur
    blurMat.uniforms.tDiff.value = brightRT.texture;
    blurMat.uniforms.uRes.value.set(brightRT.width, brightRT.height);
    blurMat.uniforms.uDir.value.set(1,0);  blitPass(blurMat, blurA1);
    blurMat.uniforms.tDiff.value = blurA1.texture;
    blurMat.uniforms.uDir.value.set(0,1);  blitPass(blurMat, blurA2);

    // 4. quarter-res blur, fed from the half-res result for a wider skirt
    blurMat.uniforms.tDiff.value = blurA2.texture;
    blurMat.uniforms.uRes.value.set(blurB1.width, blurB1.height);
    blurMat.uniforms.uDir.value.set(1,0);  blitPass(blurMat, blurB1);
    blurMat.uniforms.tDiff.value = blurB1.texture;
    blurMat.uniforms.uDir.value.set(0,1);  blitPass(blurMat, blurB2);

    // 5. composite to screen
    compMat.uniforms.tScene.value = sceneRT.texture;
    compMat.uniforms.tB1.value    = blurA2.texture;
    compMat.uniforms.tB2.value    = blurB2.texture;
    fsQuad.material = compMat;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(fsScene, fsCam);
  }

  return { render: renderFrame, resize: sizeTargets, material: compMat };
}
