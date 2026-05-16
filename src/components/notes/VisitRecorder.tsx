import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Pause, Play, Trash2, Upload, FileAudio } from "lucide-react";

const MAX_SECONDS = 60 * 60; // 60 min

interface Props {
  onReady: (file: File, durationSeconds: number) => void;
  onClear?: () => void;
  existingFile?: File | null;
}

export default function VisitRecorder({ onReady, onClear, existingFile }: Props) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => () => cleanup(), []);

  const cleanup = () => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
  };

  const startMeter = (stream: MediaStream) => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i];
      setLevel(Math.min(1, sum / data.length / 128));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        const file = new File([blob], `visit-${Date.now()}.webm`, { type: mime });
        onReady(file, seconds);
        cleanup();
      };
      rec.start(1000);
      recorderRef.current = rec;
      setRecording(true); setPaused(false); setSeconds(0);
      startMeter(stream);
      tickRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) { stop(); return s + 1; }
          return s + 1;
        });
      }, 1000);
    } catch (e) {
      setError("Microphone access denied. Please allow mic access and try again.");
      console.error(e);
    }
  };

  const stop = () => {
    recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
    if (tickRef.current) window.clearInterval(tickRef.current);
    setRecording(false); setPaused(false);
  };

  const togglePause = () => {
    const rec = recorderRef.current; if (!rec) return;
    if (rec.state === "recording") { rec.pause(); setPaused(true); if (tickRef.current) window.clearInterval(tickRef.current); }
    else if (rec.state === "paused") {
      rec.resume(); setPaused(false);
      tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    }
  };

  const discard = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setSeconds(0); onClear?.();
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleFile = (f: File | null) => {
    if (!f) return;
    onReady(f, 0);
  };

  // Showing existing uploaded (non-recorded) file
  if (existingFile && !previewUrl && !recording) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-3 text-[13px]">
          <FileAudio className="h-4 w-4 text-primary" />
          <span className="text-foreground truncate flex-1">{existingFile.name}</span>
          <button onClick={discard} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!recording && !previewUrl && (
        <div className="flex flex-col gap-2">
          <Button type="button" onClick={start} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Mic className="h-4 w-4" /> Record live
          </Button>
          <label className="flex items-center gap-3 cursor-pointer rounded-md border border-input bg-background px-3 py-3 text-[13px] text-muted-foreground hover:bg-muted transition-colors">
            <Upload className="h-4 w-4" />
            <span>Or upload an audio file (mp3, m4a, wav, webm)</span>
            <input type="file" accept=".mp3,.m4a,.wav,.webm,audio/*" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          </label>
        </div>
      )}

      {recording && (
        <div className="rounded-md border border-input p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${paused ? "bg-muted-foreground" : "bg-red-500 animate-pulse"}`} />
              <span className="text-[14px] font-medium tabular-nums">{fmt(seconds)}</span>
              <span className="text-[11px] text-muted-foreground">/ 60:00</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={togglePause}>
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </Button>
              <Button type="button" size="sm" onClick={stop} className="bg-primary text-primary-foreground gap-1">
                <Square className="h-3.5 w-3.5" /> Stop
              </Button>
            </div>
          </div>
          <div className="flex items-end gap-[2px] h-8">
            {Array.from({ length: 32 }).map((_, i) => {
              const phase = (Math.sin(i * 0.4 + seconds) + 1) / 2;
              const h = paused ? 4 : Math.max(3, level * 32 * (0.5 + phase * 0.5));
              return <div key={i} className="w-[3px] bg-primary/70 rounded-sm" style={{ height: `${h}px` }} />;
            })}
          </div>
          {seconds >= MAX_SECONDS - 60 && (
            <p className="text-[11px] text-amber-600">Approaching 60-minute limit.</p>
          )}
        </div>
      )}

      {previewUrl && (
        <div className="rounded-md border border-input p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Recorded · {fmt(seconds)}</span>
            <button onClick={discard} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <audio controls src={previewUrl} className="w-full h-9" />
        </div>
      )}

      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}