import { useEffect, useRef, useState } from"react";
import { Warp } from"@paper-design/shaders-react";

const WARP_COLORS = ["hsl(168, 84%, 18%)","hsl(160, 84%, 72%)","hsl(172, 76%, 28%)","hsl(166, 100%, 82%)",
];

// The hero sits under a dark overlay at 45% opacity, so rendering the shader at
// device resolution is wasted GPU work. 1x with a pixel cap looks identical.
const SHADER_MAX_PIXELS = 1280 * 720;

function WarpShaderBackground({ paused }) {
 const [reducedMotion, setReducedMotion] = useState(false);

 useEffect(() => {
 const media = window.matchMedia("(prefers-reduced-motion: reduce)");
 setReducedMotion(media.matches);
 const onChange = (event) => setReducedMotion(event.matches);
 media.addEventListener("change", onChange);
 return () => media.removeEventListener("change", onChange);
 }, []);

 if (reducedMotion) {
 return <div className="home-hero-warp-fallback"aria-hidden="true"/>;
 }

 return (
 <Warp
 className="home-hero-warp"style={{ height:"100%", width:"100%"}}
 proportion={0.45}
 softness={1}
 distortion={0.25}
 swirl={0.8}
 swirlIterations={10}
 shape="checks"shapeScale={0.1}
 scale={1}
 rotation={0}
 speed={paused ? 0 : 1}
 minPixelRatio={1}
 maxPixelCount={SHADER_MAX_PIXELS}
 colors={WARP_COLORS}
 />
 );
}

export default function WarpShaderHero({ children }) {
 const sectionRef = useRef(null);
 const [inView, setInView] = useState(true);

 // Stop the shader's render loop while the hero is off-screen so it doesn't
 // compete with scrolling for GPU/main-thread time.
 useEffect(() => {
 const node = sectionRef.current;
 if (!node) return undefined;
 const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
 observer.observe(node);
 return () => observer.disconnect();
 }, []);

 return (
 <section ref={sectionRef} className="home-hero relative overflow-hidden">
 <div className="home-hero-shader absolute inset-0"aria-hidden="true">
 <WarpShaderBackground paused={!inView} />
 </div>

 <div className="home-hero-overlay"aria-hidden="true"/>

 <div className="home-hero-inner relative z-10">{children}</div>
 </section>
 );
}
