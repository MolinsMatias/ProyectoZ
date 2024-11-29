import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PersonajeI } from 'src/app/common/models/personajes.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AuthService } from 'src/app/common/services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-detalle-personaje',
  templateUrl: './detalle-personaje.page.html',
  styleUrls: ['./detalle-personaje.page.scss'],
})
export class DetallePersonajePage implements OnInit {
  personaje: PersonajeI | null = null;
  cargando: boolean = false;
  userRole: string | null = null;
  isEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUserRoleAndPersonaje();
  }

  private async loadUserRoleAndPersonaje() {
    await this.getUserRole(); // Obtener el rol del usuario
    await this.loadPersonaje(); // Cargar el personaje
  }

  private async getUserRole() {
    const user = await this.afAuth.currentUser; // Obtener el usuario actual
    if (user) {
      this.userRole = await this.authService.getRole(user.uid); // Obtener el rol del usuario
    }
  }

  private async loadPersonaje() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.firestoreService.getDocument<PersonajeI>(`Personajes/${id}`).then((doc) => {
        if (doc.exists()) {
          this.personaje = doc.data() as PersonajeI;
          this.cd.detectChanges(); // Forzar la detección de cambios
        }
      });
    }
  }

  async save(event: Event) {
    const id = this.route.snapshot.paramMap.get('id');
    if (this.personaje) {
      this.cargando = true;
      const loading = await this.showLoading();
      try {
        await this.firestoreService.updateDocumentID(this.personaje, "Personajes", id);
        this.isEditing = false; // Desactivar modo edición
      } catch (error) {
        console.error('Error al guardar:', error); // Captura errores
      } finally {
        this.cargando = false;
        loading.dismiss();
      }
    } else {
      console.warn('No hay personaje para guardar'); // Mensaje si no hay personaje
    }
  }
  
  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      duration: 3000,
    });
    await loading.present();
    return loading;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing; // Alternar modo edición
    console.log('Modo edición:', this.isEditing);
  }
  

  
}
