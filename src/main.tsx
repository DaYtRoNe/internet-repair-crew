import { createRoot } from 'react-dom/client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { paintRepair } from './repair';
import './vendor/scrollcraft.css';
import './vendor/scrollcraft.js';
import './style.css';

const photo = `${import.meta.env.BASE_URL}midnight-relay.webp`;
const photoAlt = 'A silver rally car with amber lamps at the entrance to a dark garage';
const motionPreference = '(prefers-reduced-motion: reduce)';
const compactViewport = '(max-height: 500px)';

const scenes = [
  { name: 'Boot', mark: 'Signal lost', title: 'Signal\nlost.', description: 'The Midnight Relay archive went dark. The crew is on it.', seek: 0 },
  { name: 'Reconnect', mark: 'Route broken', title: 'Find the\nbreak.', description: 'Patch traces the line. Fetch brings the connector back.', seek: .22 },
  { name: 'Recover', mark: 'Frame damaged', title: 'Build it\nback.', description: 'One frame survived. Three pieces, one shot.', seek: .48 },
  { name: 'Restore', mark: 'Archive restored', title: 'Back\nonline.', description: 'The frame is whole. There’s one last line in the garage log.', seek: .89 },
] as const;

type Readout = { scene: number; progress: number; route: boolean; frame: boolean; log: boolean };
const initial: Readout = { scene: 0, progress: 0, route: false, frame: false, log: false };

declare global {
  interface Window {
    ScrollCraft: { mount: (root: HTMLElement) => { destroy: () => void } };
  }
}

function CrewMark() {
  return <svg width="33" height="33" viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M20 2 5 19h10l-2 13 16-19H19l1-11Z" fill="currentColor"/><path d="M4 7h7M23 27h7" stroke="currentColor" strokeWidth="2"/></svg>;
}

