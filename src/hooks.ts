import { useEffect, useRef, useState } from 'react';
import type {
  SpeechModuleState,
  RecognizedEvent,
  StateChangeEvent,
  SpeechResponse,
} from './index';
import VoiceRecognizer, { ErrorEvent, Options, SpeechEvent } from './index';
import type { EmitterSubscription } from 'react-native';

let recognizeChannel = 1;
/**
 *   Get current module state and subsequent updates
 */
const useVoiceRecognizerState = () => {
  const [state, setState] = useState<SpeechModuleState>('NONE');

  useEffect(() => {
    async function updateState() {
      const moduleState = await VoiceRecognizer.getState();
      setState(moduleState);
    }

    updateState();

    const sub = VoiceRecognizer.onModuleStateChange((event) => {
      setState(event.state);
    });
    let handlerSubscription: EmitterSubscription;
    return () => {
      sub.remove();
      handlerSubscription?.remove();
    };
  }, []);

  return state;
};

/**
 * @description
 *   Attaches a handler to the given Speechace events and performs cleanup on unmount
 * @param {Array<string>} event - Speechace events to subscribe to
 * @param {(payload: any) => void} handler - callback invoked when the event fires
 */
const useVoiceRecognizerEvent = (
  event: SpeechEvent,
  handler: (event: any) => void
) => {
  const savedHandler = useRef();

  useEffect(() => {
    // @ts-ignore
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const sub = VoiceRecognizer.addListener(event, (payload) =>
      // @ts-ignore
      savedHandler.current(payload)
    );

    return () => {
      sub.remove();
    };
  }, [event]);
};

const useVoiceRecognizer = (textToScore?: string, options?: Options) => {
  const _channel = useRef(recognizeChannel++);
  const [state, setState] = useState<SpeechModuleState>('NONE');
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [response, setSpeechResponse] = useState<SpeechResponse | null>(null);

  useEffect(() => {
    let didCancel = false;
    const channelStateSubscription = VoiceRecognizer.addListener(
      'onModuleStateChange',
      ({ state: moduleState, channel }: StateChangeEvent) => {
        if (channel === _channel.current && !didCancel) {
          console.log('onModuleStateChange', moduleState, channel);
          setState(moduleState);
        }
      }
    );

    const recognizeChannelSubscription = VoiceRecognizer.addListener(
      'onSpeechRecognized',
      ({ filePath, response: speechResult, channel }: RecognizedEvent) => {
        if (channel === _channel.current && !didCancel) {
          console.log('onSpeechRecognized', filePath, speechResult, channel);
          setAudioFile(filePath);
          setSpeechResponse(speechResult);
        }
      }
    );

    const recognizeChannelErrorSubscription = VoiceRecognizer.addListener(
      'onError',
      (error: ErrorEvent) => {
        if (error.channel === _channel.current && !didCancel) {
          console.log(error);
          setState('NONE');
        }
      }
    );

    return () => {
      didCancel = true;
      channelStateSubscription.remove();
      recognizeChannelSubscription.remove();
      recognizeChannelErrorSubscription.remove();
    };
  }, []);

  const start = async () => {
    await VoiceRecognizer.start(_channel.current, textToScore, options);
  };

  const stop = async () => {
    await VoiceRecognizer.stop(_channel.current);
  };

  const cancel = async () => {
    await VoiceRecognizer.cancel(_channel.current);
  };

  return {
    state,
    audioFile,
    response,
    start,
    stop,
    cancel,
  };
};

export { useVoiceRecognizerState, useVoiceRecognizerEvent, useVoiceRecognizer };
