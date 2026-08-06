"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type PracticeGlassSceneProps = {
  activeIndex: number | null;
  burstingIndex: number | null;
};

type BubbleUniforms = {
  pointer: { value: THREE.Vector2 };
  time: { value: number };
  strength: { value: number };
  burstProgress: { value: number };
  burstOrigin: { value: THREE.Vector2 };
};

type CrystalRig = {
  group: THREE.Group;
  mesh: THREE.Mesh;
  rim: THREE.Mesh;
  material: THREE.MeshPhysicalMaterial;
  rimMaterial: THREE.ShaderMaterial;
  droplets: THREE.Group;
  dropletMeshes: THREE.Mesh[];
  dropletMaterial: THREE.MeshPhysicalMaterial;
  specimenLine: THREE.Line;
  specimenMaterial: THREE.LineBasicMaterial;
  shadow: THREE.Sprite | null;
  deform: BubbleUniforms;
  tint: THREE.Color;
  base: THREE.Vector3;
  phase: number;
  burstStart: number | null;
};

const TINTS = [0xa7b4d8, 0xc2b7d5, 0xd9b8c1];
const CLEAR_GLASS = new THREE.Color(0xf8fbff);

function makeCrystalGeometry(index: number) {
  const geometry = new THREE.SphereGeometry(1, 32, 24);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    const direction = vertex.clone().normalize();
    const ripple =
      Math.sin(direction.x * (3.1 + index * 0.22) + direction.y * 2.7 + index) * 0.035 +
      Math.cos(direction.z * 4.2 - direction.y * 1.8 + index * 0.7) * 0.022;
    vertex.multiplyScalar(1 + ripple);
    vertex.x *= [0.98, 1.04, 1][index];
    vertex.y *= [1.05, 0.98, 1.03][index];
    vertex.z *= [0.64, 0.72, 0.66][index];
    vertex.x += direction.y * [0.025, -0.02, 0.018][index];
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.center();
  return geometry;
}

function addBubbleDeformation(material: THREE.MeshPhysicalMaterial): BubbleUniforms {
  const deform: BubbleUniforms = {
    pointer: { value: new THREE.Vector2() },
    time: { value: 0 },
    strength: { value: 0 },
    burstProgress: { value: 0 },
    burstOrigin: { value: new THREE.Vector2() },
  };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.bubblePointer = deform.pointer;
    shader.uniforms.bubbleTime = deform.time;
    shader.uniforms.bubbleStrength = deform.strength;
    shader.uniforms.bubbleBurstProgress = deform.burstProgress;
    shader.uniforms.bubbleBurstOrigin = deform.burstOrigin;
    shader.vertexShader = [
      "uniform vec2 bubblePointer;",
      "uniform float bubbleTime;",
      "uniform float bubbleStrength;",
      "uniform float bubbleBurstProgress;",
      "uniform vec2 bubbleBurstOrigin;",
      "varying vec3 vBubbleLocalPosition;",
      shader.vertexShader,
    ].join("\n").replace(
      "#include <begin_vertex>",
      [
        "vec3 transformed = vec3(position);",
        "float bubbleWave = sin(position.y * 3.2 + bubbleTime * 1.35) * cos(position.x * 2.8 - bubbleTime * 1.05) * 0.028;",
        "transformed += normal * bubbleWave;",
        "vec2 bubbleDirection = normalize(bubblePointer + vec2(0.0001));",
        "float directional = max(dot(normal.xy, bubbleDirection), 0.0);",
        "vec2 pull = bubblePointer * (0.09 + directional * 0.12) * bubbleStrength;",
        "transformed.xy += pull;",
        "transformed.x *= 1.0 + abs(bubblePointer.x) * 0.08 * bubbleStrength;",
        "transformed.y *= 1.0 + abs(bubblePointer.y) * 0.08 * bubbleStrength;",
        "transformed.z *= 1.0 - length(bubblePointer) * 0.045 * bubbleStrength;",
        "float dentDistance = distance(transformed.xy, bubbleBurstOrigin);",
        "float dentPhase = sin(min(bubbleBurstProgress / 0.14, 1.0) * 3.14159265) * (1.0 - smoothstep(0.14, 0.28, bubbleBurstProgress));",
        "float bubbleCollapse = smoothstep(0.16, 0.82, bubbleBurstProgress);",
        "transformed.z -= exp(-dentDistance * dentDistance * 6.2) * dentPhase * 0.16;",
        "transformed.xy = mix(transformed.xy, bubbleBurstOrigin * 0.28, bubbleCollapse * 0.38);",
        "transformed.z *= 1.0 - bubbleCollapse * 0.18;",
        "vBubbleLocalPosition = transformed;",
      ].join("\n"),
    );
    shader.fragmentShader = [
      "varying vec3 vBubbleLocalPosition;",
      shader.fragmentShader,
    ].join("\n").replace(
      "#include <opaque_fragment>",
      [
        "#include <opaque_fragment>",
        "float bubbleCenterClearance = smoothstep(0.04, 0.13, length(vBubbleLocalPosition.xy));",
        "gl_FragColor.a *= bubbleCenterClearance;",
      ].join("\n"),
    );
  };
  material.customProgramCacheKey = () => "wordoria-bubble-v4";
  return deform;
}

