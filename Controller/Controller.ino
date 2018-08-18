const int BUFFER_SIZE = 2;
const int BUS_TIMEOUT = 5; // en ms
const int PLACAS = 8; // TODO Cambiar a 40
const int PLACAS_START = 49; // TODO Cambiar a 200

int BUFFER[BUFFER_SIZE];
unsigned long last_packet_time = 0;
int last_packet_id = 0;

int barrido_last = PLACAS_START;
bool barrido[PLACAS]; // guarda el estado de las placas | true=libre

void setup() {
  // Serial = Arduino y server
  Serial.begin(9600);
  // Serial1 = Arduino y maqueta
  Serial1.begin(9600);
}

// esta funcion se llama cuando el bus esta libre
// se envia el ASCII a un display, por ejemplo
// si no hay nada para hacer, se sigue con el barrido
void bus_next() {
  // TODO hacer otras cosas

  // si no hay otra cosa que mandar
  // seguimos barriendo
  barrido_last++;
  if(barrido_last > PLACAS_START + PLACAS)
    barrido_last = PLACAS_START;
  bus_send(barrido_last, 'e');
}

// se intenta comunicar con el modulo ID y envia data
// solo tiene que ser llamada desde bus_next
// esto setea last_packet_* y esperara a que el bus responda
// antes de volver a llamar a bus_next
void bus_send(int id, char data) {
  Serial1.write(id);
  Serial1.write(data);
  last_packet_id = id;
  last_packet_time = millis();
}

// esto se llama cuando el modulo ID envia el dato data
void bus_receive(int id, char data) {
  if(id >= 200) {
    // es el paquete de una cochera
    int nro_placa = id - PLACAS_START;
    bool estado = data == 'l';

    if(barrido[nro_placa] != estado) {
      // el estado cambio, actualizamos y notificamos al server
      Serial.write((char)id);
      Serial.write((char)data);
      barrido[nro_placa] = estado;
    }
    
  } else {
    // si es el paquete de cualquier otro modulo, se reenvia al server
    Serial.write((char)id);
    Serial.write((char)data);
  }
}

// este lazo maneja la llegada de paquetes del bus
// al hablarle a un modulo, esperamos a que responda
// si no responde, cae TIMEOUT y se llama bus_next
void bus_loop() {
  unsigned long now = millis();
  unsigned long delta = (now - last_packet_time);

  if(delta > BUS_TIMEOUT) {
    // el modulo que se hablo ultimo no respondio en BUS_TIMEOUT ms
    // asumimos que no va a responder y seguimos usando el bus para otra cosa
    bus_next();
  } else {
    // hay algo para leer del bus?
    while(Serial1.available()) {
      // por ahora BUFFER_SIZE es 2 y lo unico que hace es
      // BUFFER[1] = BUFFER[0], efectivamente empujando el ultimo byte
      // y leyendo nueva data a BUFFER[0]
      for(int i = 0; i < BUFFER_SIZE - 1; i++) {
        BUFFER[i + 1] = BUFFER[i];
      }
      BUFFER[0] = Serial1.read();

      if(BUFFER[1] >= 200) {
        // si es >= siginifica que tenemos un paquete valido en BUFFER
        
        // lo procesamos
        bus_receive((char)BUFFER[1], (char)BUFFER[0]);

        // si respondio el modulo que le hablamos recien seguimos
        if(BUFFER[1] == last_packet_id) {
          bus_next();
        }
      }
    }
  }
}

void sv_loop() {
  // TODO Que lea lo que le manda el server y lo reenvie al bus
}

void loop() {
  sv_loop();
  bus_loop();
}

