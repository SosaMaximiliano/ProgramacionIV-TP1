import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function edadMinimaValidator(edadMinima: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as string;

    if (!valor) return null;

    const nacimiento = new Date(`${valor}T00:00:00`);
    const hoy = new Date();

    if (Number.isNaN(nacimiento.getTime())) {
      return { fechaInvalida: true };
    }

    if (nacimiento > hoy) {
      return { fechaFutura: true };
    }

    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const todaviaNoCumplio =
      hoy.getMonth() < nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

    if (todaviaNoCumplio) edad--;
    return edad >= edadMinima ? null : { edadMinima: { requerida: edadMinima, actual: edad } };
  };
}
