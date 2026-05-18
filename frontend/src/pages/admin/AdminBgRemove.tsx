import { useRef, useState } from 'react';
import { removeBackground } from '@imgly/background-removal';

interface Job {
  id: number;
  originalUrl: string;
  originalName: string;
  stage: 'queued' | 'processing' | 'done' | 'error';
  progress: number;
  resultUrl?: string;
  resultBlob?: Blob;
  errMsg?: string;
}

let nextId = 1;

export function AdminBgRemove() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bgColor, setBgColor] = useState<'transparent' | 'white' | 'black'>('transparent');
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function updateJob(id: number, patch: Partial<Job>) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  }

  async function processFile(file: File) {
    const id = nextId++;
    const originalUrl = URL.createObjectURL(file);
    const job: Job = { id, originalUrl, originalName: file.name, stage: 'queued', progress: 0 };
    setJobs(prev => [job, ...prev]);

    // slight delay so state renders before heavy work
    await new Promise(r => setTimeout(r, 50));
    updateJob(id, { stage: 'processing' });

    try {
      const blob = await removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          updateJob(id, { progress: Math.round((current / total) * 100) });
        },
      });

      let finalBlob = blob;

      // If white or black background requested, composite on canvas
      if (bgColor !== 'transparent') {
        finalBlob = await compositeOnColor(blob, bgColor);
      }

      const resultUrl = URL.createObjectURL(finalBlob);
      updateJob(id, { stage: 'done', resultUrl, resultBlob: finalBlob, progress: 100 });
    } catch (e) {
      updateJob(id, { stage: 'error', errMsg: e instanceof Error ? e.message : 'Failed' });
    }
  }

  async function compositeOnColor(blob: Blob, color: 'white' | 'black'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas failed')), 'image/png');
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });
  }

  function addFiles(files: FileList | File[]) {
    Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .forEach(f => processFile(f));
  }

  function download(job: Job) {
    if (!job.resultUrl || !job.resultBlob) return;
    const a = document.createElement('a');
    const base = job.originalName.replace(/\.[^.]+$/, '');
    const suffix = bgColor === 'transparent' ? '-nobg' : `-${bgColor}bg`;
    a.href = job.resultUrl;
    a.download = `${base}${suffix}.png`;
    a.click();
  }

  function removeJob(id: number) {
    setJobs(prev => {
      const job = prev.find(j => j.id === id);
      if (job?.originalUrl) URL.revokeObjectURL(job.originalUrl);
      if (job?.resultUrl) URL.revokeObjectURL(job.resultUrl);
      return prev.filter(j => j.id !== id);
    });
  }

  function clearAll() {
    jobs.forEach(j => {
      URL.revokeObjectURL(j.originalUrl);
      if (j.resultUrl) URL.revokeObjectURL(j.resultUrl);
    });
    setJobs([]);
  }

  const isDone = (j: Job) => j.stage === 'done';
  const doneCount = jobs.filter(isDone).length;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>Tools</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 10 }}>Background Removal</h1>
        <p style={{ fontSize: 13, color: 'var(--fg3)', lineHeight: 1.7 }}>
          AI-powered · runs entirely in your browser · no image is sent to any server
        </p>
      </div>

      {/* Options row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 8 }}>Output background</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['transparent', 'white', 'black'] as const).map(c => (
              <button key={c} onClick={() => setBgColor(c)} style={{
                padding: '7px 16px', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                fontFamily: 'var(--sans)', cursor: 'pointer', border: '1px solid',
                borderColor: bgColor === c ? 'var(--fg)' : 'var(--border-dim)',
                background: bgColor === c ? 'var(--fg)' : 'transparent',
                color: bgColor === c ? 'var(--bg)' : 'var(--fg3)',
              }}>
                {c === 'transparent' ? 'Transparent (PNG)' : c === 'white' ? 'White' : 'Black'}
              </button>
            ))}
          </div>
        </div>
        {doneCount > 0 && (
          <button onClick={() => jobs.filter(isDone).forEach(download)} style={{
            marginLeft: 'auto', padding: '9px 22px', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
            fontFamily: 'var(--sans)', cursor: 'pointer', background: 'var(--gold)', color: 'var(--bg)', border: 'none',
          }}>
            ⬇ Download All ({doneCount})
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragging ? 'var(--gold)' : 'var(--border-dim)'}`,
          padding: '48px 32px', textAlign: 'center', cursor: 'pointer', marginBottom: 32,
          background: dragging ? 'rgba(139,109,26,0.04)' : 'transparent',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        <p style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>✂</p>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 8 }}>
          Drop images here or click to select
        </p>
        <p style={{ fontSize: 11, color: 'var(--fg3)', opacity: 0.6 }}>
          JPEG, PNG, WebP — multiple files supported
        </p>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {/* Job list */}
      {jobs.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
              {jobs.length} image{jobs.length !== 1 ? 's' : ''} · {doneCount} ready
            </p>
            <button onClick={clearAll} style={{ fontSize: 10, color: 'var(--fg3)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.12em' }}>
              Clear all
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {jobs.map(job => (
              <div key={job.id} style={{
                background: 'var(--bg2)', border: '1px solid var(--border-dim)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                {/* Image area */}
                <div style={{
                  position: 'relative', aspectRatio: '1/1', overflow: 'hidden',
                  background: job.stage === 'done' && bgColor === 'transparent'
                    ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 16px 16px'
                    : bgColor === 'white' ? '#fff' : '#111',
                }}>
                  {/* Show result if done, otherwise original */}
                  <img
                    src={job.stage === 'done' && job.resultUrl ? job.resultUrl : job.originalUrl}
                    alt={job.originalName}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />

                  {/* Processing overlay */}
                  {(job.stage === 'processing' || job.stage === 'queued') && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}>
                      <div style={{ width: 120, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--gold)', width: `${job.progress}%`, transition: 'width 0.3s' }} />
                      </div>
                      <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                        {job.stage === 'queued' ? 'Queued…' : job.progress > 0 ? `${job.progress}%` : 'Loading model…'}
                      </p>
                    </div>
                  )}

                  {/* Error overlay */}
                  {job.stage === 'error' && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(180,40,40,0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <p style={{ fontSize: 10, color: '#fff', textAlign: 'center', padding: 8 }}>⚠ {job.errMsg}</p>
                    </div>
                  )}

                  {/* Done badge */}
                  {job.stage === 'done' && (
                    <span style={{
                      position: 'absolute', top: 6, left: 6, fontSize: 8, letterSpacing: '0.15em',
                      textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--bg)', padding: '2px 6px',
                    }}>Done</span>
                  )}

                  {/* Remove button */}
                  <button onClick={() => removeJob(job.id)} style={{
                    position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none',
                    color: '#fff', cursor: 'pointer', width: 22, height: 22, fontSize: 14, lineHeight: '22px', textAlign: 'center',
                  }}>×</button>
                </div>

                {/* Info + Download */}
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ fontSize: 11, color: 'var(--fg2)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {job.originalName}
                  </p>
                  {job.stage === 'done' && (
                    <button onClick={() => download(job)} style={{
                      width: '100%', padding: '8px 0', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                      fontFamily: 'var(--sans)', cursor: 'pointer', background: 'var(--fg)', color: 'var(--bg)', border: 'none',
                    }}>
                      ⬇ Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
