import { useEffect, useState } from"react";
import { Warp } from"@paper-design/shaders-react";

const WARP_COLORS = ["hsl(168, 84%, 18%)","hsl(160, 84%, 72%)","hsl(172, 76%, 28%)","hsl(166, 100%, 82%)",
];

function WarpShaderBackground() {
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
 speed={1}
 colors={WARP_COLORS}
 />
 );
}

export default function WarpShaderHero({ children }) {
 return (
 <section className="home-hero relative overflow-hidden">
 <div className="home-hero-shader absolute inset-0"aria-hidden="true">
 <WarpShaderBackground />
 </div>

 <div className="home-hero-overlay"aria-hidden="true"/>

 <div className="home-hero-inner relative z-10">{children}</div>
 </section>
 );
}
