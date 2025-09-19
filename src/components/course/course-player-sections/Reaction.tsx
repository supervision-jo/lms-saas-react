// components/qa/ReactionGroup.tsx
import { useEffect, useRef, useState } from "react";
import { Heart, ThumbsUp, Sparkles } from "lucide-react"; // Sparkles for "react"/claps
import { Subject, useReaction } from "../../../hooks/useReaction";

export default function ReactionGroup({
  subject,
  countsFromServer,
  className = "",
}: {
  subject: Subject;
  countsFromServer: {
    count_likes: number;
    count_loves: number;
    count_claps: number;
  };
  className?: string; // so you can keep your styles
}) {
  const { my, counts, isPending, toggleDefaultLike, pick } = useReaction({
    subject,
    initCounts: {
      like: countsFromServer.count_likes,
      love: countsFromServer.count_loves,
      clap: countsFromServer.count_claps,
    },
  });

  const [open, setOpen] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const pressTimer = useRef<number | null>(null);
  const [pressed, setPressed] = useState(false);

  // desktop hover: keep open while mouse is over container OR palette
  const safeOpen = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setOpen(true);
  };
  const safeClose = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setOpen(false), 130) as any;
  };

  // mobile long-press
  const onPointerDown = () => {
    setPressed(true);
    pressTimer.current = window.setTimeout(() => {
      if (pressed) setOpen(true);
    }, 400) as any;
  };
  const cancelPress = () => {
    setPressed(false);
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };
  const onPointerUp = () => {
    // if the palette isn't open after press, treat as a short tap (toggle like)
    if (!open) toggleDefaultLike();
    cancelPress();
  };

  useEffect(() => () => cancelPress(), []);

  return (
    <div
      className={`relative inline-flex items-center${className}`}
      onMouseEnter={safeOpen}
      onMouseLeave={safeClose}
    >
      {/* === Your main like button (keeps your style) === */}
      <button
        type="button"
        disabled={isPending}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        className={`
          flex items-center space-x-1 text-sm px-2 py-1 rounded transition-colors
          ${
            my
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }
        `}
        title={my ? "Remove reaction" : "Like"}
      >
        <ThumbsUp className="w-4 h-4" />
        <span>{counts.like + counts.love + counts.clap}</span>
      </button>

      {/* === Palette (stays open while hovering) === */}
      {open && (
        <div
          className="absolute z-30 -top-12 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-full px-2 py-1 flex gap-1 shadow-lg"
          onMouseEnter={safeOpen}
          onMouseLeave={safeClose}
        >
          <PaletteBtn
            active={my === "like"}
            label="Like"
            onClick={() => pick("like")}
          >
            <ThumbsUp className="w-4 h-4" />
          </PaletteBtn>
          <PaletteBtn
            active={my === "love"}
            label="Love"
            onClick={() => pick("love")}
          >
            <Heart className="w-4 h-4" />
          </PaletteBtn>
          <PaletteBtn
            active={my === "clap"}
            label="Clap"
            onClick={() => pick("clap")}
          >
            <Sparkles className="w-4 h-4" />
          </PaletteBtn>
        </div>
      )}
    </div>
  );
}

function PaletteBtn({
  children,
  onClick,
  active,
  label,
}: React.PropsWithChildren<{
  onClick: () => void;
  active?: boolean;
  label: string;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`p-2 rounded-full hover:bg-gray-700 text-white outline-none
        ${active && "bg-purple-600"}
      `}
    >
      {children}
    </button>
  );
}
