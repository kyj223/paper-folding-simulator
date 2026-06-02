import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SolidInfo } from "../types/solid";

type ThreeViewportProps = {
  solidInfo: SolidInfo | null;
};

const normalizeSolidSize = (solidInfo: SolidInfo) => {
  const maxSize = Math.max(solidInfo.width, solidInfo.height, solidInfo.depth);
  const scale = maxSize > 0 ? 2.0 / maxSize : 1;

  return {
    width: solidInfo.width * scale,
    height: solidInfo.height * scale,
    depth: solidInfo.depth * scale,
  };
};

function ThreeViewport({ solidInfo }: ThreeViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const autoRotateRef = useRef(true);
  const previousMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !solidInfo) return;

    container.innerHTML = "";

    const size = normalizeSolidSize(solidInfo);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ffffff");

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 4, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(3, 4, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);

    const material = new THREE.MeshStandardMaterial({
      color: "#93c5fd",
      roughness: 0.45,
      metalness: 0.05,
    });

    const box = new THREE.Mesh(geometry, material);
    group.add(box);

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: "#1d4ed8" })
    );
    group.add(line);

    const handlePointerDown = (event: PointerEvent) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;

      previousMouseRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const dx = event.clientX - previousMouseRef.current.x;
      const dy = event.clientY - previousMouseRef.current.y;

      group.rotation.y += dx * 0.01;
      group.rotation.x += dy * 0.01;

      previousMouseRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handlePointerUp = (event: PointerEvent) => {
      isDraggingRef.current = false;

      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerUp);

    let animationFrameId = 0;

    const animate = () => {
      if (autoRotateRef.current) {
        group.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(nextWidth, nextHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerUp);

      renderer.dispose();
      geometry.dispose();
      material.dispose();
      edges.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [solidInfo]);

  return (
    <section className="panel panel-3d">
      <div className="panel-header">
        <h2>3D 시뮬레이션 영역</h2>
        <span>
          {solidInfo
            ? `${solidInfo.type} · ${solidInfo.width.toFixed(
                2
              )} × ${solidInfo.height.toFixed(2)} × ${solidInfo.depth.toFixed(
                2
              )}`
            : "대기중"}
        </span>
      </div>

      <div ref={containerRef} className="three-canvas">
        {!solidInfo && (
          <div className="three-placeholder">
            전개도 검증 통과 후 실제 치수 기반 3D 모델이 표시됩니다.
          </div>
        )}
      </div>
    </section>
  );
}

export default ThreeViewport;