import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LoadingController } from '@ionic/angular';
import { PersonajeI } from 'src/app/common/models/personajes.models';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';

@Component({
  selector: 'app-favorito',
  templateUrl: './favorito.page.html',
  styleUrls: ['./favorito.page.scss'],
})
export class FavoritoPage implements OnInit {
  favoritos: PersonajeI[] = [];
  userRole: string | null = null;
  

  constructor(
    private firestore: AngularFirestore,
    private firestoreService: FirestoreService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private cd: ChangeDetectorRef 
  ) {}
  usuario: { nombre: string; email: string; apellido?: string; raza: string; role?: string; } = {
    nombre: 'Forastero',
    email: 'ejemplo@gmail.com',
    apellido: 'Mr Aragna',
    raza: 'Soldado de clase baja',
  };

  ngOnInit() {
    this.obtenerFavoritos();
      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.usuario.nombre = user.displayName;
          this.usuario.email = user.email;
  
          this.firestore.collection('usuarios').doc(user.uid).valueChanges().subscribe((usuarioData: any) => {
            if (usuarioData) {
              this.usuario.apellido = usuarioData.apellido;
              this.usuario.raza = usuarioData.raza;
              this.usuario.role = usuarioData.role;
  
              // Cargar el rol del usuario y las páginas
              this.userRole = usuarioData.role; // Asegúrate de que el rol se obtenga correctamente
            }
            console.log('Datos del usuario autenticado favo:', this.usuario);
          });
        } else {
          console.log('No hay usuario autenticado');
        }
      });
  
  }

  async obtenerFavoritos() {
    const loading = await this.showLoading(); // Mostrar la pantalla de carga
  
    const user = await this.afAuth.currentUser; 
    if (user) {
      const email = user.email; // Obtener el correo del usuario autenticado
      console.log('Usuario autenticado:', email); // Imprimir el correo del usuario
  
      // Acceder a la subcolección 'personajes' dentro de 'favoritos' usando el correo del usuario
      this.firestore.collection<PersonajeI>(`favoritos/${email}/personajes`)
        .valueChanges()
        .subscribe(favoritos => {
          console.log('Favoritos obtenidos:', favoritos);
          this.favoritos = favoritos; // Asignar los personajes favoritos obtenidos
          loading.dismiss(); // Ocultar la pantalla de carga
        }, error => {
          console.error('Error al obtener los favoritos:', error);
          loading.dismiss(); // Ocultar la pantalla de carga incluso si hay error
        });
    } else {
      console.log('No hay usuario autenticado.');
      loading.dismiss(); // Ocultar la pantalla de carga si no hay usuario
    }
  }
  async eliminarDeFavoritos(personajeId: string) {
    const user = await this.afAuth.currentUser;
    if (user) {
      const email = user.email; // Obtener el correo del usuario autenticado
      console.log('Usuario autenticado:', email); // Imprimir el correo del usuario
  
      // Construir la ruta al documento del personaje en la subcolección 'personajes'
      const personajePath = `favoritos/${email}/personajes/${personajeId}`;
  
      // Eliminar el documento del personaje de la subcolección 'personajes' en 'favoritos'
      this.firestoreService.deleteDocument(personajePath)
        .then(() => {
          console.log(`Personaje con id ${personajeId} eliminado de favoritos`);
          // Actualiza la lista local de favoritos después de eliminarlo
          this.favoritos = this.favoritos.filter(personaje => personaje.id !== personajeId);
          this.cd.detectChanges(); // Actualizar la vista si es necesario

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
}


