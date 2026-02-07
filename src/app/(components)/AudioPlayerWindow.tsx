"use client";

import { useState, useRef, useEffect } from "react";

interface Track {
  name: string;
  notes: number[];
  tempo: number;
}

const tracks: Track[] = [
  {
    name: "BGM001.mid",
    notes: [277.18, 311.13, 369.99, 415.30, 277.18, 311.13, 369.99, 415.30, 277.18, 369.99, 415.30, 466.16, 415.30, 369.99, 311.13],
    tempo: 300,
  },
  {
    name: "BGM002.mid",
    notes: [277.18, 277.18, 0, 277.18, 0, 261.63, 277.18, 0, 311.13, 0, 0, 0, 155.56, 0, 0, 0],
    tempo: 200,
  },
  {
    name: "BGM003.mid",
    notes: [311.13, 369.99, 415.30, 466.16, 415.30, 369.99, 311.13, 261.63, 293.66, 329.63, 369.99, 415.30, 369.99, 329.63, 293.66, 261.63],
    tempo: 350,
  },
  {
    name: "BGM004.mid",
    notes: [261.63, 293.66, 311.13, 349.23, 329.63, 369.99, 415.30, 466.16, 415.30, 369.99, 329.63, 311.13],
    tempo: 450,
  },
  {
    name: "BGM005.mid",
    notes: [369.99, 415.30, 466.16, 369.99, 415.30, 466.16, 369.99, 415.30, 466.16, 523.25, 466.16, 415.30, 369.99],
    tempo: 280,
  },
];

export const AudioPlayerWindow = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(12).fill(2));
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const vizIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const createAudioContext = () => {
    if (!audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playNote = (frequency: number, duration = 0.2) => {
    const ctx = createAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.type = "square";
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  };

  const handlePlay = async () => {
    if (!isPlaying) {
      const ctx = createAudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      setIsPlaying(true);
      const track = tracks[currentTrackIndex];
      let noteIndex = 0;

      intervalRef.current = setInterval(() => {
        if (noteIndex < track.notes.length) {
          const note = track.notes[noteIndex];
          if (note > 0) playNote(note);
          noteIndex++;
        } else {
          noteIndex = 0;
        }
      }, track.tempo);

      vizIntervalRef.current = setInterval(() => {
        setVisualizerBars(Array.from({ length: 12 }, () => Math.floor(Math.random() * 16) + 2));
      }, 100);
    } else {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (vizIntervalRef.current) clearInterval(vizIntervalRef.current);
      intervalRef.current = null;
      vizIntervalRef.current = null;
      setVisualizerBars(Array(12).fill(2));
    }
  };

  const stopAndSwitch = (next: number) => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (vizIntervalRef.current) clearInterval(vizIntervalRef.current);
      intervalRef.current = null;
      vizIntervalRef.current = null;
      setVisualizerBars(Array(12).fill(2));
    }
    setCurrentTrackIndex(next);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (vizIntervalRef.current) clearInterval(vizIntervalRef.current);
    };
  }, []);

  return (
    <div className="os-audio-player">
      <div className="os-audio-display">
        <div className="os-audio-track-name">
          Now Playing: {tracks[currentTrackIndex].name}
        </div>
        <div className="os-audio-visualizer">
          {visualizerBars.map((h, i) => (
            <div
              key={i}
              className="os-audio-bar"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      </div>
      <div className="os-audio-controls">
        <button
          className="os-audio-btn"
          onClick={() => stopAndSwitch(currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1)}
        >
          &#9198;
        </button>
        <button className="os-audio-btn os-audio-btn-play" onClick={handlePlay}>
          {isPlaying ? "\u23F8" : "\u25B6"}
        </button>
        <button
          className="os-audio-btn"
          onClick={() => stopAndSwitch(currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0)}
        >
          &#9197;
        </button>
      </div>
    </div>
  );
};
