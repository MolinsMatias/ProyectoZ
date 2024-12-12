import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { PersonajeI } from 'src/app/common/models/personajes.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AuthService } from 'src/app/common/services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserCredential } from 'firebase/auth'; // Línea correcta
import { User } from 'firebase/auth'; // Asegúrate de tener esta importación
import { Router } from '@angular/router';
import { QrScannerComponent } from 'src/app/common/components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-lista-personaje',
  templateUrl: './lista-personaje.page.html',
  styleUrls: ['../personaje.page.scss'],
})
export class ListaPersonajePage implements OnInit {
  busquedaPersonajes: PersonajeI[] = [];
  personajes: PersonajeI[] = [];
  newPersonaje: PersonajeI;
  cargando: boolean = false;
  userRole: string | null = null;
  isAuthenticated: boolean = false;
  isScannerVisible = false;

  constructor(
    private firestoreService: FirestoreService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private cd: ChangeDetectorRef,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.isAuthenticated = true; // Usuario autenticado
      } else {
        this.isAuthenticated = false; // No hay usuario autenticado
      }
    });

  }

  ionViewWillEnter() {
    // Llamar a los métodos para cargar el rol del usuario y los personajes cada vez que se accede a la página
    this.loadUserRoleAndPersonajes();
  }
async agregarAFavoritos(personaje: PersonajeI) {
  const user = await this.afAuth.currentUser; // Obtener el usuario autenticado
  if (user) {
    const email = user.email; // Obtener el correo del usuario

    // Crear el documento en la colección 'favoritos' con el ID del usuario
    this.firestoreService
      .createDocument({
        ...personaje, // Copiamos los datos del personaje
        usuarioEmail: email // Agregamos el correo del usuario
      }, `favoritos/${email}/personajes/${personaje.id}`) // Usamos una ruta única basada en el correo del usuario y el id del personaje
      .then(() => {
        console.log('Personaje agregado a favoritos con éxito');
      })
      .catch((error) => {
        console.error('Error al agregar el personaje a favoritos:', error);
      });
  } else {
    console.log('No hay usuario autenticado.');
  }
}

  private async loadUserRoleAndPersonajes() {
    await this.getUserRole(); // Obtener el rol del usuario
    await this.loadPersonajes(); // Cargar los personajes
    
    this.cd.detectChanges(); // Forzar la detección de cambios
  }

  private async getUserRole() {
    const user = await this.afAuth.currentUser; // Obtener el usuario actual
    if (user) {
      this.userRole = await this.authService.getRole(user.uid); // Obtener el rol del usuario
    }
  }

  private async loadPersonajes() {
    const loading = await this.showLoading(); // Esperar a que el cargador sea presentado
    this.firestoreService.getCollectionChanges<PersonajeI>('Personajes', 'nombre').subscribe({
      next: cambios => {
        if (cambios) {
          this.personajes = cambios;
          this.busquedaPersonajes = [...this.personajes];
          this.getUserRole();
          this.cd.detectChanges(); // Forzar la detección de cambios
        }
        loading.dismiss(); // Cerrar el cargador cuando los datos son cargados
      },
      error: err => {
        console.error('Error loading personajes:', err);
        loading.dismiss(); // Cerrar el cargador en caso de error
      }
    });
  }

  handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.busquedaPersonajes = query
      ? this.personajes.filter(personaje =>
          personaje.nombre.toLowerCase().includes(query)
        )
      : [...this.personajes];
  }

  edit(personaje: PersonajeI) {
    this.personajes.forEach(p => (p.isEditing = false));
    personaje.isEditing = true;
  }

  confirmarEdicion(personaje: PersonajeI) {
    personaje.isEditing = false;
    this.newPersonaje = personaje;
    this.save();
  }

  async delete(personaje: PersonajeI) {
    this.cargando = true;
    const loading = await this.showLoading();
    try {
      await this.firestoreService.deleteDocumentID("Personajes", personaje.id);
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      this.cargando = false;
      loading.dismiss();
    }
  }

  async save() {
    this.cargando = true;
    const loading = await this.showLoading();
    try {
      await this.firestoreService.updateDocumentID(this.newPersonaje, "Personajes", this.newPersonaje.id);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      this.cargando = false;
      loading.dismiss();
    }
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando personajes...',
      duration: 3000,
    });
    await loading.present();
    return loading;
  }

  trackByFn(index: number, personaje: PersonajeI): any {
    return personaje.id;
  }


  async openQrScanner() {
    const modal = await this.modalController.create({
      component: QrScannerComponent,
      cssClass: 'transparent-modal'
    });
    return await modal.present();
  }

}
