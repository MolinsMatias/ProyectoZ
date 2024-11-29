import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LoadingController } from '@ionic/angular';
import { PersonajeI } from 'src/app/common/models/personajes.models';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { UsuarioService } from '../../common/services/usuarios.service';

@Component({
  selector: 'app-favorito',
  templateUrl: './favorito.page.html',
  styleUrls: ['../personaje.page.scss'],
})
export class FavoritoPage implements OnInit {
  favoritos: PersonajeI[] = [];
  userRole: string | null = null;
  busquedaPersonajes: PersonajeI[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private loadingCtrl: LoadingController,
    public usuarioService: UsuarioService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.obtenerFavoritos();
    this.usuarioService.ngOnInit();

  }

  async obtenerFavoritos() {
    const loading = await this.showLoading();

    const email = this.usuarioService.getEmail();
    if (email) {
      console.log('Usuario autenticado:', email);

      this.firestoreService.getCollectionChanges<PersonajeI>(`favoritos/${email}/personajes`).subscribe({
        next: cambios => {
          if (cambios) {
            this.favoritos = cambios;
            this.busquedaPersonajes = [...this.favoritos];
            this.cd.detectChanges(); // Forzar la detección de cambios
          }
          loading.dismiss(); // Cerrar el cargador cuando los datos son cargados
        },
        error: err => {
          console.error('Error loading personajes:', err);
          loading.dismiss(); // Cerrar el cargador en caso de error
        }
      });
    } else {
      console.log('No hay usuario autenticado.');
      loading.dismiss();
    }

  }
  async eliminarDeFavoritos(personajeId: string) {
    const email = this.usuarioService.getEmail();
    if (email) {
      console.log('Usuario autenticado:', email);

      const personajePath = `favoritos/${email}/personajes/${personajeId}`;


      this.firestoreService.deleteDocument(personajePath)
        .then(() => {
          console.log(`Personaje con id ${personajeId} eliminado de favoritos`);
          this.favoritos = this.favoritos.filter(personaje => personaje.id !== personajeId);
          this.cd.detectChanges();

          location.reload();
        })
        .catch((error) => {
          console.error('Error al eliminar el personaje de favoritos:', error);
        });
    } else {
      console.log('No hay usuario autenticado.');
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

  handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.busquedaPersonajes = query
      ? this.favoritos.filter(favoritos =>
        favoritos.nombre.toLowerCase().includes(query)
      )
      : [...this.favoritos];
  }
}


