import { useState } from 'react';
import { FaviconTab } from './tabs/FaviconTab';
import { TitleTab } from './tabs/TitleTab';
import { IconsTab } from './tabs/IconsTab';

type Tab = 'favicons' | 'titles' | 'icons';

const TABS: { id: Tab; label: string; sub: string }[] = [
    { id: 'favicons', label: 'FAVICONS',       sub: '6 variants · 32×32 SVG' },
    { id: 'titles',   label: 'TITLE SCREENS',  sub: '4 variants · 640×200 animated SVG' },
    { id: 'icons',    label: 'ICONS',          sub: '19 icons · 24×24 SVG' },
];

export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>('favicons');

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            color: '#e4e4e7',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <header style={{
                borderBottom: '1px solid #18291a',
                padding: '18px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#070d07',
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        letterSpacing: '0.25em',
                        color: '#22c55e',
                        textShadow: '0 0 20px rgba(34,197,94,0.5)',
                        fontFamily: 'monospace',
                    }}>
                        G.R.I.D
                    </span>
                    <span style={{
                        fontSize: '11px',
                        color: '#3f5a3f',
                        fontFamily: 'monospace',
                        letterSpacing: '0.15em',
                    }}>
                        GRAPHIC ASSETS
                    </span>
                </div>
                <div style={{ fontSize: '10px', color: '#27403a', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    GENERATIVE ASSET STUDIO
                </div>
            </header>

            {/* Tab bar */}
            <div style={{
                display: 'flex',
                gap: '0',
                borderBottom: '1px solid #18291a',
                padding: '0 32px',
                background: '#060c06',
            }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '14px 24px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '2px solid #22c55e' : '2px solid transparent',
                                color: isActive ? '#e4e4e7' : '#52525b',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '2px',
                                transition: 'color 0.15s, border-color 0.15s',
                                marginBottom: '-1px',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa';
                            }}
                            onMouseLeave={e => {
                                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#52525b';
                            }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace' }}>
                                {tab.label}
                            </span>
                            <span style={{ fontSize: '9px', fontFamily: 'monospace', opacity: 0.6 }}>
                                {tab.sub}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <main style={{ flex: 1, padding: '32px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
                {activeTab === 'favicons' && <FaviconTab />}
                {activeTab === 'titles'   && <TitleTab />}
                {activeTab === 'icons'    && <IconsTab />}
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid #111a11',
                padding: '12px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#27402a',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
            }}>
                <span>SVG assets are self-contained — CSS animations included in export</span>
                <span>Google Fonts required online for custom typefaces</span>
            </footer>
        </div>
    );
}
