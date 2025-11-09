from vosk import Model, KaldiRecognizer
import pyaudio
import json

model_path = r"C:\Users\itsro\Documents\GitHub\hack-the-change-2025\hardware\software\models\vosk-model-small-fr-0.22"
 
model = Model(model_path)

# 2. Configure PyAudio for microphone input
CHUNK = 8192
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000 # Sample rate of the Vosk model

p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

# 3. Initialize Vosk Recognizer
recognizer = KaldiRecognizer(model, RATE)

print("Listening... Press Ctrl+C to stop.")

try:
    while True:
        data = stream.read(CHUNK)
        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())
            if result['text']:
                print("Final:", result['text'])
        else:
            partial_result = json.loads(recognizer.PartialResult())
            if partial_result['partial']:
                print("Partial:", partial_result['partial'])

except KeyboardInterrupt:
    print("\nStopping.")
finally:
    # 4. Clean up resources
    stream.stop_stream()
    stream.close()
    p.terminate()