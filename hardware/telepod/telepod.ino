#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>

#define LORA_SCK   5
#define LORA_MISO  19
#define LORA_MOSI  27
#define LORA_NSS   18
#define LORA_RST   14
#define LORA_DIO0  26
#define BTN        13
#define LORA_BAND  915E6

String line;

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\nBooting...");

  pinMode(BTN, INPUT_PULLUP);

  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_NSS);
  LoRa.setPins(LORA_NSS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(LORA_BAND)) {
    Serial.println("LoRa init failed!");
    while (true) delay(1000);
  }

  LoRa.setSyncWord(0x34);
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  LoRa.enableCrc();
  LoRa.setTxPower(14);

  Serial.println("LoRa ready!");
}

void loop() {
  static bool last = HIGH;
  bool cur = digitalRead(BTN);
  if (cur != last) {
    last = cur;
    if (cur == LOW)
      Serial.println("BUTTON:PRESSED");
    else
      Serial.println("BUTTON:RELEASED");
  }

  while (Serial.available()) {
    char c = (char)Serial.read();
    line += c;
    if (c == '\n' || line.length() > 240) {
      LoRa.beginPacket();
      LoRa.print(line);
      LoRa.endPacket();
      Serial.print("SENT:");
      Serial.println(line);
      line = "";
    }
  }

  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String received = "";
    while (LoRa.available()) {
      received += (char)LoRa.read();
    }

    Serial.print("RECV:");
    Serial.println(received);
    Serial.print("RSSI:");
    Serial.println(LoRa.packetRssi());
    Serial.print("SNR:");
    Serial.println(LoRa.packetSnr());
  }

  delay(1);
}
