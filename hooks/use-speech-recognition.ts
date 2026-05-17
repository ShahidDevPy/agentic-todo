"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

type Options = {
  lang?: string;
  continuous?: boolean;
  onFinal?: (transcript: string) => void;
};

export function useSpeechRecognition(options?: Options) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor());
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    setError(null);
    setInterim("");
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new Ctor();
    recognition.lang = options?.lang ?? "en-US";
    recognition.continuous = options?.continuous ?? false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0]?.transcript ?? "";
        else interimText += r[0]?.transcript ?? "";
      }
      setInterim(interimText || finalText);
      if (finalText.trim()) {
        options?.onFinal?.(finalText.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error || "Speech recognition failed");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [options?.continuous, options?.lang, options?.onFinal]);

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
  };
}
