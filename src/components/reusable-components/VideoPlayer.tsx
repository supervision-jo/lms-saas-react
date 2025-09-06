import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";

type Provider = "html5" | "youtube";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onComplete?: () => void;
  startMuted?: boolean;
  poster?: string;
  privacyEnhanced?: boolean;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// ----------------- helpers -----------------
function detectProvider(url: string): Provider {
  const u = url?.trim();
  const isYouTube =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))/i.test(u);
  return isYouTube ? "youtube" : "html5";
}

function isHls(url: string) {
  return /\.m3u8($|\?)/i.test(url);
}

const isDirectMediaUrl = (u?: string) =>
  !!u && /\.(mp4|webm|ogg|ogv|m3u8)(\?|$)/i.test(u);

const supportsNativeHls = () =>
  "MediaSource" in window &&
  (window as any).MediaSource.isTypeSupported?.(
    "application/vnd.apple.mpegurl"
  ) === true;

const isMockUrl = (u?: string) => !!u && /(^|\/\/)example\.com/i.test(u);

const isPlayableUrl = (u?: string) =>
  !!u &&
  !isMockUrl(u) &&
  (/(?:youtu\.be|youtube\.com\/(?:watch|embed|shorts))/i.test(u) ||
    /\.(mp4|webm|ogg|ogv|m3u8)(\?|$)/i.test(u));

