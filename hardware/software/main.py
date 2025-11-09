from vosk import Model, KaldiRecognizer
import pyaudio
from gtts import gTTS
import os
from io import BytesIO
import pygame
import time

from src import *
HEIGHT = 480
WIDTH = 800

model_path = r"C:\Users\itsro\Documents\GitHub\hack-the-change-2025\hardware\software\models\vosk-model-small-fr-0.22" 

pygame.init()
displays = pygame.display.list_modes()
screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN, display=1)
language = "fr"
pygame.display.set_caption("telepod display")

def main():
    pygame.mixer.init()

    images = {"contacts": "images/i1.png",
              "messages": "images/i2.png",
              "listening": "images/i3.png",}
    
    model = Model(model_path)
    recognizer = KaldiRecognizer(model, 16000)
    mic = pyaudio.PyAudio()
    stream = mic.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=8192)
    stream.start_stream()

    t = time.time()
    while True:
        screen.fill((255, 255, 255))
        dt = time.time() - t
        if dt > 2:
            if dt > 4:
                t = time.time()
                img = pygame.image.load(images["contacts"])
        else:
            img = pygame.image.load(images["messages"])
        screen.blit(img, (0, 0))
        pygame.display.flip()
        
        data = stream.read(4096, exception_on_overflow=False)
        if recognizer.AcceptWaveform(data):
            result = recognizer.Result()
            transcribed_text = result[14:-3]

            if transcribed_text != "":
                print(f"'{transcribed_text}'")
                
                #cereate a memory buffer 
                mp3_fp = BytesIO()
                myobj = gTTS(text=transcribed_text, lang=language, slow=False)
                myobj.write_to_fp(mp3_fp)
                mp3_fp.seek(0)
                
                pygame.mixer.music.load(mp3_fp)
                pygame.mixer.music.play()
                
                while pygame.mixer.music.get_busy():
                    pygame.time.wait(100)

if __name__ == "__main__":
    main()