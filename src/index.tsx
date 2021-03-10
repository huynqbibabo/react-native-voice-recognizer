import { NativeModules } from 'react-native';

type VoiceRecognizerType = {
  multiply(a: number, b: number): Promise<number>;
};

const { VoiceRecognizer } = NativeModules;

export default VoiceRecognizer as VoiceRecognizerType;
