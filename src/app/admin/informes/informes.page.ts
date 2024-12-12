import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/common/services/auth.service';
import { PdfGeneratorService } from 'src/app/common/services/pdf-generator.service';

@Component({
  selector: 'app-informes',
  templateUrl: './informes.page.html',
  styleUrls: ['./informes.page.scss'],
})
export class InformesPage implements OnInit {

  public tiposInformes: any = [];
  userRole: string | null = null;
  usuario: { nombre: string; email: string | null; apellido?: string; raza: string; role?: string; } = {
    nombre: 'Forastero',
    email: null,
    raza: 'Soldado de clase baja',
  };

  // Estado del modal y fecha seleccionada
  isDatePickerOpen = false;
  selectedDates: string[] = [];
  formattedDates: string[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private pdfService: PdfGeneratorService
  ) { }

  async ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.usuario.nombre = user.displayName;
        this.usuario.email = user.email;

        this.firestore.collection('usuarios').doc(user.uid).valueChanges().subscribe((usuarioData: any) => {
          if (usuarioData) {
            this.usuario.apellido = usuarioData.apellido;
            this.usuario.raza = usuarioData.raza;
            this.usuario.role = usuarioData.role;
            this.userRole = usuarioData.role;
          }
          this.loadAppPagesAdmin();
        });
      } else {
        console.log('No hay usuario autenticado');
        this.loadAppPagesAdmin();
      }
    });
  }

  loadAppPagesAdmin() {
    if (this.userRole === 'admin') {
      this.tiposInformes.push({ title: 'Fecha de creación de personajes', subtitle: 'Generar informe', icon: 'document'});
      this.tiposInformes.push({ title: 'Todos los Personajes', subtitle: 'Generar informe', icon: 'document'});
    }
  }

  // Abre el modal de fecha
  openDatePicker() {
    this.isDatePickerOpen = true;
  }

  // Método para manejar las fechas seleccionadas en el componente hijo
  onDateSelected(dates: string[]) {
    this.selectedDates = dates;
    this.formattedDates = dates.length === 2 ? dates : ['Selecciona un rango'];
  }

  // Método para cerrar el modal de fecha (cuando se cierra desde el componente hijo)
  closeDatePicker() {
    this.isDatePickerOpen = false;
  }

  // Método que se llama al hacer clic en "Generar"
  generateReportPorFecha(event: Event) {
    event.stopPropagation();
    if (this.formattedDates.length === 2) {
      const [startDate, endDate] = this.formattedDates;
      this.pdfService.generatePdfFecha(startDate, endDate); // Llama al servicio para generar el PDF
    } else {
      console.log('Por favor, selecciona un rango de fechas válido');
    }
  }

  generatePdfBasico(){
    this.pdfService.generatePdfTodos()
  }

  generatePdfFull(){
    this.pdfService.generatePdfPorVariasSecciones()
  }


}
