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
  onNext?: () => void;
  onPrev?: () => void;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/* helpers */
function detectProvider(url: string): Provider {
  const u = url?.trim();
  const isYouTube =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))/i.test(u);
  return isYouTube ? "youtube" : "html5";
}
const isHls = (url: string) => /\.m3u8($|\?)/i.test(url);
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
const formatTime = (t: number) => {
  if (!isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/* singleton YT loader */
let ytLoadPromise: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (ytLoadPromise) return ytLoadPromise;
  ytLoadPromise = new Promise<void>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (existing) {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    window.onYouTubeIframeAPIReady = () => resolve();
    document.head.appendChild(script);
  });
  return ytLoadPromise;
}
function getYouTubeId(url: string): string | null {
  try {
    const y = new URL(url);
    if (y.hostname.includes("youtube.com")) {
      if (y.pathname.startsWith("/embed/"))
        return y.pathname.split("/embed/")[1]?.split("/")[0] || null;
      if (y.pathname.startsWith("/shorts/"))
        return y.pathname.split("/shorts/")[1]?.split("/")[0] || null;
      const v = y.searchParams.get("v");
      if (v) return v;
    }
    if (y.hostname.includes("youtu.be"))
      return y.pathname.replace("/", "").split("/")[0] || null;
    return null;
  } catch {
    return null;
  }
}

