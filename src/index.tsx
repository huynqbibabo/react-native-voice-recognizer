import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
  Platform,
} from 'react-native';
import type {
  Options,
  SpeechModuleState,
  ErrorEvent,
  StateChangeEvent,
  VoiceStartEvent,
  VoiceEvent,
  VoiceEndEvent,
  ChannelSubscription,
  SpeechEvents,
  RecognizedEvent,
  SpeechEvent,
  TextScore,
  WordScore,
  SpeechResponse,
} from './types';

import {
  useVoiceRecognizerState,
  useVoiceRecognizerEvent,
  useVoiceRecognizer,
} from './hooks';

const VoiceRecognizerModule = NativeModules.VoiceRecognizer;
const VoiceRecognizerEmitter = new NativeEventEmitter(VoiceRecognizerModule);

class RNVoiceRecognizer {
  async start(channel?: number, textToScore?: string, options?: Options) {
    return await VoiceRecognizerModule.start(
      channel || 0,
      textToScore,
      Object.assign(
        {
          locale: 'en-US',
          RECOGNIZER_ENGINE: 'GOOGLE',
          EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
          EXTRA_MAX_RESULTS: 5,
          EXTRA_PARTIAL_RESULTS: true,
          REQUEST_PERMISSIONS_AUTO: true,
        },
        options
      )
    );
  }

  async stop(channel?: number) {
    return await VoiceRecognizerModule.stop(channel ?? 0);
  }

  async cancel(channel?: number) {
    return await VoiceRecognizerModule.cancel(channel ?? 0);
  }

  async release() {
    return await VoiceRecognizerModule.release();
  }

  async isAvailable() {
    return await VoiceRecognizerModule.isSpeechAvailable();
  }

  /**
   * (Android) Get a list of the speech recognition engines available on the device
   * */
  async getState(): Promise<SpeechModuleState> {
    return await VoiceRecognizerModule.getState();
  }

  async getSpeechRecognitionServices() {
    if (Platform.OS !== 'android') {
      return;
    }

    return await VoiceRecognizerModule.getSpeechRecognitionServices();
  }

  onVoiceStart = (fn: (e: VoiceStartEvent) => void): EmitterSubscription => {
    return VoiceRecognizerEmitter.addListener('onVoiceStart', fn);
  };

  onVoice(fn: (data: VoiceEvent) => void): EmitterSubscription {
    return VoiceRecognizerEmitter.addListener('onVoice', fn);
  }

  onVoiceEnd(fn: (e: VoiceEndEvent) => void): EmitterSubscription {
    return VoiceRecognizerEmitter.addListener('onVoiceEnd', fn);
  }

  onError(fn: (error: ErrorEvent) => void): EmitterSubscription {
    return VoiceRecognizerEmitter.addListener('onError', fn);
  }

  onModuleStateChange(fn: (e: StateChangeEvent) => void): EmitterSubscription {
    return VoiceRecognizerEmitter.addListener('onModuleStateChange', fn);
  }

  onSpeechRecognized(fn: (e: RecognizedEvent) => void): EmitterSubscription {
    return VoiceRecognizerEmitter.addListener('onSpeechRecognized', fn);
  }

  addListener(
    event: SpeechEvent,
    handler: (payload: any) => void
  ): EmitterSubscription {
    return VoiceRecognizerEmitter.addListener(event, handler);
  }
}

export type {
  Options,
  SpeechModuleState,
  ErrorEvent,
  StateChangeEvent,
  VoiceStartEvent,
  VoiceEvent,
  VoiceEndEvent,
  ChannelSubscription,
  SpeechEvents,
  RecognizedEvent,
  SpeechEvent,
  TextScore,
  WordScore,
  SpeechResponse,
};
export { useVoiceRecognizerState, useVoiceRecognizerEvent, useVoiceRecognizer };
const VoiceRecognizer = new RNVoiceRecognizer();
export default VoiceRecognizer;
