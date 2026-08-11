import { useEffect, useRef, useState } from 'react';
import type { Travel } from '../types/travel';
import { getMusicEmbedHtml } from '../utils/media';

export function useTravelAudio(travel: Travel | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlayDirectAudio, setCanPlayDirectAudio] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCanPlayDirectAudio(false);

    if (!travel?.music.url) return;

    const embed = getMusicEmbedHtml(travel.music.url);
    if (!embed || embed.type !== 'audio') return;

    const audio = new Audio(embed.src);
    audioRef.current = audio;
    audio.volume = 0.85;
    audio.loop = true;
    setCanPlayDirectAudio(true);

    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setIsPlaying(false);
      setCanPlayDirectAudio(false);
    };
  }, [travel]);

  const play = async () => {
    if (!audioRef.current) return;
    await audioRef.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const toggle = async () => {
    if (isPlaying) {
      pause();
      return;
    }
    await play();
  };

  return { canPlayDirectAudio, isPlaying, toggle };
}
