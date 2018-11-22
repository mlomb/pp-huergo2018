const int BUFFER_SIZE = 2;
const int BUS_TIMEOUT = 20; // en ms
const unsigned char PLACAS = 40;
const unsigned char PLACAS_START = 200;

unsigned char BUFFER[BUFFER_SIZE];
unsigned long last_packet_time = 0;
unsigned char last_packet_id = 0;
unsigned char last_packet_data = 0;

unsigned char BUFFER_SERVER[BUFFER_SIZE];

bool barrer = true;
int barrido_last = -1;

unsigned char qid = 0, qdata = 0;

/*--------------  COCHERAS -------------- */
struct Cochera {
  bool last_estado = false; // true=libre
  unsigned char last_mode = 'x'; // 'r', 'a', 'n'

  unsigned char target_mode = 'n';
} cocheras[PLACAS + 5];

/*--------------  DISPLAYS -------------- */
struct Display {
  unsigned char id;
  int length;
  int write_pointer;
  char* text;
  bool written;
};

void initDisplay(unsigned char id, int length, Display& d) {
  d.id = id;
  d.length = length;
  d.text = new char[length];
  d.write_pointer = 0;
  d.written = false;
}

#define NUM_DISPLAYS 1
Display displays[NUM_DISPLAYS];
unsigned long last_displays_refresh = 0;

/*--------------  NUMERITOS -------------- */
struct Numerito {
  int start, end;
  int num;
  int last_num;
};

#define NUM_NUMERITOS 5
Numerito numeritos[NUM_NUMERITOS];
const unsigned char NUMERITOS_START = 170;

void setup() {
  const char* msg1 = "abcdefghi";
  initDisplay(150, 16, displays[0]);
  memcpy(displays[0].text, msg1, strlen(msg1));
  displays[0].write_pointer = strlen(msg1);

  numeritos[0] = { 200, 207 };
  numeritos[1] = { 208, 215 };
  numeritos[2] = { 220, 227 };
  numeritos[3] = { 228, 235 };
  numeritos[4] = { 200, 239 };
  //numeritos[5] = { 228, 235 };
  
  // Serial = Arduino y server
  Serial.begin(9600);
  // Serial1 = Arduino y maqueta
  Serial1.begin(9600);

  // Desreservar todas las placas al principio
  for(int i = 0; i < PLACAS; i++) {
    bus_send(i + PLACAS_START, 'n', false);
    delay(80);
  }

  // luces prendidas y lo demas apagado
  for(int i = 0; i < 6; i++) {
    bus_send(i + 160, 10, false);
    delay(80);
    bus_send(i + 160, 21, false);
    delay(80);
    bus_send(i + 160, 31, false);
    delay(80);
  }

  
  Serial.write(199); // INIT
}

void placa_estado(unsigned char id, unsigned char estado) {
    int nro_placa = id - PLACAS_START;
    bool libre = estado == 'L';
    if(cocheras[nro_placa].last_estado != libre) {
      // el estado cambio, actualizamos y notificamos al server
      Serial.write(id);
      Serial.write((libre ? 'L' : 'O'));
      cocheras[nro_placa].last_estado = libre;
    }
}