function Arrow() {
  return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path d="M3 13 13 3M4 3h9v9" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function App() {
  const shell = useRef<HTMLElement>(null);
  const track = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [readout, setReadout] = useState(initial);
  const [skipped, setSkipped] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia(motionPreference).matches);
  const [compact, setCompact] = useState(() => matchMedia(compactViewport).matches);
  const staticPage = reduced || compact || skipped;
  const active = scenes[readout.scene];

  useEffect(() => {
    const preference = matchMedia(motionPreference);
    const viewport = matchMedia(compactViewport);
    const changed = () => setReduced(preference.matches);
    const resized = () => setCompact(viewport.matches);
    preference.addEventListener('change', changed);
    viewport.addEventListener('change', resized);
    return () => {
      preference.removeEventListener('change', changed);
      viewport.removeEventListener('change', resized);
    };
  }, []);

  useLayoutEffect(() => {
    const root = shell.current!;
    const act = track.current!;
    const draw = paintRepair(board.current!, canvas.current!);
    const engine = staticPage ? null : window.ScrollCraft.mount(root);
    let previous = '';
    let progress = -1;

    function update(force = false) {
      const p = staticPage ? 1 : Number(act.style.getPropertyValue('--sc-p'));
      if (!force && p === progress) return;
      progress = p;
      root.style.setProperty('--write', String(Math.max(0, Math.min(1, (p - .93) / .035))));
      const next = draw(p, staticPage);
      const key = `${next.scene}:${next.progress}:${next.route}:${next.frame}:${next.log}`;
      if (key !== previous) {
        previous = key;
        setReadout(next);
      }
    }

    const observer = new MutationObserver(() => update());
    const resize = new ResizeObserver(() => update(true));
    if (engine) observer.observe(act, { attributes: true, attributeFilter: ['style'] });
    resize.observe(board.current!);
    update(true);
    return () => {
      observer.disconnect();
      resize.disconnect();
      engine?.destroy();
      act.style.removeProperty('height');
      act.style.removeProperty('--sc-p');
    };
  }, [staticPage]);

  function seek(progress: number) {
    const act = track.current!;
    window.scrollTo({ top: window.scrollY + act.getBoundingClientRect().top + (act.offsetHeight - window.innerHeight) * progress, behavior: 'instant' });
  }

  function skip() {
    setSkipped(true);
    requestAnimationFrame(() => note.current?.focus({ preventScroll: false }));
  }

  function replay() {
    setSkipped(false);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => shell.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }));
  }

  return (
    <main ref={shell} className="repair" data-static={staticPage || undefined}>
      <section ref={track} data-sc-act="pin" data-sc-span="5.7" aria-label="Midnight Relay archive repair">
        <div data-sc-stage className="sc-stage">
          <div className="station">
            <header className="station-header">
              <div className="wordmark"><span className="mark"><CrewMark /></span><span>Internet<br />Repair Crew</span></div>
              <span className="edition">Interactive short <span> / </span> Midnight Relay</span>
              {!staticPage ? <button className="quiet-button" onClick={skip}>Skip to repaired page <Arrow /></button> : !reduced && !compact ? <button className="quiet-button" onClick={replay}>Replay repair <Arrow /></button> : <span className="edition reduced-label">{reduced ? 'Reduced motion' : 'Repaired archive'}</span>}
            </header>

            <div className="workbench">
              <div className="intro">
                <p className="eyebrow"><span />{active.mark}</p>
                <h1 tabIndex={-1}>{active.title}</h1>
                <p className="intro-copy">{active.description}</p>
                <div className="chapter-panel" aria-label="Repair status">
                  <div className="chapter-heading"><span>Repair sequence</span><span>{readout.progress}%</span></div>
                  <div className="meter" role="progressbar" aria-label="Archive repaired" aria-valuenow={readout.progress}>
                    <div style={{ transform: `scaleX(${readout.progress / 100})` }} />
                  </div>
                  {!staticPage && <nav className="chapters" aria-label="Repair sequence">
                    {scenes.map((scene, index) => <button key={scene.name} className="chapter" aria-current={index === readout.scene ? 'step' : undefined} data-past={index < readout.scene || undefined} onClick={() => seek(scene.seek)}><span />{scene.name}</button>)}
                  </nav>}
                </div>
              </div>

              <article className="archive" aria-label="Midnight Relay">
                <header className="archive-header">
                  <div className="archive-title"><span className="relay-icon" aria-hidden="true"><i /><i /><i /></span> Midnight Relay</div>
                  <nav className="archive-nav" aria-label="Recovered archive">
                    <button disabled={!readout.route} onClick={() => staticPage ? board.current?.focus() : seek(.8)}>Frame</button>
                    <button disabled={!readout.route} onClick={() => staticPage ? note.current?.focus() : seek(.97)}>Log</button>
                  </nav>
                </header>
                <div ref={board} className="board" tabIndex={-1} role="img" aria-label={readout.frame ? photoAlt : 'Fragmented camera frame'} data-sc-verify-state={readout.progress} data-sc-verify-hold={readout.progress >= 97} style={{ '--frame-url': `url('${photo}')` } as React.CSSProperties}>
                  <div className="board-top" aria-hidden="true"><span>Camera feed</span><span>{readout.frame ? 'Frame intact' : 'Fragmented'}</span></div>
                  <div className="board-foot" aria-hidden="true"><span>MR / Cam A</span><span>{readout.frame ? 'Locked' : 'No sync'}</span></div>
                  <div className="photo-target" aria-hidden="true">
                    <span className="reticle" />
                    {[0, 1, 2].map(index => <div key={index} className="piece" data-piece={index} />)}
                    <img className="photo" src={photo} alt="" width="1536" height="1024" draggable={false} />
                    <span className="photo-trace" />
                  </div>
                  <canvas ref={canvas} className="crew-canvas" aria-hidden="true" />
                </div>
                <div className="archive-bottom">
                  <div className="log">
                    <span>Garage log</span>
                    <p ref={note} className="note" data-restored={readout.log || undefined} tabIndex={-1}>{readout.log ? 'First start. Six months in the garage. Worth every night.' : 'Entry unavailable.'}</p>
                  </div>
                  <button className="frame-button" disabled={!readout.frame} onClick={() => dialog.current?.showModal()}>Open frame <Arrow /></button>
                </div>
              </article>
            </div>

            <footer className="station-footer">
              <span className="footer-title">Field team</span>
              <div className="crew-list"><span className="patch">Patch</span><span className="fetch">Fetch</span><span className="set">Set</span></div>
              <span className="footer-end">Archive recovery desk</span>
            </footer>
          </div>
        </div>
      </section>
      <dialog ref={dialog} className="photo-dialog" aria-labelledby="frame-title">
        <header><h2 id="frame-title">Midnight Relay / Camera A</h2><form method="dialog"><button className="quiet-button" autoFocus>Close <span aria-hidden="true">×</span></button></form></header>
        <img src={photo} alt={photoAlt} width="1536" height="1024" />
      </dialog>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
