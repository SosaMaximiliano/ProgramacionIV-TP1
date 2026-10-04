export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  tipoSangre: string;
  colorOjos: string;
  diasVacaciones: number;
}

export type DatosRegistro = Omit<Usuario, 'id'> & {
  password: string;
};
