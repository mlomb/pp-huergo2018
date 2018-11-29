#include <Servo.h>

int sensorA = 4;
int sensorB = 5;
int sensorC = 6;
int sensorD = 7;
int barrera_entrada_PIN = 10;
int barrera_salida_PIN = 11;
const int BUFFER_SIZE = 2;
unsigned char BUFFER[BUFFER_SIZE];
Servo barrera_entrada;
Servo barrera_salida;


void setup() {
  Serial.begin(9600);
  barrera_entrada.attach(barrera_entrada_PIN);
  barrera_salida.attach(barrera_salida_PIN);
  pinMode(sensorA, INPUT);
  pinMode(sensorB, INPUT);
  pinMode(sensorC, INPUT);
  pinMode(sensorD, INPUT);
  barrera_entrada.write(90);
  barrera_salida.write(90);
}

void loop() {
  while(Serial.available()) {
      BUFFER[1] = BUFFER[0];
      BUFFER[0] = Serial.read();

      Serial.println((int)BUFFER[0]);
      
      if(BUFFER[1] == 150 /* poner 150 */) { // es un mensaje para mi
        switch(BUFFER[0]) {
          case 100: // checkear si hay auto
          {
            bool hay_auto = digitalRead(sensorA) == LOW;
            Serial.write(150);
            if(hay_auto){
              if(digitalRead(sensorB) == LOW){
                Serial.write(20); //CAMIONETA
              }else{
                Serial.write(30); // AUTO
              }
            }else{
              Serial.write(10);  
            }
          }
          break;
          case 101: // levantar barrera ENTRADA
            barrera_entrada.write(0);
            
            while(digitalRead(sensorC) == HIGH) {};
            while(digitalRead(sensorC) == LOW) {};
            
            barrera_entrada.write(90);
          break;
          case 102: // levantar barrera SALIDA
            barrera_salida.write(180);
            
            while(digitalRead(sensorD) == HIGH) {};
            while(digitalRead(sensorD) == LOW) {};
            
            barrera_salida.write(90);
          break;
        }
      }
    }
}
/*ID ARDUINO ENTRADA 150
 * PREGUNTAR SI HAY AUTO 100
 * LEVANTAR BARRERA ENTRADA 101
 * LEVANTAR BARRERA SALIDA 102
 */
/*NUMEROS COMUNICACION
 * NUMERO 20 ES UNA CAMIONETA
 * NUMERO 30 ES UN AUTO
 * NUMERO 10 NO HAY HAY AUTO
 */
/*PINES ARDUINO
 * PIN 4 SENSOR QUE DETECTA SI HAY UN AUTO
 * PIN 5 SENSOR QUE DETECTA SI ES UNA CAMIONETA O UN AUTO
 * PIN 6 SENSOR QUE DETECTA SI EL AUTO YA PASO LA BARRERA
 * PIN 7 SENSOR QUE DETECTA BARRERA SALIDA
 * PIN 10 BARRERA DE ENTRADA
 * 
 */
