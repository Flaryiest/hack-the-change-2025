import serial

class Pod:
    def __init__(self, port, baudrate=115200, timeout=1):
        self.ser = serial.Serial(port, baudrate, timeout=timeout)

    def send_command(self, command):
        self.ser.write((command + '\n').encode('utf-8'))

    def read_response(self):
        try:
            raw_data = self.ser.readline()
            if raw_data:
                return raw_data.decode('utf-8', errors='ignore').strip()
            return ""
        except UnicodeDecodeError:
            return ""