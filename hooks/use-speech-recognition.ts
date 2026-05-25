"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function joinTranscript(parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
}

type Options = {
  lang?: string;
  /** When true, each final segment invokes onFinal (legacy). Default false. */
  submitOnFinal?: boolean;
  /** Default false — browser stops on pause (end of utterance). */
  continuous?: boolean;
  onFinal?: (transcript: string) => void;
  /** Live updates while listening (accumulated finals + interim). */
  onTranscript?: (text: string) => void;
  /** Fired when the browser ends the session (pause / end of speech). Not fired after cancel(). */
  onUtteranceComplete?: (text: string) => void;
};

export function useSpeechRecognition(options?: Options) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedRef = useRef("");
  const cancelledRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const submitOnFinal = options?.submitOnFinal ?? false;

  useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor());
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    recognitionRef.current?.abort();
    accumulatedRef.current = "";
    setInterim("");
    setListening(false);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    setError(null);
    setInterim("");
    accumulatedRef.current = "";
    cancelledRef.current = false;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new Ctor();
    recognition.lang = optionsRef.current?.lang ?? "en-US";
    recognition.continuous = submitOnFinal
      ? (optionsRef.current?.continuous ?? false)
      : (optionsRef.current?.continuous ?? false);
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      const newFinals: string[] = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const chunk = r[0]?.transcript ?? "";
        if (r.isFinal) newFinals.push(chunk);
        else interimText += chunk;
      }

      if (newFinals.length > 0) {
        accumulatedRef.current = joinTranscript([
          accumulatedRef.current,
          ...newFinals,
        ]);
      }

      setInterim(interimText);

      const live = joinTranscript([accumulatedRef.current, interimText]);
      if (submitOnFinal) {
        for (const f of newFinals) {
          const t = f.trim();
          if (t) optionsRef.current?.onFinal?.(t);
        }
      } else if (live) {
        optionsRef.current?.onTranscript?.(live);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        setError(event.error || "Speech recognition failed");
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");

      if (cancelledRef.current) {
        cancelledRef.current = false;
        return;
      }

      const text = accumulatedRef.current.trim();
      if (!text) return;

      if (submitOnFinal) {
        optionsRef.current?.onFinal?.(text);
      } else {
        optionsRef.current?.onUtteranceComplete?.(text);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [submitOnFinal]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    supported,
    listening,
    interim,
    error,
    start,
    stop,
    cancel,
  };
}