function smoothstep(min: number, max: number, value: number) {
  const amount = THREE.MathUtils.clamp((value - min) / Math.max(max - min, 0.0001), 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function makeMicroDroplets(tint: THREE.Color) {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(1, 16, 12);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.015,
    metalness: 0,
    transmission: 0.99,
    thickness: 0.08,
    ior: 1.33,
    iridescence: 0.22,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [90, 320],
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    attenuationColor: tint.clone().lerp(CLEAR_GLASS, 0.78),
    attenuationDistance: 10,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const meshes = Array.from({ length: 4 }, () => {
    const droplet = new THREE.Mesh(geometry, material);
    droplet.visible = false;
    group.add(droplet);
    return droplet;
  });
  group.position.z = 0.42;
  return { group, meshes, material };
}

function updateMicroDroplets(rig: CrystalRig, progress: number) {
  const visible = progress > 0.3 && progress < 0.94;
  const travel = smoothstep(0.28, 0.88, progress);
  const fade = smoothstep(0.3, 0.4, progress) * (1 - smoothstep(0.68, 0.94, progress));
  const origin = rig.deform.burstOrigin.value;
  const baseAngle = origin.lengthSq() > 0.008 ? Math.atan2(origin.y, origin.x) : rig.phase;
  const offsets = [-0.62, -0.18, 0.24, 0.68];

  rig.dropletMaterial.opacity = fade * 0.56;
  rig.dropletMeshes.forEach((droplet, index) => {
    const angle = baseAngle + offsets[index];
    const radial = new THREE.Vector2(Math.cos(angle), Math.sin(angle));
    const tangent = new THREE.Vector2(-radial.y, radial.x);
    const startRadius = 1.02 + index * 0.025;
    const distance = (0.22 + index * 0.085) * travel;
    const tangentDrift = (index - 1.5) * 0.038 * travel;
    droplet.position.set(
      radial.x * (startRadius + distance) + tangent.x * tangentDrift,
      radial.y * (startRadius + distance) + tangent.y * tangentDrift - travel * travel * 0.045,
      0.06 + Math.sin(index * 1.7) * 0.025,
    );
    const length = (0.075 + index * 0.012) * (0.72 + fade * 0.28);
    const width = 0.024 + index * 0.004;
    droplet.scale.set(length, width, width * 0.8);
    droplet.rotation.z = angle;
    droplet.visible = visible;
  });
}
function makeShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, "rgba(21, 20, 28, 0.26)");
  gradient.addColorStop(0.45, "rgba(71, 58, 110, 0.12)");
  gradient.addColorStop(1, "rgba(21, 20, 28, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function PracticeGlassScene({
  activeIndex,
  burstingIndex,
}: PracticeGlassSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number | null>(activeIndex);
  const burstingRef = useRef<number | null>(burstingIndex);

  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    burstingRef.current = burstingIndex;
  }, [burstingIndex]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      mount.dataset.glassFallback = "true";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = "practice-glass-canvas";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, 0.1, 40);
    camera.position.set(0, 0, 12);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const environmentTarget = pmrem.fromScene(environment, 0.035);
    scene.environment = environmentTarget.texture;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x77738a, 1.55));

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(-2.5, 4.5, 7);
    scene.add(keyLight);

    const blueLight = new THREE.PointLight(0x708be0, 11, 14, 1.8);
    blueLight.position.set(-4.2, 1.6, 4.2);
    scene.add(blueLight);

    const pinkLight = new THREE.PointLight(0xe7a2ba, 9, 13, 1.8);
    pinkLight.position.set(3.8, -1.1, 4.5);
    scene.add(pinkLight);

    const acidLight = new THREE.PointLight(0xe5e4b4, 6, 12, 1.7);
    acidLight.position.set(0.4, 4.4, 2.4);
    scene.add(acidLight);

    const shadowTexture = makeShadowTexture();
    const rigs: CrystalRig[] = [];

    for (let index = 0; index < 3; index += 1) {
      const geometry = makeCrystalGeometry(index);
      const tint = new THREE.Color(TINTS[index]);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.012,
        metalness: 0,
        transmission: 0.985,
        thickness: [0.24, 0.3, 0.26][index],
        ior: 1.33,
        dispersion: 0.01,
        iridescence: 0.1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [90, 560],
        clearcoat: 1,
        clearcoatRoughness: 0.018,
        specularIntensity: 1,
        envMapIntensity: 1.38,
        attenuationColor: 0xf8fbff,
        attenuationDistance: 18,
        transparent: true,
        opacity: 0.15,
      });
      const deform = addBubbleDeformation(material);

      const mesh = new THREE.Mesh(geometry, material);
      const rimMaterial = new THREE.ShaderMaterial({
        uniforms: {
          rimColor: { value: new THREE.Color(0xf8fbff) },
          rimStrength: { value: 0.12 },
          chromatic: { value: 0.08 },
          bubblePointer: deform.pointer,
          bubbleTime: deform.time,
          bubbleStrength: deform.strength,
          bubbleBurstProgress: deform.burstProgress,
          bubbleBurstOrigin: deform.burstOrigin,
        },
        vertexShader: [
          "uniform vec2 bubblePointer;",
          "uniform float bubbleTime;",
          "uniform float bubbleStrength;",
          "uniform float bubbleBurstProgress;",
          "uniform vec2 bubbleBurstOrigin;",
          "varying vec3 vNormal;",
          "varying vec3 vViewDirection;",
          "varying vec3 vBubbleLocalPosition;",
          "void main() {",
          "  vec3 bubblePosition = position;",
          "  float bubbleWave = sin(position.y * 3.2 + bubbleTime * 1.35) * cos(position.x * 2.8 - bubbleTime * 1.05) * 0.028;",
          "  bubblePosition += normal * bubbleWave;",
          "  vec2 bubbleDirection = normalize(bubblePointer + vec2(0.0001));",
          "  float directional = max(dot(normal.xy, bubbleDirection), 0.0);",
          "  vec2 pull = bubblePointer * (0.09 + directional * 0.12) * bubbleStrength;",
          "  bubblePosition.xy += pull;",
          "  bubblePosition.x *= 1.0 + abs(bubblePointer.x) * 0.08 * bubbleStrength;",
          "  bubblePosition.y *= 1.0 + abs(bubblePointer.y) * 0.08 * bubbleStrength;",
          "  bubblePosition.z *= 1.0 - length(bubblePointer) * 0.045 * bubbleStrength;",
          "  float dentDistance = distance(bubblePosition.xy, bubbleBurstOrigin);",
          "  float dentPhase = sin(min(bubbleBurstProgress / 0.14, 1.0) * 3.14159265) * (1.0 - smoothstep(0.14, 0.28, bubbleBurstProgress));",
          "  float bubbleCollapse = smoothstep(0.16, 0.82, bubbleBurstProgress);",
          "  bubblePosition.z -= exp(-dentDistance * dentDistance * 6.2) * dentPhase * 0.16;",
          "  bubblePosition.xy = mix(bubblePosition.xy, bubbleBurstOrigin * 0.28, bubbleCollapse * 0.38);",
          "  bubblePosition.z *= 1.0 - bubbleCollapse * 0.18;",
          "  vBubbleLocalPosition = bubblePosition;",
          "  vec4 mvPosition = modelViewMatrix * vec4(bubblePosition, 1.0);",
          "  vNormal = normalize(normalMatrix * normal);",
          "  vViewDirection = normalize(-mvPosition.xyz);",
          "  gl_Position = projectionMatrix * mvPosition;",
          "}",
        ].join("\n"),
        fragmentShader: [
          "uniform vec3 rimColor;",
          "uniform float rimStrength;",
          "uniform float chromatic;",
          "uniform float bubbleTime;",
          "uniform float bubbleBurstProgress;",
          "uniform vec2 bubbleBurstOrigin;",
          "varying vec3 vNormal;",
          "varying vec3 vViewDirection;",
          "varying vec3 vBubbleLocalPosition;",
          "void main() {",
          "  vec2 impactVector = vBubbleLocalPosition.xy - bubbleBurstOrigin;",
          "  float impactDistance = length(impactVector);",
          "  float impactAngle = atan(impactVector.y, impactVector.x);",
          "  float impactRadius = mix(0.04, 0.46, smoothstep(0.02, 0.58, bubbleBurstProgress));",
          "  float impactEdge = (1.0 - smoothstep(0.0, 0.055, abs(impactDistance - impactRadius))) * (1.0 - smoothstep(0.42, 0.72, bubbleBurstProgress));",
          "  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0), 2.8);",
          "  float phase = impactAngle * 0.08 + vNormal.y * 0.28;",
          "  vec3 spectrum = 0.66 + 0.34 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));",
          "  vec3 opticalColor = mix(rimColor, spectrum, max(chromatic, impactEdge * 0.72));",
          "  float shellFade = 1.0 - smoothstep(0.2, 0.78, bubbleBurstProgress);",
          "  float alpha = fresnel * rimStrength * shellFade + impactEdge * 0.42;",
          "  alpha *= smoothstep(0.14, 0.3, length(vBubbleLocalPosition.xy));",
          "  gl_FragColor = vec4(opticalColor, alpha);",
          "}",
        ].join("\n"),
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        side: THREE.FrontSide,
      });
      const rim = new THREE.Mesh(geometry.clone(), rimMaterial);
      rim.scale.setScalar(1.012);
      const microDroplets = makeMicroDroplets(tint);

      const specimenMaterial = new THREE.LineBasicMaterial({
        color: 0x706c76,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      });
      const specimenLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.62, 0, 0),
          new THREE.Vector3(0.62, 0, 0),
        ]),
        specimenMaterial,
      );
      specimenLine.position.z = -0.72;
      specimenLine.rotation.z = [-0.08, 0.055, -0.035][index];

      const group = new THREE.Group();
      group.add(specimenLine, mesh, rim, microDroplets.group);
      group.rotation.set(0.24 - index * 0.12, -0.42 + index * 0.34, 0.08 - index * 0.07);

      let shadow: THREE.Sprite | null = null;
      if (shadowTexture) {
        shadow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.12,
            depthWrite: false,
          }),
        );
        shadow.position.set(0, -1.42, -1.2);
        shadow.scale.set(2.5, 0.5, 1);
        group.add(shadow);
      }

      scene.add(group);
      rigs.push({
        group,
        mesh,
        rim,
        material,
        rimMaterial,
        droplets: microDroplets.group,
        dropletMeshes: microDroplets.meshes,
        dropletMaterial: microDroplets.material,
        specimenLine,
        specimenMaterial,
        shadow,
        deform,
        tint,
        base: new THREE.Vector3(),
        phase: index * 2.05,
        burstStart: null,
      });
    }

    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();
    const ambientPointer = new THREE.Vector2();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let mobileLayout = false;
    let animationFrame = 0;
    let frameCount = 0;
    let lastTime = performance.now();

    const placeScene = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      const mobile = width <= 720;
      mobileLayout = mobile;

      renderer.setSize(width, height, false);

      if (mobile) {
        camera.left = -2.25;
        camera.right = 2.25;
        camera.top = 5.25;
        camera.bottom = -5.25;
        rigs.forEach((rig, index) => {
          rig.base.set(0, 3.45 - index * 3.45, 0);
        });
      } else {
        camera.left = -5.3;
        camera.right = 5.3;
        camera.top = 3.05;
        camera.bottom = -3.05;
        rigs.forEach((rig, index) => {
          rig.base.set(-3.55 + index * 3.55, 0.34, 0);
        });
      }

      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        targetPointer.set(0, 0);
        return;
      }

      const activeTrack =
        activeRef.current === null
          ? null
          : mount.parentElement?.querySelector<HTMLElement>(
              `[data-glass-track="${activeRef.current}"]`,
            );
      const pointerBounds = activeTrack?.getBoundingClientRect() ?? bounds;
      targetPointer.set(
        THREE.MathUtils.clamp(
          (event.clientX - (pointerBounds.left + pointerBounds.width * 0.5)) /
            Math.max(pointerBounds.width * 0.5, 1),
          -1,
          1,
        ),
        THREE.MathUtils.clamp(
          -(event.clientY - (pointerBounds.top + pointerBounds.height * 0.5)) /
            Math.max(pointerBounds.height * 0.5, 1),
          -1,
          1,
        ),
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { rootMargin: "160px" },
    );
    observer.observe(mount);

    const resizeObserver = new ResizeObserver(placeScene);
    resizeObserver.observe(mount);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    placeScene();

    const animate = (time: number) => {
      animationFrame = requestAnimationFrame(animate);
      if (!visible || document.hidden) {
        lastTime = time;
        return;
      }

      const delta = Math.min((time - lastTime) / 1000, 0.05);
      const elapsed = time * 0.001;
      lastTime = time;
      pointer.lerp(targetPointer, 0.055);

      const visualActiveIndex =
        activeRef.current ?? (mobileLayout ? Math.floor(elapsed / 3.6) % rigs.length : null);

      rigs.forEach((rig, index) => {
        const selected = visualActiveIndex === index;
        const idle = visualActiveIndex === null;
        const bursting = burstingRef.current === index;

        if (bursting && rig.burstStart === null) {
          rig.burstStart = elapsed;
          rig.deform.burstOrigin.value.copy(rig.deform.pointer.value).multiplyScalar(0.42);
        } else if (!bursting && rig.burstStart !== null) {
          rig.burstStart = null;
          rig.deform.burstProgress.value = 0;
          rig.mesh.scale.setScalar(1);
          rig.rim.scale.setScalar(1.012);
          rig.dropletMaterial.opacity = 0;
          rig.dropletMeshes.forEach((droplet) => { droplet.visible = false; });
        }

        const burstProgress =
          rig.burstStart === null
            ? 0
            : THREE.MathUtils.clamp((elapsed - rig.burstStart) / 0.44, 0, 1);
        rig.deform.burstProgress.value = burstProgress;
        const targetScale = bursting ? 1.12 : selected ? 1.12 : idle ? 1 : 0.94;
        const scaleStep = 1 - Math.pow(0.0008, delta);
        const nextScale = THREE.MathUtils.lerp(rig.group.scale.x, targetScale, scaleStep);
        rig.group.scale.setScalar(nextScale);

        rig.group.position.x = rig.base.x;
        rig.group.position.y =
          rig.base.y + (reducedMotion ? 0 : Math.sin(elapsed * 0.72 + rig.phase) * 0.09);
        rig.group.position.z = selected || bursting ? 0.55 : 0;

        if (bursting) {
          const tension =
            Math.sin(Math.min(burstProgress / 0.16, 1) * Math.PI) * 0.045;
          const release = smoothstep(0.16, 0.82, burstProgress);
          rig.mesh.scale.set(
            (1 + tension) * (1 - release * 0.26),
            (1 - tension * 0.28) * (1 - release * 0.2),
            (1 - tension * 0.18) * (1 - release * 0.3),
          );
          rig.rim.scale.set(
            (1.012 + tension * 0.7) * (1 - release * 0.26),
            (1.012 - tension * 0.2) * (1 - release * 0.2),
            (1.012 - tension * 0.12) * (1 - release * 0.3),
          );
          updateMicroDroplets(rig, burstProgress);
          rig.specimenLine.scale.x = 1 - release;
          rig.specimenMaterial.opacity = 0.16 * (1 - release);
          if (rig.shadow) rig.shadow.material.opacity = 0.12 * (1 - release);
          mount.dataset.bubbleBurst = index + ":" + burstProgress.toFixed(3);
        } else {
          rig.mesh.scale.setScalar(
            THREE.MathUtils.lerp(rig.mesh.scale.x, 1, 0.12),
          );
          rig.rim.scale.setScalar(
            THREE.MathUtils.lerp(rig.rim.scale.x, 1.012, 0.12),
          );
          rig.specimenLine.scale.x = THREE.MathUtils.lerp(rig.specimenLine.scale.x, 1, 0.12);
          rig.specimenMaterial.opacity = THREE.MathUtils.lerp(
            rig.specimenMaterial.opacity,
            0.16,
            0.1,
          );
          rig.dropletMaterial.opacity = THREE.MathUtils.lerp(
            rig.dropletMaterial.opacity,
            0,
            0.22,
          );
          if (rig.dropletMaterial.opacity < 0.01) {
            rig.dropletMeshes.forEach((droplet) => { droplet.visible = false; });
          }
          if (rig.shadow) {
            rig.shadow.material.opacity = THREE.MathUtils.lerp(
              rig.shadow.material.opacity,
              0.12,
              0.08,
            );
          }
        }

        if (mobileLayout && activeRef.current === null) {
          ambientPointer
            .set(
              Math.sin(elapsed * 0.55 + rig.phase),
              Math.cos(elapsed * 0.47 + rig.phase),
            )
            .multiplyScalar(reducedMotion ? 0 : 0.32);
          rig.deform.pointer.value.lerp(ambientPointer, 0.045);
        } else {
          rig.deform.pointer.value.lerp(pointer, selected ? 0.12 : 0.07);
        }
        rig.deform.time.value = reducedMotion ? rig.phase : elapsed + rig.phase;
        rig.deform.strength.value = THREE.MathUtils.lerp(
          rig.deform.strength.value,
          selected ? 1 : idle ? 0.32 : 0.18,
          0.06,
        );

        const pointerWeight = selected ? 0.14 : 0.05;
        rig.group.rotation.x +=
          ((0.2 - index * 0.08 + pointer.y * pointerWeight) - rig.group.rotation.x) * 0.045;
        rig.group.rotation.y +=
          ((-0.34 + index * 0.28 + pointer.x * pointerWeight) - rig.group.rotation.y) * 0.045;
        if (!reducedMotion) rig.group.rotation.z += delta * (0.028 + index * 0.006);

        rig.material.dispersion = THREE.MathUtils.lerp(
          rig.material.dispersion,
          selected ? 0.09 : 0.01,
          0.055,
        );
        rig.material.roughness = THREE.MathUtils.lerp(
          rig.material.roughness,
          selected ? 0.004 : 0.012,
          0.055,
        );
        const bodyOpacity = bursting
          ? 0.26 * (1 - smoothstep(0.18, 0.78, burstProgress))
          : selected ? 0.26 : 0.15;
        rig.material.opacity = THREE.MathUtils.lerp(
          rig.material.opacity,
          bodyOpacity,
          0.07,
        );
        rig.material.iridescence = THREE.MathUtils.lerp(
          rig.material.iridescence,
          selected ? 0.48 : 0.1,
          0.05,
        );
        rig.material.attenuationColor.lerp(
          selected ? rig.tint : CLEAR_GLASS,
          0.045,
        );
        rig.rimMaterial.uniforms.rimColor.value.lerp(
          selected ? rig.tint : CLEAR_GLASS,
          0.05,
        );
        rig.rimMaterial.uniforms.chromatic.value = THREE.MathUtils.lerp(
          rig.rimMaterial.uniforms.chromatic.value,
          selected ? 0.64 : 0.08,
          0.055,
        );
        const rimStrength = bursting
          ? 0.3 * (1 - smoothstep(0.28, 0.78, burstProgress))
          : selected
            ? 0.34
            : 0.12;
        rig.rimMaterial.uniforms.rimStrength.value = THREE.MathUtils.lerp(
          rig.rimMaterial.uniforms.rimStrength.value,
          rimStrength,
          bursting ? 0.16 : 0.055,
        );
      });

      if (burstingRef.current === null) delete mount.dataset.bubbleBurst;
      renderer.render(scene, camera);
      frameCount += 1;
      if (frameCount === 1) mount.dataset.glassReady = "true";
      if (frameCount % 30 === 0) {
        mount.dataset.glassFrames = String(frameCount);
        const inspectedRig = rigs[visualActiveIndex ?? 0];
        mount.dataset.bubblePointer = [
          inspectedRig.deform.pointer.value.x.toFixed(3),
          inspectedRig.deform.pointer.value.y.toFixed(3),
        ].join(",");
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      rigs.forEach((rig) => {
        rig.group.traverse((child) => {
          if (
            child instanceof THREE.Mesh ||
            child instanceof THREE.Line
          ) {
            child.geometry.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => material.dispose());
          }
          if (child instanceof THREE.Sprite) child.material.dispose();
        });
      });
      shadowTexture?.dispose();
      environmentTarget.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="practice-glass-scene" ref={mountRef} aria-hidden="true" />;
}

