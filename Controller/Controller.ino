const int BUFFER_SIZE = 2;
const int BUS_TIMEOUT = 20; // en ms
const unsigned char PLACAS = 16;
const unsigned char PLACAS_START = 200;

unsigned char BUFFER[BUFFER_SIZE];
unsigned long last_packet_time = 0;
unsigned char last_packet_id = 0;
unsigned char last_packet_data = 0;

unsigned char BUFFER_SERVER[BUFFER_SIZE];

unsigned char barrido_last = PLACAS_START;
bool barrido[PLACAS]; // guarda el estado de las placas | true=libre

bool barrer = true;
unsigned char qid = 0, qdata = 0;

void setup() {
  // Serial = Arduino y server
  Serial.begin(9600);
  // Serial1 = Arduino y maqueta
  Serial1.begin(9600);
}

void placa_estado(unsigned char id, unsigned char estado) {
    int nro_placa = id - PLACAS_START;
    bool libre = estado == 'L';
    if(barrido[nro_placa] != libre) {
      // el estado cambio, actualizamos y notificamos al server
      Serial.write(id);
      Serial.write((libre ? 'L' : 'O'));
      barrido[nro_placa] = libre;
    }
}

// esta funcion se llama cuando el bus esta libre
// se envia el ASCII a un display, por ejemplo
// si no hay nada para hacer, se sigue con el barrido
void bus_next() {
  // TODO hacer otras cosas
  if(qid > 0) {
    bus_send(qid, qdata, true);
    qid = 0;
    qdata = 0;
    delay(BUS_TIMEOUT);
    return;
  }

  if(barrer) {
    // si no hay otra cosa que mandar
    // seguimos barriendo
    barrido_last++;
    if(barrido_last >= PLACAS_START + PLACAS)
      barrido_last = PLACAS_START;
    bus_send(barrido_last, 'e', true);
  }
}

// se intenta comunicar con el modulo ID y envia data
// solo tiene que ser llamada desde bus_next
// esto setea last_packet_* y esperara a que el bus responda
// antes de volver a llamar a bus_next
void bus_send(unsigned char id, unsigned char data, bool wait_for_response) {
  Serial1.write(id);
  Serial1.write(data);

  /*
  if(data != 'e') {
  Serial.print("Enviado: ");
  Serial.print(id);
  Serial.print(",");
  Serial.print(data);
  Serial.println("");
  }
  */
  
  if(wait_for_response) {
    last_packet_id = id;
    last_packet_data = data;
    last_packet_time = millis();
  } else {
    last_packet_id = 0;
    last_packet_data = 0;
    last_packet_time = 0;
  }
}

// esto se llama cuando el modulo ID envia el dato data
void bus_receive(unsigned char id, unsigned char data) {
  if(id >= PLACAS_START) {
    // es el paquete de una cochera
    if(data == 'O' || data == 'L')
      placa_estado(id, data);
  } else {
    // si es el paquete de cualquier otro modulo, se reenvia al server
    //Serial.write((char)id);
    //Serial.write((char)data);
    Serial.write(0);
    Serial.write(1);
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

    // antes nos fijamos si nos tenia que responder una placa
    if(last_packet_id >= PLACAS_START && last_packet_data == 'e') {
      // si no nos repondio, significa que se desconecto, la marcamos como ocupada
      placa_estado(last_packet_id, 'O');
    }
    
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
      
      if(BUFFER[1] >= PLACAS_START) {
        // si es >= siginifica que tenemos un paquete valido en BUFFER
        
        // lo procesamos
        bus_receive(BUFFER[1], BUFFER[0]);
        bus_next();
      }
    }
  }
}

void sv_loop() {
  // TODO Que lea lo que le manda el server y lo reenvie al bus
  while(Serial.available()) {
    for(int i = 0; i < BUFFER_SIZE - 1; i++) {
      BUFFER_SERVER[i + 1] = BUFFER_SERVER[i];
    }
    BUFFER_SERVER[0] = Serial.read();

    if(BUFFER_SERVER[0] == 199) { // init
        for(int i = 0; i < PLACAS; i++) {
          Serial.write(PLACAS_START + i);
          Serial.write((barrido[i] ? 'L' : 'O'));
        }
    } else if(BUFFER_SERVER[0] == 198) { // toggle barrer
      barrer = !barrer;
    } else {
      // forward
      if(BUFFER_SERVER[1] >= 150 && qid == 0) {
        qid = BUFFER_SERVER[1];
        qdata = BUFFER_SERVER[0];
      }
    }
  }
}

void loop() {
  sv_loop();
  bus_loop();
}

