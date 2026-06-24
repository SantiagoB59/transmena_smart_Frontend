export interface Viaje {

  id?: number;

  vehiculo_id: number;
  remolque_id?: number;

  conductor: string;
  cc_conductor?: string;

  origen: string;
  destino: string;

  km_salida: number;
  km_llegada?: number;
  km_recorrido?: number;

  estado: 'PROGRAMADO' | 'EN_RUTA' | 'FINALIZADO';

  created_at?: string;
}