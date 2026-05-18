import { useEffect, useRef, useState } from 'react';
import { removeBackground } from '@imgly/background-removal';

interface Props {
  /** The source image — File or URL string */
  source: File | string;
  onApply: (blob: Blob) => void;
  onClose: () => void;
}

export function BgRemoveModal({ source, onApply, onClose }: Props) {
  const [stage, setStage] = useState<'processing' | 'preview' | 'error'>('processing');
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [preview, setPreview] = useState<'result' | 'original'>('result');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;

    // Build original preview URL
    if (source instanceof File) {
      const u = URL.createObjectURL(source);
      setOriginalUrl(u);
      return () => URL.revokeObjectURL(u);
    } else {
      setOriginalUrl(source);
    }
  }, [source]);

  useEffect(() => {
    let resultObjectUrl = '';

    async function run() {
      try {
        const blob = await removeBackground(source, {
          progress: (key, current, total) => {
            if (key === 'compute:inference') {
              setProgress(Math.round((current / total) * 100));
            }
          },
        });
        if (abortRef.current) return;
        resultObjectUrl = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(resultObjectUrl);
        setStage('preview');
      } catch (e) {
        if (!abortRef.current) {
          setErrMsg(e instanceof Error ? e.message : 'Background removal failed.');
          setStage('error');
        }
      }
    }

    run();

    return () => {
      abortRef.current = true;
      if (resultObjectUrl) URL.revokeObjectURL(resultObjectUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApply() {
    if (resultBlob) onApply(resultBlob);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border-dim)',
        width: 640, maxWidth: '95vw', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--sans)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border-dim)',
        }}>
          <div>
            <span style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              ✂ Background Removal
            </span>
            <p style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 4 }}>
              Powered by @imgly/background-removal · runs entirely in your browser
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

          {stage === 'processing' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  width: 240, height: 4, background: 'var(--bg3)',
                  margin: '0 auto', borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', background: 'var(--gold)',
                    width: `${progress}%`, transition: 'width 0.3s',
                  }} />
                </div>
              </div>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
                {progress > 0 ? `Processing… ${progress}%` : 'Loading AI model… (first time ~40 MB download)'}
              </p>
              <p style={{ fontSize: 10, color: 'var(--fg3)', marginTop: 8, opacity: 0.6 }}>
                This runs in your browser — no image is sent anywhere.
              </p>
            </div>
          )}

          {stage === 'error' && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#c04040' }}>
              <p style={{ fontSize: 14, marginBottom: 12 }}>⚠ Failed</p>
              <p style={{ fontSize: 12 }}>{errMsg}</p>
              <button onClick={onClose} className="btn outline" style={{ marginTop: 24 }}>Close</button>
            </div>
          )}

          {stage === 'preview' && (
            <div>
              {/* Toggle buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['result', 'original'] as const).map(v => (
                  <button key={v} onClick={() => setPreview(v)} style={{
                    padding: '6px 16px', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                    fontFamily: 'var(--sans)', cursor: 'pointer',
                    background: preview === v ? 'var(--fg)' : 'transparent',
                    color: preview === v ? 'var(--bg)' : 'var(--fg3)',
                    border: '1px solid var(--border-dim)',
                  }}>
                    {v === 'result' ? 'Result' : 'Original'}
                  </button>
                ))}
              </div>

              {/* Image preview — checkerboard bg shows transparency */}
              <div style={{
                width: '100%', maxHeight: 380, overflow: 'hidden',
                background: preview === 'result'
                  ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 20px 20px'
                  : 'var(--bg3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={preview === 'result' ? resultUrl : originalUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 380, objectFit: 'contain', display: 'block' }}
                />
              </div>

              <p style={{ fontSize: 10, color: 'var(--fg3)', marginTop: 10, letterSpacing: '0.1em' }}>
                The checkerboard pattern shows transparent areas. The final image will have a transparent background (PNG).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {stage === 'preview' && (
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            padding: '14px 20px', borderTop: '1px solid var(--border-dim)',
          }}>
            <button onClick={onClose} className="btn outline" style={{ fontSize: 11 }}>Discard</button>
            <button onClick={handleApply} style={{
              background: 'var(--fg)', color: 'var(--bg)', border: 'none',
              cursor: 'pointer', padding: '10px 28px',
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
              fontFamily: 'var(--sans)',
            }}>
              Use This Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
