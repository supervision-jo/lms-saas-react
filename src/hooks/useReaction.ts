import { useState } from "react";
import { API_ENDPOINTS } from "../utils/constants";
import { useCustomPost } from "../hooks/useMutation";

export type ReactionType = "like" | "love" | "clap";
export type Subject = { kind: "question" | "answer"; id: number };

export function useReaction(opts: {
  subject: Subject;
  initCounts?: { like: number; love: number; clap: number };
  initMine?: ReactionType | null;
  onServerOk?: (next: ReactionType | null) => void;
}) {
  const { subject, initCounts, initMine = null, onServerOk } = opts;
  const [my, setMy] = useState<ReactionType | null>(initMine);
  const [counts, setCounts] = useState({
    like: initCounts?.like ?? 0,
    love: initCounts?.love ?? 0,
    clap: initCounts?.clap ?? 0,
  });

  const { mutateAsync, isPending } = useCustomPost(
    API_ENDPOINTS.toggleReaction,
    []
  );

  const keyPayload =
    subject.kind === "question"
      ? { question: subject.id }
      : { answer: subject.id };

  const apply = (next: ReactionType | null) => {
    // optimistic counts
    setCounts((c) => {
      const dec = (t: ReactionType) =>
        ({ ...c, [t]: Math.max(0, c[t] - 1) } as typeof c);
      const inc = (t: ReactionType) => ({ ...c, [t]: c[t] + 1 } as typeof c);

      let tmp = { ...c };
      if (my) tmp = dec(my); // remove previous pick
      if (next) tmp = inc(next); // add new pick
      return tmp;
    });
    setMy(next);
  };

  const send = async (next: ReactionType | null) => {
    const body = { ...keyPayload, type: next }; // null removes reaction
    try {
      await mutateAsync(body);
      onServerOk?.(next);
    } catch {
      // rollback on failure
      setCounts((c) => {
        // reverse the optimistic change
        const reverse = { like: c.like, love: c.love, clap: c.clap };
        if (next) reverse[next] = Math.max(0, reverse[next] - 1);
        if (my) reverse[my] = reverse[my] + 1;
        return reverse;
      });
      setMy(my); // restore
    }
  };

  const toggleDefaultLike = async () => {
    if (isPending) return;
    const next = my === "like" ? null : ("like" as ReactionType);
    apply(next);
    await send(next);
  };

  const pick = async (t: ReactionType) => {
    if (isPending) return;
    const next = my === t ? null : t;
    apply(next);
    await send(next);
  };

  return { my, counts, isPending, toggleDefaultLike, pick };
}
