export interface Resena {
  id: number;
  usuarioId: string;
  puntuacion: number;
  comentario: string | null;
  fechaCreacion: string;
}