/* component */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onComplete,
  startMuted = false,
  poster = "https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800",
  privacyEnhanced = false,
  onNext,
  onPrev,
}) => {
  const safeUrl = useMemo(
    () => (isPlayableUrl(videoUrl) ? videoUrl.trim() : ""),
    [videoUrl]
  );
  const provider = useMemo(() => detectProvider(safeUrl), [safeUrl]);

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

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytDivRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytReadyRef = useRef<boolean>(false);
  const progressTimer = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVolumeRef = useRef(1);

  /* NEW: remember a pre-ready play click so we can build the player with autoplay+mute */
  const wantAutoplayRef = useRef(false);
  const wantUnmuteAfterAutoplayRef = useRef(false);

  /* reset on URL change */
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    ytReadyRef.current = false;
    wantAutoplayRef.current = false;
    wantUnmuteAfterAutoplayRef.current = false;
  }, [safeUrl]);

  /* HTML5 */
  useEffect(() => {
    if (provider !== "html5") return;
    const video = videoRef.current;
    if (!video) return;
    const url = (safeUrl || "").trim();

    if (!url || !isDirectMediaUrl(url)) {
      video.removeAttribute("src");
      video.load();
      return;
    }

    let hls: any | null = null;

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

    video.crossOrigin = "anonymous";
    video.muted = isMuted;
    video.volume = volume;
    video.playbackRate = playbackRate;

    const onLoadedMetadata = () => setDuration(video.duration || 0);
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
          } else {
            video.removeAttribute("src");
            video.load();
          }
        } else {
          video.src = url;
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

  /* YouTube */
  useEffect(() => {
    if (provider !== "youtube") return;

    let cancelled = false;

    const init = async () => {
      const vid = getYouTubeId(safeUrl);
      if (!vid) {
        setError("Invalid YouTube URL");
        return;
      }

      await loadYouTubeAPI();
      if (cancelled) return;

      if (ytDivRef.current) ytDivRef.current.innerHTML = "";

      const host = privacyEnhanced
        ? "https://www.youtube-nocookie.com"
        : "https://www.youtube.com";

      ytPlayerRef.current = new window.YT.Player(ytDivRef.current!, {
        videoId: vid,
        host,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          // KEY: if user clicked before ready, start muted with autoplay so it won't be blocked
          autoplay: wantAutoplayRef.current ? 1 : 0,
          mute: wantAutoplayRef.current ? 1 : isMuted ? 1 : 0,
        },
        events: {
          onReady: (e: any) => {
            ytReadyRef.current = true;
            try {
              const iframe: HTMLIFrameElement | null = e?.target?.getIframe?.();
              iframe?.setAttribute?.(
                "allow",
                "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              );

              // duration sometimes 0 until playback starts; we’ll keep polling below.
              const vol = Math.round((isMuted ? 0 : volume) * 100);
              e.target.setVolume(vol);
              if (isMuted) e.target.mute();
              else e.target.unMute();
              e.target.setPlaybackRate?.(playbackRate);

              // If click happened before ready, ensure we actually start
              if (wantAutoplayRef.current) {
                e.target.playVideo?.();
                // unmute after autoplay if user didn’t want mute
                if (wantUnmuteAfterAutoplayRef.current) {
                  // small delay gives the player time to transition into PLAYING
                  setTimeout(() => {
                    try {
                      e.target.unMute?.();
                    } catch {
                      //
                    }
                  }, 0);
                }
                wantAutoplayRef.current = false;
                wantUnmuteAfterAutoplayRef.current = false;
              }
            } catch {
              //
            }
          },
          onStateChange: (ev: any) => {
            const P = window.YT?.PlayerState;
            if (!P) return;
            if (ev.data === P.PLAYING) setIsPlaying(true);
            if (
              ev.data === P.PAUSED ||
              ev.data === P.CUED ||
              ev.data === P.BUFFERING
            )
              setIsPlaying(false);
            if (ev.data === P.ENDED) {
              setIsPlaying(false);
              onComplete?.();
            }
          },
          onError: (err: any) => {
            const code = err?.data;
            const map: Record<number, string> = {
              2: "YouTube: Invalid parameter (check the URL)",
              5: "YouTube: HTML5 player error",
              100: "YouTube: Video not found",
              101: "YouTube: Embedding disabled",
              150: "YouTube: Embedding disabled",
            };
            setError(map[code] || "YouTube unavailable for this URL");
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

    init();

    return () => {
      cancelled = true;
      ytReadyRef.current = false;
      if (progressTimer.current) window.clearInterval(progressTimer.current);
      try {
        ytPlayerRef.current?.stopVideo?.();
      } catch {
        //
      }
      ytPlayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, safeUrl, onComplete, privacyEnhanced]);

  /* keep YT in sync with UI state after ready */
  useEffect(() => {
    if (provider !== "youtube") return;
    const p = ytPlayerRef.current;
    if (!p || !ytReadyRef.current) return;
    p.setVolume?.(Math.round(volume * 100));
    if (volume === 0) p.mute?.();
    else if (isMuted) p.unMute?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, volume]);
  useEffect(() => {
    if (provider !== "youtube") return;
    const p = ytPlayerRef.current;
    if (!p || !ytReadyRef.current) return;
    if (isMuted) p.mute?.();
    else p.unMute?.();
  }, [provider, isMuted]);
  useEffect(() => {
    if (provider !== "youtube") return;
    const p = ytPlayerRef.current;
    if (!p || !ytReadyRef.current) return;
    try {
      const avail: number[] = p.getAvailablePlaybackRates?.() || [1];
      const closest = avail.reduce(
        (a, b) =>
          Math.abs(b - playbackRate) < Math.abs(a - playbackRate) ? b : a,
        avail[0]
      );
      p.setPlaybackRate?.(closest);
    } catch {
      //
    }
  }, [provider, playbackRate]);

  /* controls */
  const togglePlay = async () => {
    if (provider === "html5") {
      const v = videoRef.current;
      if (!v) return;
      if (!v.currentSrc) {
        setError("No playable source for this lesson.");
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
      return;
    }

    // YouTube
    const p = ytPlayerRef.current;
    if (!p || !ytReadyRef.current) {
      // First click before API/player is ready → build with autoplay+mute
      wantAutoplayRef.current = true;
      wantUnmuteAfterAutoplayRef.current = !isMuted && volume > 0;
      // The constructor reads these flags; we don’t need to do anything else here.
      return;
    }
    const P = window.YT?.PlayerState;
    const state = p.getPlayerState?.();
    if (state === P?.PLAYING) {
      p.pauseVideo?.();
      setIsPlaying(false);
    } else {
      p.playVideo?.();
      setIsPlaying(true);
    }
  };

  const handleSeek = (percent: number) => {
    if (!isFinite(duration) || duration <= 0) return;
    const time = (percent / 100) * duration;
    if (provider === "html5") {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = time;
      setCurrentTime(time);
    } else {
      const p = ytPlayerRef.current;
      if (!p || !ytReadyRef.current) return;
      p.seekTo?.(time, true);
      setCurrentTime(time);
    }
  };

  const skipSeconds = (seconds: number) => {
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
      if (!p || !ytReadyRef.current) return;
      const ct = p.getCurrentTime?.() || 0;
      const t = Math.max(0, Math.min(duration || 0, ct + seconds));
      p.seekTo?.(t, true);
      setCurrentTime(t);
    }
  };

  const handleVolume = (value: number) => {
    const newVol = Math.max(0, Math.min(1, value / 100));
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
      if (!p || !ytReadyRef.current) return;
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
      if (!p || !ytReadyRef.current) return;
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
      if (!p || !ytReadyRef.current) return;
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

  /* UI */
  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group select-none"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {title ? (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-4 py-2 text-white text-sm">
          {title}
        </div>
      ) : null}

      {provider === "html5" ? (
        <video
          key={safeUrl || "poster"}
          ref={videoRef}
          className="w-full h-full"
          playsInline
          controls={false}
          poster={poster}
        />
      ) : (
        <div
          key={getYouTubeId(safeUrl) || safeUrl}
          ref={ytDivRef}
          className="w-full h-full aspect-video bg-black"
        />
      )}

      {error && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white text-xs px-3 py-1 rounded shadow">
          {error}
        </div>
      )}

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <button
            onClick={togglePlay}
            aria-label="Play"
            className="sm:w-20 sm:h-20 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
          >
            <Play className="sm:w-8 sm:h-8 w-5 h-5 text-white ml-1" />
          </button>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="sm:p-4 p-2">
          <div className="sm:mb-4 mb-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              onInput={(e) =>
                handleSeek(parseFloat((e.target as HTMLInputElement).value))
              }
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`,
              }}
              aria-label="Seek"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center sm:space-x-4 space-x-1">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="text-white hover:text-purple-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-3 sm:w-6 h-3 sm:h-6" />
                ) : (
                  <Play className="w-3 sm:w-6 h-3 sm:h-6" />
                )}
              </button>

              <button
                onClick={() => (onPrev ? onPrev() : skipSeconds(-10))}
                aria-label="Previous"
                className="text-white hover:text-purple-400 transition-colors"
              >
                <SkipBack className="w-3 sm:w-5 h-3 sm:h-5" />
              </button>

              <button
                onClick={() => (onNext ? onNext() : skipSeconds(10))}
                aria-label="Next"
                className="text-white hover:text-purple-400 transition-colors"
              >
                <SkipForward className="w-3 sm:w-5 h-3 sm:h-5" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
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
                  onChange={(e) => handleVolume(parseFloat(e.target.value))}
                  onInput={(e) =>
                    handleVolume(
                      parseFloat((e.target as HTMLInputElement).value)
                    )
                  }
                  className="sm:w-20 w-14 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${Math.round(
                      volume * 100
                    )}%, #4b5563 ${Math.round(volume * 100)}%, #4b5563 100%)`,
                  }}
                  aria-label="Volume"
                />
              </div>

              <div className="text-white sm:text-sm text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group/settings h-5">
                <button
                  className="text-white hover:text-purple-400 transition-colors"
                  aria-haspopup="menu"
                  aria-label="Settings"
                >
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
                        aria-label={`Speed ${rate}x`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
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
