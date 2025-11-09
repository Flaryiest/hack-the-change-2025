from vosk import Model, KaldiRecognizer
import pyaudio
from gtts import gTTS
import os
from io import BytesIO
import pygame
import time
import threading
import json
import wave

from src import Pod
HEIGHT = 480
WIDTH = 800

model_path = r"C:\Users\itsro\Documents\GitHub\hack-the-change-2025\hardware\software\models\vosk-model-small-fr-0.22" 

pygame.init()
displays = pygame.display.list_modes()
screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN, display=1)
language = "fr"
pygame.display.set_caption("telepod display")

model = Model(model_path)
recognizer = KaldiRecognizer(model, 16000)
mic = pyaudio.PyAudio()

run = True
current = "contact"
screen_lock = threading.Lock()

def microphone():
    global current
    pod = Pod("COM3")
    
    CHUNK = 8192
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000
    
    while run:
        try:
            message = pod.read_response()
            
            if message.startswith("BUTTON:"):
                if message.strip() == "BUTTON:PRESSED":
                    print("Button pressed - starting recording")
                    with screen_lock:
                        current = "recording"
                    
                    recorded_frames = []
                    
                    stream = mic.open(format=FORMAT,
                                    channels=CHANNELS,
                                    rate=RATE,
                                    input=True,
                                    frames_per_buffer=CHUNK,
                                    input_device_index=1)
                    
                    print("waiting for button release")
                    
                    while run:
                        try:
                            data = stream.read(CHUNK, exception_on_overflow=False)
                            recorded_frames.append(data)
                            
                            if pod.ser.in_waiting > 0:
                                release_msg = pod.read_response()
                                if "BUTTON:RELEASED" in release_msg:
                                    print("\nButton released!")
                                    break
                            
                        except Exception as e:
                            print(f"Recording error: {e}")
                            break
                    
                    stream.stop_stream()
                    stream.close()
                    stream = None
                    
                    with screen_lock:
                        current = "response"
                    
                    if recorded_frames:
                        print("processing...")
                        
                        with screen_lock:
                            current = "loading"

                        audio_data = b''.join(recorded_frames)
                        temp_audio_file = "temp_recording.wav"
                        
                        with wave.open(temp_audio_file, 'wb') as wav_file:
                            wav_file.setnchannels(CHANNELS)
                            wav_file.setsampwidth(2)
                            wav_file.setframerate(RATE)
                            wav_file.writeframes(audio_data)
                        
                        print(f"Audio saved to {temp_audio_file}, analyzing...")
                        
                        text_parts = []
                        
                        process_recognizer = KaldiRecognizer(model, RATE)
                        
                        chunk_size = 8192
                        with open(temp_audio_file, "rb") as audio_file:
                            audio_file.seek(44)
                            
                            while True:
                                data = audio_file.read(chunk_size)
                                if len(data) == 0:
                                    break
                                    
                                if process_recognizer.AcceptWaveform(data):
                                    result = json.loads(process_recognizer.Result())
                                    if result['text']:
                                        text_parts.append(result['text'])
                                        print("Final:", result['text'])
                                else:
                                    partial_result = json.loads(process_recognizer.PartialResult())
                                    if partial_result['partial']:
                                        print("Partial:", partial_result['partial'])
                        
                        final_result = json.loads(process_recognizer.FinalResult())
                        if final_result.get('text', '').strip():
                            text_parts.append(final_result['text'])
                            print("Final result:", final_result['text'])
                        
                        full_text = " ".join(text_parts).strip()
                        print(f"Complete transcription: '{full_text}'")
                        
                        if full_text:
                            print(f"Sending: '{full_text}'")
                            pod.send_command(full_text)
                            with screen_lock:
                                current = "loading"
                        else:
                            print("No text recognized")
                            with screen_lock:
                                current = "press"
                    else:
                        print("No audio recorded")
                        with screen_lock:
                            current = "press"
            
            elif message.startswith("RECV:"):
                incoming_text = message[5:].strip()
                print(f"Received message: '{incoming_text}'")
                
                play_tts(incoming_text)
            
            elif message.startswith("SENT:"):
                sent_text = message[5:].strip()
                print(f"Message sent: '{sent_text}'")
                with screen_lock:
                    current = "sent"
                time.sleep(1.5)
                with screen_lock:
                    current = "messages"
            
            elif message.startswith("RSSI:") or message.startswith("SNR:"):
                print(f"Signal strength: {message.strip()}")
            
                        
        except Exception as e:
            print(f"Error in microphone: {e}")
            time.sleep(0.1)

def play_tts(text):
    global current
    
    try:
        with screen_lock:
            current = "loading"
        
        mp3_fp = BytesIO()
        obj = gTTS(text=text, lang=language, slow=False)
        obj.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        with screen_lock:
            current = "tts"
        
        pygame.mixer.music.load(mp3_fp)
        pygame.mixer.music.play()
        
        while pygame.mixer.music.get_busy():
            pygame.time.wait(100)
        
        with screen_lock:
            current = "press"
            
    except Exception as e:
        print(f"TTS Error: {e}")
        with screen_lock:
            current = "messages"

def main():
    global current
    pygame.mixer.init()

    images = {
        "contact": "images/contact.png",
        "messages": "images/awaiting.png",
        "listening": "images/recording.png",
        "tts": "images/response.png",
        "press": "images/press.png",
        "loading": "images/loading.png",
        "sent": "images/sent.png"
    }
    
    mic_thread = threading.Thread(target=microphone, daemon=True)
    mic_thread.start()

    t = time.time()
    while True:
        screen.fill((255, 255, 255))
        
        with screen_lock:
            image_key = current
        
        if image_key in ["contact", "press"]:
            dt = time.time() - t
            if dt > 4:
                t = time.time()
                image_key = "contact"
                with screen_lock:
                    current = "contact"
            elif dt > 2:
                image_key = "press"
                with screen_lock:
                    current = "press"
            else:
                image_key = "contact"

        if image_key in images:
            try:
                img = pygame.image.load(images[image_key])
                screen.blit(img, (0, 0))
            except pygame.error as e:
                print(f"Could not load image {images[image_key]}: {e}")
                if image_key == "listening":
                    screen.fill((255, 0, 0))
                elif image_key == "tts":
                    screen.fill((0, 255, 0))
                elif image_key == "loading":
                    screen.fill((0, 0, 255))
                elif image_key == "sent":
                    screen.fill((255, 255, 0))
                elif image_key == "press":
                    screen.fill((255, 165, 0))
                else:
                    screen.fill((255, 255, 255))

        pygame.display.flip()
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                global run
                run = False
                return

if __name__ == "__main__":
    main()