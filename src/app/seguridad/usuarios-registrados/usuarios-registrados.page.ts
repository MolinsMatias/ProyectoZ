import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';

import { UsuarioI } from 'src/app/common/models/usuario.models';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { UsuarioService } from '../../common/services/usuarios.service';
@Component({
  selector: 'app-usuarios-registrados',
  templateUrl: './usuarios-registrados.page.html',
  styleUrls: ['./usuarios-registrados.page.scss'],
})
export class UsuariosRegistradosPage implements OnInit {
  usuarios: UsuarioI[] = [];
  isEditing: boolean = false;
  editingUsuario: UsuarioI | null = null;
  selectedSearchCriteria: string = 'email'; 
  searchTerm: string = ''; 

  usuario: { nombre: string; email: string; apellido?: string; raza: string; role?: string; } = {
    nombre: 'Forastero',
    email: 'ejemplo@gmail.com',
    apellido: 'Mr Aragna',
    raza: 'Soldado de clase baja',
  };
  constructor(private firestore: AngularFirestore,
    private alertController: AlertController,
    private afAuth: AngularFireAuth,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    public usuarioService: UsuarioService,

  ) { }

  ngOnInit() {
    this.usuarioService.loadRaza();
    this.getUsuarios();
  }

getUsuarios() {
  this.firestore.collection<UsuarioI>('usuarios', ref => ref.orderBy('nombre')).valueChanges().subscribe((usuarios: UsuarioI[]) => {
    this.usuarios = usuarios;
    console.log('Usuarios obtenidos en orden:', this.usuarios);
  }, error => {
    console.error('Error al obtener usuarios:', error);
  });
}
onCriteriaChange() {
  this.searchTerm = ''; // Limpiar el término de búsqueda al cambiar el criterio
  this.buscarUsuarios(); // Realizar la búsqueda con el nuevo criterio
}

selectUsuarioForEdit(usuario: UsuarioI) {
  this.isEditing = true;
  this.editingUsuario = { ...usuario }; // Clonamos el objeto para no modificar la lista original directamente
}
buscarUsuarios() {
  if (!this.searchTerm) {
    this.getUsuarios(); // Si no hay término de búsqueda, cargar todos los usuarios
    return;
  }

  const searchTermLower = this.searchTerm.toLowerCase(); // Convertir el término de búsqueda a minúsculas
  let usuariosFiltrados: UsuarioI[];

  switch (this.selectedSearchCriteria) {
    case 'email':
      usuariosFiltrados = this.usuarios.filter(usuario => 
        usuario.email.toLowerCase().includes(searchTermLower) // Comparar en minúsculas
      );
      break;
    case 'nombre':
      usuariosFiltrados = this.usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(searchTermLower) // Comparar en minúsculas
      );
      break;
    case 'rol':
      usuariosFiltrados = this.usuarios.filter(usuario => 
        usuario.role?.toLowerCase().includes(searchTermLower) // Comparar en minúsculas
      );
      break;
    case 'raza': // Nuevo caso para buscar por raza
      usuariosFiltrados = this.usuarios.filter(usuario => 
        usuario.raza.toLowerCase().includes(searchTermLower) // Comparar en minúsculas
      );
      break;
    default:
      usuariosFiltrados = this.usuarios; // Si no coincide, mostrar todos
      break;
  }

  this.usuarios = usuariosFiltrados.length > 0 ? usuariosFiltrados : this.usuarios; // Actualizar la lista con los resultados filtrados
}

getPlaceholder() {
  switch (this.selectedSearchCriteria) {
    case 'email':
      return 'Buscar por correo';
    case 'nombre':
      return 'Buscar por nombre';
    case 'rol':
      return 'Buscar por rol';
    case 'raza':
      return 'Buscar por raza';
    default:
      return 'Buscar';
  }
}

async eliminarUsuario(email: string) {
  try {
    // Obtener el documento en Firestore por el correo electrónico
    const userDoc = await this.firestore.collection('usuarios', ref => ref.where('email', '==', email)).get().toPromise();

    if (!userDoc.empty) {
      const docId = userDoc.docs[0].id;

      // Eliminar el documento de Firestore
      await this.firestore.collection('usuarios').doc(docId).delete();

      // Actualizar la lista local de usuarios
      this.usuarios = this.usuarios.filter(usr => usr.email !== email);

      // Mostrar una alerta de éxito
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'El usuario ha sido eliminado correctamente.',
        buttons: [{
          text: 'OK',
          handler: () => {
            // Recargar la página
            window.location.reload();
          }
        }]
      });
      await alert.present();
    } else {
      console.error('No se encontró el documento del usuario con ese email');
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se encontró un usuario con ese correo electrónico.',
        buttons: ['OK']
      });
      await alert.present();
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);

    // Mostrar una alerta de error
    const errorAlert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un problema al eliminar el usuario. Inténtalo nuevamente.',
      buttons: ['OK']
    });
    await errorAlert.present();
  }
}

async onSubmit() {
  try {
    if (this.editingUsuario && this.editingUsuario.email) {
      // Preparar los datos a actualizar para el usuario seleccionado
      const updateData = {
        apellido: this.editingUsuario.apellido,
        raza: this.editingUsuario.raza,
        nombre: this.editingUsuario.nombre,
        role: this.editingUsuario.role,
      };

      // Obtener el documento en Firestore por su correo electrónico
      const userDoc = await this.firestore.collection('usuarios', ref => ref.where('email', '==', this.editingUsuario.email)).get().toPromise();
      
      if (!userDoc.empty) {
        const docId = userDoc.docs[0].id;

        // Actualizar el documento en Firestore
        await this.firestoreService.updateDocument(updateData, `usuarios/${docId}`);

        // Actualizar el usuario en la lista local
        this.usuarios = this.usuarios.map(usr => {
          if (usr.email === this.editingUsuario!.email) {
            return { ...usr, ...updateData }; // Actualizar los datos del usuario modificado
          }
          return usr; // Dejar los demás usuarios intactos
        });

        // Mostrar una alerta de éxito
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Los cambios han sido guardados correctamente.',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.isEditing = false; // Cierra el formulario de edición
              this.editingUsuario = null; // Limpiar el usuario en edición
            }
          }]
        });
        await alert.present();
      } else {
        console.error('No se encontró el documento del usuario con ese email');
      }
    } else {
      console.error('No hay usuario seleccionado o no se pudo obtener el email');
    }
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);

    // Mostrar una alerta de error
    const errorAlert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un problema al guardar los cambios. Inténtalo nuevamente.',
      buttons: ['OK']
    });
    await errorAlert.present();
  }
}
}