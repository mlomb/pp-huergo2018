
void setup() {
  Serial.begin(9600);
}

void loop() {
  while(Serial.available() >= 2) {
    char a = Serial.read();
    char b = Serial.read();
    Serial.write(a);
    Serial.write(random(1,3) == 1 ? 'L' : 'O');
  }
}

