import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
})
export class DateRangePickerComponent {
  constructor(private toastController: ToastController) { }

  @Input() isOpen: boolean = false;  // Controla si el modal está abierto
  @Output() closeModal = new EventEmitter<void>();  // Emitir evento cuando se cierra el modal
  @Output() dateSelected = new EventEmitter<string[]>();  // Emitir las fechas seleccionadas
  selectedDates: string[] = [];
  formattedDates: string[] = [];

  // Método para cerrar el modal
  closeDatePicker() {
    this.isOpen = false;
    this.closeModal.emit();  // Emitir evento de cierre
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  // Método para manejar los cambios en el rango de fechas
  onDateRangeChange(event: any) {
    const selected = event.detail.value;
    if (selected && selected.length === 2) {
      const startDate = new Date(selected[0]);
      const endDate = new Date(selected[1]);

      // Validar que la fecha de inicio no sea posterior a la fecha de fin
      if (startDate > endDate) {
        this.presentToast('La fecha de inicio no puede ser posterior a la fecha de fin.');
        return;
      }

      this.selectedDates = selected;
      this.formattedDates = [selected[0], selected[1]];
      this.dateSelected.emit(this.selectedDates);
    }
  }
}  