// esta funcion se llama cuando el bus esta libre
// se envia el ASCII a un display, por ejemplo
// si no hay nada para hacer, se sigue con el barrido
void bus_next() {
  // TODO hacer otras cosas
  if(qid > 0) {
    /*
    Serial.println("ID: ");
    Serial.print(qid);
    Serial.println("DATA: ");
    Serial.println(qdata);
    */
    bus_send(qid, qdata, false);
    qid = 0;
    qdata = 0;
    delay(400);
    return;
  }

  for(int i = 0; i < NUM_DISPLAYS; i++) {
    if(!displays[i].written) {
      const int display_delay = 100;
      
      bus_send(displays[i].id, displays[i].write_pointer == 0 ? 10 : 13, false);
      delay(display_delay);
      
      for(int j = 0; j < displays[i].write_pointer; j++) {
        bus_send(displays[i].id, displays[i].text[j], false);
        delay(display_delay);
      }
      displays[i].written = true;
      return;
    }
  }

  for(int i = 0; i < NUM_NUMERITOS; i++) {
    numeritos[i].num = 0;
    for(int id = numeritos[i].start - PLACAS_START; id <= numeritos[i].end - PLACAS_START; id++) {
      if(cocheras[id].last_mode == 'n' && cocheras[id].last_estado)
        numeritos[i].num++;
    }
    if(numeritos[i].num != numeritos[i].last_num) {
      bus_send(i + NUMERITOS_START, (unsigned char)numeritos[i].num, false);
      numeritos[i].last_num = numeritos[i].num;
      delay(80);
    }
  }

  // plaquetas modos
  for(int i = 0; i < PLACAS; i++) {
    Cochera& c = cocheras[i];
    if(c.last_mode != c.target_mode) {
      bus_send(i + PLACAS_START, c.target_mode, true);
      c.last_mode = c.target_mode;
      delay(80);
      return;
    }
  }

  if(barrer) {
    // si no hay otra cosa que mandar
    // seguimos barriendo
    barrido_last++;
    
    if(barrido_last <= PLACAS) {
      // cocheras
      bus_send(barrido_last + PLACAS_START, 'e', true);
    } else if(barrido_last <= PLACAS + 6) { // +1 cantidad de utilities
      // botones de panico
      bus_send(barrido_last - PLACAS - 1 + 160, '(', true);
    } else {
      barrido_last = -1;
    }
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
  } else if(id >= 160) {
    if(data == 'S') {
      Serial.write((unsigned char)id);
      Serial.write('S');
    }
  } else {
    // si es el paquete de cualquier otro modulo, se reenvia al server
    Serial.write((unsigned char)id);
    Serial.write((unsigned char)data);
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
      
      if(BUFFER[1] >= 150) {
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
    
    if(BUFFER_SERVER[0] == 0) { // init
        Serial.write(199);
        for(int i = 0; i < PLACAS; i++) {
          Serial.write(PLACAS_START + i);
          Serial.write((cocheras[i].last_estado ? 'L' : 'O'));
        }
    } else if(BUFFER_SERVER[0] == 198) { // barrer true
      barrer = true;
    } else if(BUFFER_SERVER[0] == 197) { // barrer false
      barrer = false;
    } else {
      bool handled = false;
      unsigned char id = BUFFER_SERVER[1];
      unsigned char data = BUFFER_SERVER[0];
      
      for(int i = 0; i < NUM_DISPLAYS; i++) {
        if(displays[i].id == id) {
          if(data == 13) {
            displays[i].write_pointer = 0;
            for(int j = 0; j < displays[i].length; j++) {
              displays[i].text[j] = ' ';
            }
            displays[i].written = false;
          } else {
            if(displays[i].write_pointer < displays[i].length) {
              displays[i].text[displays[i].write_pointer++] = data;
              displays[i].written = false;
            }
          }
          handled = true;
          break;
        }
      }
      
      if(!handled) {
        // forward
        if(id >= 200) {
          if(data == 110 || data == 114 || data == 97) {
            cocheras[id - PLACAS_START].target_mode = data;
            continue;
          }
        }
        if(id >= 150 && qid == 0) {
          qid = id;
          qdata = data;
        }
      }
    }
  }
}

void periodic() {
  unsigned long now = millis();

  if((now - last_displays_refresh) > 5000) {
    for(int i = 0; i < NUM_DISPLAYS; i++) {
      displays[i].write_pointer = 0;
      displays[i].written = false;
    }
    for(int i = 0; i < NUM_NUMERITOS; i++) {
      numeritos[i].last_num = -1;
    }

    last_displays_refresh = now;
    /*
    // TEST
    for(int i = 0 ; i < PLACAS; i++) {
      cocheras[i].target_mode = cocheras[i].target_mode == 'n' ? 'a' : 'n';
    }
    */
  }
}

void loop() {
  periodic();
  sv_loop();
  bus_loop();
}

