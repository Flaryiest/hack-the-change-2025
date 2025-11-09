import serial

class Pod:
    def __init__(self, port, baudrate=115200, timeout=1):
        self.ser = serial.Serial(port, baudrate, timeout=timeout)

    def send_command(self, command):
        self.ser.write((command + '\n').encode('utf-8'))

    def read_response(self):
        return self.ser.readline().decode('utf-8').strip()