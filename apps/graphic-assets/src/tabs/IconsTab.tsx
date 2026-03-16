import { AssetCard } from '../components/AssetCard';
import IconMemory1  from '../assets/icons/IconMemory1';
import IconMemory2  from '../assets/icons/IconMemory2';
import IconMemory3  from '../assets/icons/IconMemory3';
import IconTrace1   from '../assets/icons/IconTrace1';
import IconTrace2   from '../assets/icons/IconTrace2';
import IconTrace3   from '../assets/icons/IconTrace3';
import IconProgram1 from '../assets/icons/IconProgram1';
import IconProgram2 from '../assets/icons/IconProgram2';
import IconProgram3 from '../assets/icons/IconProgram3';
import IconCmCube     from '../assets/icons/IconCmCube';
import IconCmTriangle from '../assets/icons/IconCmTriangle';
import IconCmDiamond  from '../assets/icons/IconCmDiamond';
import IconCmNested   from '../assets/icons/IconCmNested';
import IconCmStar     from '../assets/icons/IconCmStar';
import IconCmChevron  from '../assets/icons/IconCmChevron';
import IconCmOrbit    from '../assets/icons/IconCmOrbit';
import IconCmCross    from '../assets/icons/IconCmCross';
import IconCmSpiral   from '../assets/icons/IconCmSpiral';
import IconCmBolt     from '../assets/icons/IconCmBolt';

const GAME_ICONS = [
    {
        group: 'MEMORY',
        icons: [
            { label: 'Memory — RAM Module',    description: 'Stick · chips · edge connector pins', filename: 'icon-memory-ram.svg',    Component: IconMemory1 },
            { label: 'Memory — IC Chip',        description: 'Square die · side pins · cross',       filename: 'icon-memory-chip.svg',   Component: IconMemory2 },
            { label: 'Memory — Data Layers',    description: 'Three stacked slabs · bus lines',      filename: 'icon-memory-layers.svg', Component: IconMemory3 },
        ],
    },
    {
        group: 'TRACE',
        icons: [
            { label: 'Trace — Radar Sweep',      description: 'Concentric rings · sweep · ping',    filename: 'icon-trace-radar.svg',    Component: IconTrace1 },
            { label: 'Trace — PCB Route',         description: 'Z-trace · solder nodes',             filename: 'icon-trace-pcb.svg',      Component: IconTrace2 },
            { label: 'Trace — Targeting Reticle', description: 'Corner brackets · crosshair · pip', filename: 'icon-trace-reticle.svg',  Component: IconTrace3 },
        ],
    },
    {
        group: 'PROGRAM',
        icons: [
            { label: 'Program — Terminal',    description: 'Screen · chevron prompt · cursor',   filename: 'icon-program-terminal.svg', Component: IconProgram1 },
            { label: 'Program — Code File',   description: 'Folded doc · indented code lines',   filename: 'icon-program-file.svg',     Component: IconProgram2 },
            { label: 'Program — Executable',  description: 'IC body · play triangle inside',     filename: 'icon-program-exe.svg',      Component: IconProgram3 },
        ],
    },
];

const COUNTERMEASURE_ICONS = [
    { label: 'Isometric Cube',   description: 'Hex outline + inner edges + vertex dots',    filename: 'icon-cm-cube.svg',     Component: IconCmCube     },
    { label: 'Node Triangle',    description: 'Equilateral triangle + circle vertices',      filename: 'icon-cm-triangle.svg', Component: IconCmTriangle },
    { label: 'Node Diamond',     description: 'Rotated square + circle vertices',            filename: 'icon-cm-diamond.svg',  Component: IconCmDiamond  },
    { label: 'Nested Squares',   description: 'Three concentric square frames',              filename: 'icon-cm-nested.svg',   Component: IconCmNested   },
    { label: 'Six-Arm Star',     description: 'Asterisk · 6 arms at 60° · dot tips',        filename: 'icon-cm-star.svg',     Component: IconCmStar     },
    { label: 'Triple Chevrons',  description: 'Three stacked right-facing chevrons',         filename: 'icon-cm-chevron.svg',  Component: IconCmChevron  },
    { label: 'Triple Orbit',     description: 'Three ellipses at 60° + center dot',          filename: 'icon-cm-orbit.svg',    Component: IconCmOrbit    },
    { label: 'Cross',            description: 'Plus polygon + terminal dots at arm ends',    filename: 'icon-cm-cross.svg',    Component: IconCmCross    },
    { label: 'Rectangular Spiral', description: 'Inward-winding angular path · 3 turns',   filename: 'icon-cm-spiral.svg',   Component: IconCmSpiral   },
    { label: 'Hex Bolt',         description: 'Hexagon frame + lightning bolt inside',       filename: 'icon-cm-bolt.svg',     Component: IconCmBolt     },
];

const PREVIEW_SIZE = 64;
const GREEN = '#22c55e';

const sectionLabel: React.CSSProperties = {
    fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.2em',
    color: '#3f5a3f', marginBottom: '14px',
    borderLeft: '2px solid #22c55e33', paddingLeft: '10px',
};

export function IconsTab() {
    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.12em', marginBottom: '6px' }}>
                    ICON LIBRARY
                </h2>
                <p style={{ fontSize: '12px', color: '#52525b', fontFamily: 'monospace', lineHeight: 1.6 }}>
                    Game-resource icons in Lucide style · Countermeasure icons are abstract cyberpunk shapes ·
                    All 24×24 SVG.
                </p>
            </div>

            {/* Game resource groups */}
            {GAME_ICONS.map(({ group, icons }) => (
                <div key={group} style={{ marginBottom: '40px' }}>
                    <div style={sectionLabel}>{group}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                        {icons.map(({ label, description, filename, Component }) => (
                            <AssetCard key={label} label={label} description={description} filename={filename}>
                                {(ref) => (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ color: GREEN }}>
                                            {/* @ts-expect-error – width/height override for preview */}
                                            <Component ref={ref} width={PREVIEW_SIZE} height={PREVIEW_SIZE} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ color: GREEN }}><Component /></div>
                                            <span style={{ fontSize: '10px', color: '#3f3f46', fontFamily: 'monospace' }}>actual 24px</span>
                                        </div>
                                    </div>
                                )}
                            </AssetCard>
                        ))}
                    </div>
                </div>
            ))}

            {/* Countermeasures */}
            <div>
                <div style={sectionLabel}>COUNTERMEASURES</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {COUNTERMEASURE_ICONS.map(({ label, description, filename, Component }) => (
                        <AssetCard key={label} label={label} description={description} filename={filename} previewBg="#030803">
                            {(ref) => (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ color: GREEN }}>
                                        {/* @ts-expect-error – width/height override for preview */}
                                        <Component ref={ref} width={PREVIEW_SIZE} height={PREVIEW_SIZE} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ color: GREEN }}><Component /></div>
                                        <span style={{ fontSize: '10px', color: '#3f3f46', fontFamily: 'monospace' }}>actual 24px</span>
                                    </div>
                                </div>
                            )}
                        </AssetCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
