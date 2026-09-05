import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BajaScene from '../baja/BajaScene';
import {
  COMBINATIONS, MODEL_YEARS, PAINT, FINISH_LABELS,
  finishOf, resolveCombination,
} from '../baja/paintData';
import {
  MAX_DESIGNS, loadCustomPaints, makeDesignId, normaliseHex, saveCustomPaints,
} from '../baja/customPaints';
import './Baja.css';

const MODEL_URL = `${process.env.PUBLIC_URL}/models/baja.glb`;

const INITIAL_LIGHTS = {
  head: false, fog: false, roof: false, brake: false,
  left: false, right: false, hazard: false, dusk: false,
};

const STEER_KEYS = { ArrowLeft: 1, a: 1, A: 1, ArrowRight: -1, d: -1, D: -1 };

const BLANK_DRAFT = { name: '', bodyHex: '#d9a227', claddingHex: '#a8a69f', finish: 'pearl' };

export default function Baja() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const stageRef = useRef(null);
  const heldKeys = useRef(new Set());

  const [status, setStatus] = useState('loading');
  const [selectedId, setSelectedId] = useState(COMBINATIONS[0].id);
  const [yearFilter, setYearFilter] = useState('all');
  const [turbo, setTurbo] = useState(false);
  const [lights, setLights] = useState(INITIAL_LIGHTS);
  const [driving, setDriving] = useState(true);
  const [paintMode, setPaintMode] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [customs, setCustoms] = useState(loadCustomPaints);
  const [notice, setNotice] = useState('');

  /* ------------------------------------------------------------ selection */

  const selected = useMemo(() => {
    const custom = customs.find((c) => c.id === selectedId);
    if (custom) {
      return {
        kind: 'custom',
        id: custom.id,
        title: custom.name || 'Untitled mix',
        subtitle: `${custom.bodyHex.toUpperCase()} over ${custom.claddingHex.toUpperCase()}`,
        code: 'CUSTOM',
        finishLabel: FINISH_LABELS[custom.finish],
        years: [],
        turbo: true,
        note: 'Your own mix, saved to this browser.',
        paint: {
          bodyHex: custom.bodyHex,
          claddingHex: custom.claddingHex,
          bodyFinish: custom.finish,
          claddingFinish: custom.finish,
        },
        swatch: [custom.bodyHex, custom.claddingHex],
      };
    }
    const combo = COMBINATIONS.find((c) => c.id === selectedId) || COMBINATIONS[0];
    const body = PAINT[combo.body];
    const cladding = PAINT[combo.cladding];
    const bodyFinish = finishOf(body.name);
    const cladFinish = finishOf(cladding.name);
    return {
      kind: 'factory',
      id: combo.id,
      title: body.name,
      subtitle: combo.twoTone ? cladding.name : 'Monotone',
      code: combo.order,
      finishLabel:
        combo.twoTone && bodyFinish !== cladFinish
          ? `${FINISH_LABELS[bodyFinish]} over ${FINISH_LABELS[cladFinish]}`
          : FINISH_LABELS[bodyFinish],
      years: combo.years,
      turbo: combo.turbo,
      note: combo.note,
      twoTone: combo.twoTone,
      bodyCode: combo.body,
      claddingCode: combo.cladding,
      paint: resolveCombination(combo),
      swatch: [body.hex, cladding.hex],
    };
  }, [selectedId, customs]);

  const visibleCombinations = useMemo(
    () => (yearFilter === 'all'
      ? COMBINATIONS
      : COMBINATIONS.filter((c) => c.years.includes(Number(yearFilter)))),
    [yearFilter],
  );

  /* --------------------------------------------------------------- scene  */

  useEffect(() => {
    const scene = new BajaScene(canvasRef.current);
    sceneRef.current = scene;
    let cancelled = false;
    scene
      .load(MODEL_URL)
      .then(() => !cancelled && setStatus('ready'))
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status === 'ready') sceneRef.current?.setPaint(selected.paint);
  }, [status, selected]);

  useEffect(() => {
    if (status === 'ready') sceneRef.current?.setScoop(turbo && selected.turbo);
  }, [status, turbo, selected]);

  useEffect(() => {
    if (status === 'ready') sceneRef.current?.setLights(lights);
  }, [status, lights]);

  useEffect(() => {
    if (status === 'ready') sceneRef.current?.setDusk(lights.dusk);
  }, [status, lights.dusk]);

  useEffect(() => {
    if (status !== 'ready') return undefined;
    // the swap is synchronous but heavy (env map, ~500 tree instances), so let
    // the overlay paint first, then hand the renderer a frame to settle
    setSwitching(true);
    let applied = false;
    let settled = false;
    const apply = () => {
      if (applied) return;
      applied = true;
      sceneRef.current?.setStudio(paintMode);
    };
    const settle = () => {
      if (settled) return;
      settled = true;
      apply();
      setSwitching(false);
    };
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { apply(); raf2 = requestAnimationFrame(settle); });
    // rAF is paused in a background tab, so never leave the overlay stranded
    const fallback = setTimeout(settle, 450);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(fallback);
    };
  }, [status, paintMode]);

  useEffect(() => {
    sceneRef.current?.setDriving(driving);
  }, [driving]);

  /* ------------------------------------------------------------ steering  */

  const applySteer = useCallback(() => {
    let value = 0;
    heldKeys.current.forEach((k) => { value += STEER_KEYS[k] || 0; });
    sceneRef.current?.setSteerInput(Math.max(-1, Math.min(1, value)));
  }, []);

  const onKeyDown = useCallback((e) => {
    if (!STEER_KEYS[e.key]) return;
    e.preventDefault();
    heldKeys.current.add(e.key);
    applySteer();
  }, [applySteer]);

  const onKeyUp = useCallback((e) => {
    if (!STEER_KEYS[e.key]) return;
    heldKeys.current.delete(e.key);
    applySteer();
  }, [applySteer]);

  const releaseSteering = useCallback(() => {
    heldKeys.current.clear();
    applySteer();
  }, [applySteer]);

  /* -------------------------------------------------------------- actions */

  const toggleLight = (key) => setLights((prev) => {
    const next = { ...prev, [key]: !prev[key] };
    if (key === 'left' && next.left) { next.right = false; next.hazard = false; }
    if (key === 'right' && next.right) { next.left = false; next.hazard = false; }
    if (key === 'hazard' && next.hazard) { next.left = false; next.right = false; }
    return next;
  });

  const enterPaintMode = () => {
    setDraft({
      ...BLANK_DRAFT,
      bodyHex: selected.paint.bodyHex,
      claddingHex: selected.paint.claddingHex,
      finish: selected.paint.bodyFinish,
    });
    setPaintMode(true);
    setNotice('');
  };

  const updateDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  // the model repaints live as you mix, so the preview is the real thing
  useEffect(() => {
    if (status !== 'ready' || !paintMode) return;
    sceneRef.current?.setPaint({
      bodyHex: draft.bodyHex,
      claddingHex: draft.claddingHex,
      bodyFinish: draft.finish,
      claddingFinish: draft.finish,
    });
  }, [status, paintMode, draft]);

  const commitHex = (field, raw) => {
    const hex = normaliseHex(raw);
    if (hex) updateDraft({ [field]: hex });
  };

  const saveDesign = () => {
    if (customs.length >= MAX_DESIGNS) {
      setNotice(`Cookie storage holds ${MAX_DESIGNS} designs — delete one first.`);
      return;
    }
    const design = {
      id: makeDesignId(),
      name: draft.name.trim() || `Mix ${customs.length + 1}`,
      bodyHex: draft.bodyHex,
      claddingHex: draft.claddingHex,
      finish: draft.finish,
      custom: true,
    };
    const next = [...customs, design];
    setCustoms(next);
    saveCustomPaints(next);
    setSelectedId(design.id);
    setPaintMode(false);
    setNotice(`Saved “${design.name}” to this browser.`);
  };

  const deleteDesign = (id) => {
    const next = customs.filter((c) => c.id !== id);
    setCustoms(next);
    saveCustomPaints(next);
    if (selectedId === id) setSelectedId(COMBINATIONS[0].id);
  };

  /* ----------------------------------------------------------------- view */

  return (
    <div className="baja">
      <div
        className="baja__stage"
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={releaseSteering}
        onPointerDown={() => stageRef.current?.focus()}
      >
        <canvas ref={canvasRef} className="baja__canvas" />

        {(status !== 'ready' || switching) && (
          <div className="baja__loading">
            <span className="baja__loading-bar"><i /></span>
            <p>
              {status === 'error' ? 'Model failed to load'
                : status !== 'ready' ? 'Loading model'
                : paintMode ? 'Opening the paint shop' : 'Back to the road'}
            </p>
          </div>
        )}

        <header className="baja__chrome baja__chrome--top">
          <Link to="/" className="baja__back">← Caleb Lykken</Link>
          {!paintMode && (
            <div className="baja__lights" role="group" aria-label="Lights">
              {[
                ['head', 'Head'], ['fog', 'Fog'], ['roof', 'Roof'],
                ['brake', 'Brake'], ['dusk', 'Dusk'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className="baja__chip"
                  aria-pressed={lights[key]}
                  onClick={() => toggleLight(key)}
                >
                  {label}
                </button>
              ))}
              <button type="button" className="baja__chip" aria-pressed={lights.left} onClick={() => toggleLight('left')} aria-label="Left signal">◀</button>
              <button type="button" className="baja__chip" aria-pressed={lights.hazard} onClick={() => toggleLight('hazard')}>Haz</button>
              <button type="button" className="baja__chip" aria-pressed={lights.right} onClick={() => toggleLight('right')} aria-label="Right signal">▶</button>
            </div>
          )}
        </header>

        <div className="baja__headline">
          <p className="baja__eyebrow">
            {paintMode ? 'Paint shop' : `Subaru Baja · ${selected.years.join('–') || 'custom'}`}
          </p>
          <h1>
            {paintMode ? 'Mix your own' : selected.title}
          </h1>
          {!paintMode && (
            <p className="baja__sub">
              {selected.subtitle}
              <span className="baja__code">{selected.code}</span>
            </p>
          )}
          {!paintMode && <p className="baja__note">{selected.note}</p>}
        </div>

        {!paintMode && (
          <div className="baja__chrome baja__chrome--bottom">
            <button type="button" className="baja__chip" aria-pressed={driving} onClick={() => setDriving((d) => !d)}>
              {driving ? 'Driving' : 'Parked'}
            </button>
            <button type="button" className="baja__chip" onClick={() => sceneRef.current?.resetView()}>Reset view</button>
            <span className="baja__hint">click, then <b>← →</b> or <b>A D</b> to steer</span>
          </div>
        )}
      </div>

      <aside className="baja__panel">
        {paintMode ? (
          <PaintShop
            draft={draft}
            notice={notice}
            onChange={updateDraft}
            onCommitHex={commitHex}
            onSave={saveDesign}
            onCancel={() => { setPaintMode(false); setNotice(''); }}
          />
        ) : (
          <>
            <div className="baja__panel-head">
              <h2>Factory combinations</h2>
              <div className="baja__years">
                {['all', ...MODEL_YEARS].map((y) => (
                  <button
                    key={y}
                    type="button"
                    className="baja__year"
                    aria-pressed={String(yearFilter) === String(y)}
                    onClick={() => setYearFilter(y)}
                  >
                    {y === 'all' ? 'All' : y}
                  </button>
                ))}
              </div>
            </div>

            <div className="baja__meta">
              <dl>
                <div><dt>Finish</dt><dd>{selected.finishLabel}</dd></div>
                {selected.kind === 'factory' && (
                  <>
                    <div><dt>Body</dt><dd>{PAINT[selected.bodyCode].name} <span>{selected.bodyCode}</span></dd></div>
                    <div><dt>Cladding</dt><dd>{PAINT[selected.claddingCode].name} <span>{selected.claddingCode}</span></dd></div>
                  </>
                )}
              </dl>
              <div className="baja__trim">
                <button type="button" className="baja__chip" aria-pressed={!turbo} onClick={() => setTurbo(false)}>Sport</button>
                <button
                  type="button"
                  className="baja__chip"
                  aria-pressed={turbo && selected.turbo}
                  disabled={!selected.turbo}
                  onClick={() => setTurbo(true)}
                >
                  Turbo
                </button>
                {!selected.turbo && <span className="baja__muted">no turbo this year</span>}
              </div>
            </div>

            <ul className="baja__swatches">
              {visibleCombinations.map((combo) => (
                <li key={combo.id}>
                  <button
                    type="button"
                    className="baja__swatch"
                    aria-current={selectedId === combo.id}
                    onClick={() => setSelectedId(combo.id)}
                    title={`${PAINT[combo.body].name} · ${combo.order}`}
                  >
                    <span className="baja__swatch-colour">
                      <i style={{ background: PAINT[combo.body].hex }} />
                      <i style={{ background: PAINT[combo.cladding].hex }} />
                    </span>
                    <span className="baja__swatch-label">
                      <strong>{PAINT[combo.body].name}</strong>
                      <em>{combo.order}</em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="baja__panel-head baja__panel-head--tight">
              <h2>Your mixes</h2>
              <button type="button" className="baja__chip baja__chip--accent" onClick={enterPaintMode}>
                + New
              </button>
            </div>
            {customs.length === 0 ? (
              <p className="baja__muted baja__empty">
                Nothing saved yet. Mix a colour and it is kept in a cookie on this browser.
              </p>
            ) : (
              <ul className="baja__swatches">
                {customs.map((design) => (
                  <li key={design.id}>
                    <button
                      type="button"
                      className="baja__swatch"
                      aria-current={selectedId === design.id}
                      onClick={() => setSelectedId(design.id)}
                    >
                      <span className="baja__swatch-colour">
                        <i style={{ background: design.bodyHex }} />
                        <i style={{ background: design.claddingHex }} />
                      </span>
                      <span className="baja__swatch-label">
                        <strong>{design.name}</strong>
                        <em>{FINISH_LABELS[design.finish]}</em>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="baja__delete"
                      onClick={() => deleteDesign(design.id)}
                      aria-label={`Delete ${design.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {notice && <p className="baja__notice">{notice}</p>}

            <p className="baja__fineprint">
              Colours are close visual approximations, not official matches — use the paint code
              for anything that has to match. Scoop geometry is measured from a WRX wagon and
              re-draped onto the Baja hood.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------- paint shop */

function PaintShop({ draft, notice, onChange, onCommitHex, onSave, onCancel }) {
  return (
    <div className="baja__paint">
      <div className="baja__panel-head">
        <h2>Paint shop</h2>
        <button type="button" className="baja__chip" onClick={onCancel}>Cancel</button>
      </div>

      <p className="baja__muted">
        Pick with the wheel or type a hex code. The truck repaints as you go.
      </p>

      <ColourField
        label="Body"
        value={draft.bodyHex}
        onPick={(hex) => onChange({ bodyHex: hex })}
        onCommit={(raw) => onCommitHex('bodyHex', raw)}
      />
      <ColourField
        label="Cladding"
        value={draft.claddingHex}
        onPick={(hex) => onChange({ claddingHex: hex })}
        onCommit={(raw) => onCommitHex('claddingHex', raw)}
      />

      <label className="baja__field">
        <span>Finish</span>
        <select value={draft.finish} onChange={(e) => onChange({ finish: e.target.value })}>
          <option value="solid">Solid</option>
          <option value="pearl">Pearl</option>
          <option value="metallic">Metallic</option>
        </select>
      </label>

      <label className="baja__field">
        <span>Name</span>
        <input
          type="text"
          maxLength={24}
          placeholder="e.g. the one I want"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </label>

      {notice && <p className="baja__notice">{notice}</p>}

      <button type="button" className="baja__done" onClick={onSave}>Done — save to cookies</button>
    </div>
  );
}

function ColourField({ label, value, onPick, onCommit }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <div className="baja__field baja__field--colour">
      <span>{label}</span>
      <div className="baja__colour-row">
        <input
          type="color"
          value={value}
          onChange={(e) => onPick(e.target.value)}
          aria-label={`${label} colour wheel`}
        />
        <input
          type="text"
          className="baja__hex"
          value={text}
          spellCheck="false"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onCommit(text)}
          onKeyDown={(e) => e.key === 'Enter' && onCommit(text)}
          aria-label={`${label} hex code`}
        />
      </div>
    </div>
  );
}
