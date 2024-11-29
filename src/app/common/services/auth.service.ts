import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UsuarioI } from '../models/usuario.models';
import { FirebaseError } from 'firebase-admin';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: any; // Guardar información del usuario

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router) {
  }

  // Registro de usuarios con email y contraseña
  async register(usuario: UsuarioI) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(usuario.email, usuario.password);

      // Actualiza el perfil del usuario con el nombre
      await userCredential.user?.updateProfile({
        displayName: usuario.nombre
      });

      // Guarda la información del usuario en Firestore
      await this.firestore.collection('usuarios').doc(userCredential.user?.uid).set({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        raza: usuario.raza,
        role: 'usuario'
      });

      // Enviar el correo de verificación
      await userCredential.user?.sendEmailVerification();
      console.log('Correo de verificación enviado.');

      // Cerrar sesión después de registrar y enviar el correo de verificación
      await this.afAuth.signOut();
      console.log('Sesión cerrada. Verifica tu correo antes de iniciar sesión.');

      // Redirigir al usuario a la página de inicio de sesión
      this.router.navigate(['login']);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error('Error al registrar el usuario:', firebaseError);
      window.alert(firebaseError.message);
    }
  }

  // Inicio de sesión con email y contraseña
  async login(email: string, password: string): Promise<void> {
    try {
      // Intenta iniciar sesión con el correo y la contraseña
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);

      // Verifica que el usuario existe y si su correo ha sido verificado
      const user = userCredential.user;
      if (user && !user.emailVerified) {
        await this.afAuth.signOut(); // Cierra la sesión si el correo no está verificado
        throw new Error("Debes verificar tu correo antes de iniciar sesión."); // Lanza un error
      }

      console.log("Login exitoso");
    } catch (error) {
      console.error('Error en login:', error);
      throw error; // Propaga el error hacia el componente
    }
  }





  // Cierre de sesión
  logout(): Promise<void> {
    return this.afAuth.signOut();
  }
  async getRole(userId: string): Promise<string | null> {
    try {
      const userDoc = await this.firestore.collection('usuarios').doc(userId).get().toPromise();
      if (userDoc.exists) {
        const data = userDoc.data() as UsuarioI;
        return data.role;
      }
      return null; // Si el documento no existe, devuelve null
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error);
      return null;
    }
  }


  // Verifica si el usuario está autenticado
  isAuthenticated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.afAuth.authState.subscribe(user => {
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, error => {
        reject(error);
      });
    });
  }

  // AuthService
  async getCurrentUser() {
    return await this.afAuth.currentUser; // Devuelve el usuario actual
  }


  async resetPassword(email: string): Promise<void> {
    try {
      // Buscar en la colección de usuarios por el correo electrónico
      const usersRef = this.firestore.collection('usuarios', ref => ref.where('email', '==', email));
      const snapshot = await usersRef.get().toPromise();

      // Verificar si el snapshot está definido y si está vacío
      if (snapshot && snapshot.empty) {
        throw new Error('No hay ningún usuario registrado con ese email.'); // Mensaje de error si el email no está registrado
      }

      // Si el usuario existe, enviar el correo de restablecimiento de contraseña
      await this.afAuth.sendPasswordResetEmail(email);
      this.router.navigate(['seguridad/login']);
    } catch (error) {
      throw error; // Re-lanzar el error para manejarlo donde llames a esta función
    }
  }
}