function formatTime(time: number) {
  if (!isFinite(time) || time < 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ----------------- component -----------------
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onComplete,
  startMuted = false,
  poster = "https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800",
  privacyEnhanced = false,
}) => {
  // Sanitize URL (block example.com and non-media/non-YouTube)
  const safeUrl = useMemo(
    () => (isPlayableUrl(videoUrl) ? videoUrl.trim() : ""),
    [videoUrl]
  );
  const provider = useMemo(() => detectProvider(safeUrl), [safeUrl]);

  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(startMuted);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(
    () =>
      duration ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0,
    [currentTime, duration]
  );

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytDivRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const progressTimer = useRef<number | null>(null); // YouTube polling
  const pendingPlayRef = useRef(false);
  const rafRef = useRef<number | null>(null); // HTML5 rAF progress
  const lastVolumeRef = useRef(1); // for mute/unmute restore

  // Reset on URL change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    pendingPlayRef.current = false;
  }, [safeUrl]);

  // ----------------- HTML5 setup -----------------
  useEffect(() => {
    if (provider !== "html5") return;
    const video = videoRef.current;
    if (!video) return;

    const url = (safeUrl || "").trim();

    // poster-only
    if (!url || !isDirectMediaUrl(url)) {
      video.removeAttribute("src");
      video.load();
      return;
    }

    let hls: any | null = null;

    // rAF ticker
    const tick = () => {
      const v = videoRef.current;
      if (!v) return;
      setCurrentTime(v.currentTime || 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    const startRaf = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    const stopRaf = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };

    // Prepare element
    video.crossOrigin = "anonymous";
    video.muted = isMuted;
    video.volume = volume;
    video.playbackRate = playbackRate;

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };
    const onDurationChange = () => {
      const d = videoRef.current?.duration;
      setDuration(Number.isFinite(d as number) ? (d as number) : 0);
    };
    const onPlay = () => {
      setIsPlaying(true);
      startRaf();
    };
    const onPause = () => {
      setIsPlaying(false);
      stopRaf();
    };
    const onEnded = () => {
      setIsPlaying(false);
      stopRaf();
      onComplete?.();
    };
    const onError = () =>
      setError(
        "This video source isn't playable by the browser (CORS/format?)"
      );

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);

    const setupSrc = async () => {
      try {
        if (isHls(url) && !supportsNativeHls()) {
          const HlsMod: any = await import("hls.js").catch(() => null);
          if (HlsMod?.default && HlsMod.default.isSupported()) {
            hls = new HlsMod.default();
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(HlsMod.default.Events.MANIFEST_PARSED, () => {
              setDuration(video.duration || 0);
            });
          } else {
            // keep poster, no errors
            video.removeAttribute("src");
            video.load();
          }
        } else {
          video.src = url; // mp4/webm/ogg OR native HLS (Safari)
        }
      } catch {
        setError("Failed to initialize video source.");
      }
    };

    setupSrc();

    return () => {
      stopRaf();
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      if (hls) {
        try {
          hls.destroy();
        } catch {
          //
        }
      }
    };
  }, [provider, safeUrl, isMuted, volume, playbackRate, onComplete]);

  // ----------------- YouTube setup -----------------
  useEffect(() => {
    if (provider !== "youtube") return;

    let cancelled = false;

    const loadYT = () =>
      new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) return resolve();
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        (window as any).onYouTubeIframeAPIReady = () => resolve();
        document.head.appendChild(script);
      });

    const getVideoId = (url: string): string | null => {
      try {
        const y = new URL(url);
        if (y.hostname.includes("youtube.com")) {
          if (y.pathname.startsWith("/embed/"))
            return y.pathname.split("/embed/")[1]?.split("/")[0] || null;
          const v = y.searchParams.get("v");
          if (v) return v;
          if (y.pathname.startsWith("/shorts/"))
            return y.pathname.split("/shorts/")[1]?.split("/")[0] || null;
        }
        if (y.hostname.includes("youtu.be")) {
          return y.pathname.replace("/", "").split("/")[0] || null;
        }
        return null;
      } catch {
        return null;
      }
    };

    const initYT = async () => {
      const vid = getVideoId(safeUrl);
      if (!vid) {
        setError("Invalid YouTube URL");
        return;
      }
      await loadYT();
      if (cancelled) return;

      // clear previous iframe (without destroying React nodes outside)
      if (ytDivRef.current) ytDivRef.current.innerHTML = "";

      ytPlayerRef.current = new window.YT.Player(ytDivRef.current!, {
        videoId: vid,
        host: privacyEnhanced
          ? "https://www.youtube-nocookie.com"
          : "https://www.youtube.com",
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            try {
              const iframe: HTMLIFrameElement | null = e?.target?.getIframe?.();
              iframe?.setAttribute?.(
                "allow",
                "autoplay; clipboard-write; encrypted-media; picture-in-picture"
              );
              setDuration(e.target.getDuration?.() || 0);
              e.target.setVolume(Math.round((isMuted ? 0 : volume) * 100));
              if (isMuted) e.target.mute();
              else e.target.unMute();
              e.target.setPlaybackRate?.(playbackRate);

              if (pendingPlayRef.current) {
                e.target.playVideo?.();
                pendingPlayRef.current = false;
              }
            } catch {
              //
            }
          },
          onStateChange: (e: any) => {
            // 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2 || e.data === 5) setIsPlaying(false);
            if (e.data === 0) {
              setIsPlaying(false);
              onComplete?.();
            }
          },
          onError: (err: any) => {
            const code = err?.data;
            const map: Record<number, string> = {
              2: "YouTube: Invalid parameter (check the video URL)",
              5: "YouTube: HTML5 player error (not available in this embed mode)",
              100: "YouTube: Video not found or removed",
              101: "YouTube: Owner disabled embedding",
              150: "YouTube: Owner disabled embedding",
            };
            setError(
              map[code] || "YouTube blocked or unavailable for this URL"
            );
          },
        },
      });

      if (progressTimer.current) window.clearInterval(progressTimer.current);
      progressTimer.current = window.setInterval(() => {
        const p = ytPlayerRef.current;
        if (!p) return;
        try {
          const ct = p.getCurrentTime?.() || 0;
          const du = p.getDuration?.() || duration;
          setCurrentTime(ct);
          if (du && du !== duration) setDuration(du);
        } catch {
          //
        }
      }, 250);
    };

    initYT();

    return () => {
      cancelled = true;
      if (progressTimer.current) window.clearInterval(progressTimer.current);
      try {
        const p = ytPlayerRef.current;
        if (p) p.stopVideo?.();
      } catch {
        //
      }
      ytPlayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, safeUrl, onComplete, privacyEnhanced]);

  useEffect(() => {
    if (provider !== "youtube") return;
    const p = ytPlayerRef.current;
    if (!p) return;
    p.setVolume?.(Math.round(volume * 100));
    // keep mute state consistent with slider
    if (volume === 0) p.mute?.();
    else if (isMuted) p.unMute?.();
    // (avoid setState here to prevent loops)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, volume]);

  useEffect(() => {
    if (provider !== "youtube") return;
    const p = ytPlayerRef.current;
    if (!p) return;
    if (isMuted) p.mute?.();
    else p.unMute?.();
  }, [provider, isMuted]);

  useEffect(() => {
    if (provider !== "youtube") return;
    const p = ytPlayerRef.current;
    if (!p) return;
    const avail: number[] = p.getAvailablePlaybackRates?.() || [1];
    const closest = avail.reduce(
      (a, b) =>
        Math.abs(b - playbackRate) < Math.abs(a - playbackRate) ? b : a,
      avail[0]
    );
    try {
      p.setPlaybackRate?.(closest);
    } catch {
      //
    }
    // optional: reflect the actual rate in UI
    // if (closest !== playbackRate) setPlaybackRate(closest);
  }, [provider, playbackRate]);

  // ----------------- controls -----------------
  const togglePlay = async () => {
    if (provider === "html5") {
      const v = videoRef.current;
      if (!v) return;
      // no valid source (poster-only)
      if (!v.currentSrc) {
        setError(
          "No playable source for this lesson. Use an MP4/WebM/OGG/HLS URL with CORS or a YouTube link."
        );
        return;
      }
      try {
        if (v.paused) {
          await v.play();
          setIsPlaying(true);
        } else {
          v.pause();
          setIsPlaying(false);
        }
      } catch {
        setError("Autoplay blocked or playback error");
      }
    } else {
      const p = ytPlayerRef.current;
      if (!p) {
        pendingPlayRef.current = true;
        return;
      }
      const state = p.getPlayerState?.();
      if (state === 1) {
        p.pauseVideo?.();
        setIsPlaying(false);
      } else {
        p.playVideo?.();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseFloat(e.target.value);
    if (!isFinite(duration) || duration <= 0) return;
    const time = (percent / 100) * duration;

    if (provider === "html5") {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = time;
      setCurrentTime(time);
    } else {
      const p = ytPlayerRef.current;
      if (!p) return;
      p.seekTo?.(time, true);
      setCurrentTime(time);
    }
  };

  const skip = (seconds: number) => {
    if (provider === "html5") {
      const v = videoRef.current;
      if (!v) return;
      const t = Math.max(
        0,
        Math.min(duration || 0, (v.currentTime || 0) + seconds)
      );
      v.currentTime = t;
      setCurrentTime(t);
    } else {
      const p = ytPlayerRef.current;
      if (!p) return;
      const ct = p.getCurrentTime?.() || 0;
      const t = Math.max(0, Math.min(duration || 0, ct + seconds));
      p.seekTo?.(t, true);
      setCurrentTime(t);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Math.max(0, Math.min(1, parseFloat(e.target.value) / 100));
    if (newVol > 0) lastVolumeRef.current = newVol;
    setVolume(newVol);
    if (provider === "html5") {
      const v = videoRef.current;
      if (!v) return;
      v.volume = newVol;
      v.muted = newVol === 0;
      setIsMuted(v.muted);
    } else {
      const p = ytPlayerRef.current;
      if (!p) return;
      p.setVolume?.(Math.round(newVol * 100));
      if (newVol === 0) {
        p.mute?.();
        setIsMuted(true);
      } else if (isMuted) {
        p.unMute?.();
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (provider === "html5") {
      const v = videoRef.current;
      if (!v) return;
      if (isMuted) {
        v.muted = false;
        setIsMuted(false);
        const restore = lastVolumeRef.current || 1;
        v.volume = restore;
        setVolume(restore);
      } else {
        lastVolumeRef.current = volume || 1;
        v.muted = true;
        setIsMuted(true);
        v.volume = 0;
        setVolume(0);
      }
    } else {
      const p = ytPlayerRef.current;
      if (!p) return;
      if (isMuted) {
        p.unMute?.();
        setIsMuted(false);
        const restore = lastVolumeRef.current || 1;
        p.setVolume?.(Math.round(restore * 100));
        setVolume(restore);
      } else {
        lastVolumeRef.current = volume || 1;
        p.mute?.();
        setIsMuted(true);
        setVolume(0);
      }
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (provider === "html5") {
      const v = videoRef.current;
      if (!v) return;
      v.playbackRate = rate;
    } else {
      const p = ytPlayerRef.current;
      if (!p) return;
      try {
        p.setPlaybackRate?.(rate);
      } catch {
        //
      }
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };

  // ----------------- UI -----------------
  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group select-none"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Title (optional) */}
      {title ? (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-4 py-2 text-white text-sm">
          {title}
        </div>
      ) : null}

      {/* Renderer */}
      {provider === "html5" ? (
        <video
          key={safeUrl || "poster"} // force remount when source changes
          ref={videoRef}
          className="w-full h-full"
          playsInline
          controls={false}
          poster={poster}
        />
      ) : (
        <div ref={ytDivRef} className="w-full h-full aspect-video bg-black" />
      )}

      {/* Error banner */}
      {error && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white text-xs px-3 py-1 rounded shadow">
          {error}
        </div>
      )}

      {/* Play overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <button
            onClick={togglePlay}
            className="sm:w-20 sm:h-20 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
          >
            <Play className="sm:w-8 sm:h-8 w-5 h-5 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="sm:p-4 p-2">
          {/* Progress */}
          <div className="sm:mb-4 mb-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`,
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center sm:space-x-4 space-x-1">
              <button
                onClick={togglePlay}
                className="text-white hover:text-purple-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-3 sm:w-6 h-3 sm:h-6" />
                ) : (
                  <Play className="w-3 sm:w-6 h-3 sm:h-6" />
                )}
              </button>

              <button
                onClick={() => skip(-10)}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <SkipBack className="w-3 sm:w-5 h-3 sm:h-5" />
              </button>

              <button
                onClick={() => skip(10)}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <SkipForward className="w-3 sm:w-5 h-3 sm:h-5" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3 sm:w-5 h-3 sm:h-5" />
                  ) : (
                    <Volume2 className="w-3 sm:w-5 h-3 sm:h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : Math.round(volume * 100)}
                  onChange={handleVolumeChange}
                  className="sm:w-20 w-14 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${Math.round(
                      volume * 100
                    )}%, #4b5563 ${Math.round(volume * 100)}%, #4b5563 100%)`,
                  }}
                />
              </div>

              <div className="text-white sm:text-sm text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group/settings h-5">
                <button className="text-white hover:text-purple-400 transition-colors">
                  <Settings className="w-3 sm:w-5 h-3 sm:h-5" />
                </button>
                <div className="absolute sm:bottom-8 bottom-5 right-0 bg-black/90 rounded-lg sm:p-2 p-1 opacity-0 group-hover/settings:opacity-100 transition-opacity">
                  <div className="text-white sm:text-sm text-xs sm:mb-2 mb-1">
                    Speed
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`block w-full text-left px-3 sm:py-1 py-0 sm:text-sm text-xs hover:bg-purple-600 rounded ${
                          playbackRate === rate
                            ? "text-purple-400"
                            : "text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <Maximize className="w-3 sm:w-5 h-3 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
