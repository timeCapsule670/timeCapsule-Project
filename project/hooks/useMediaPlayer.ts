import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { ResizeMode, Video } from 'expo-av';

interface AudioPlayer {
  isLoaded: boolean;
  playing: boolean;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  replace: (uri: string) => Promise<void>;
  seekTo: (position: number) => Promise<void>;
}

interface VideoPlayer {
  isLoaded: boolean;
  playing: boolean;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  replaceAsync: (uri: string) => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  loop: boolean;
}

interface EventHookResult<T> {
  isPlaying: boolean;
  data: T;
}

export function useAudioPlayer(initialUri: string): AudioPlayer {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [sound]);

  const loadSound = async (uri: string) => {
    try {
      // Clean up existing sound before loading new one
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      setSound(newSound);
      setIsLoaded(true);
      setPlaying(false);
    } catch (error) {
      console.error('Error loading sound:', error);
      setIsLoaded(false);
      setPlaying(false);
    }
  };

  return {
    isLoaded,
    playing,
    play: async () => {
      try {
        if (sound && isLoaded) {
          await sound.playAsync();
          setPlaying(true);
        }
      } catch (error) {
        console.error('Error playing sound:', error);
        setPlaying(false);
      }
    },
    pause: async () => {
      try {
        if (sound && isLoaded) {
          await sound.pauseAsync();
          setPlaying(false);
        }
      } catch (error) {
        console.error('Error pausing sound:', error);
      }
    },
    replace: async (uri: string) => {
      await loadSound(uri);
    },
    seekTo: async (position: number) => {
      try {
        if (sound && isLoaded) {
          await sound.setPositionAsync(position);
        }
      } catch (error) {
        console.error('Error seeking sound:', error);
      }
    },
  };
}

export function useVideoPlayer(initialUri: string, onPlayerReady?: (player: VideoPlayer) => void): VideoPlayer {
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);

  // Cleanup function to properly release video resources
  useEffect(() => {
    return () => {
      if (video) {
        video.unloadAsync().catch(console.error);
      }
    };
  }, [video]);

  useEffect(() => {
    if (video && onPlayerReady) {
      onPlayerReady({
        isLoaded,
        playing,
        play: async () => {},
        pause: async () => {},
        replaceAsync: async () => {},
        seekTo: async () => {},
        loop,
      });
    }
  }, [video, isLoaded, onPlayerReady]);

  const loadVideo = async (uri: string) => {
    try {
      setIsLoaded(false);
      setPlaying(false);
      
      // Clean up existing video before loading new one
      if (video) {
        await video.unloadAsync();
        setVideo(null);
      }
      
      // Video loading would be handled by the Video component
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading video:', error);
      setIsLoaded(false);
      setPlaying(false);
    }
  };

  return {
    isLoaded,
    playing,
    play: async () => {
      try {
        if (video && isLoaded) {
          await video.playAsync();
          setPlaying(true);
        }
      } catch (error) {
        console.error('Error playing video:', error);
        setPlaying(false);
      }
    },
    pause: async () => {
      try {
        if (video && isLoaded) {
          await video.pauseAsync();
          setPlaying(false);
        }
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    },
    replaceAsync: async (uri: string) => {
      await loadVideo(uri);
    },
    seekTo: async (position: number) => {
      try {
        if (video && isLoaded) {
          await video.setPositionAsync(position);
        }
      } catch (error) {
        console.error('Error seeking video:', error);
      }
    },
    get loop() {
      return loop;
    },
    set loop(value: boolean) {
      setLoop(value);
    },
  };
}

export function useEvent<T>(
  player: AudioPlayer | VideoPlayer,
  eventName: string,
  initialData: T
): EventHookResult<T> {
  const [data, setData] = useState<T>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [player.playing]);

  return {
    isPlaying: player.playing,
    data,
  };
} 