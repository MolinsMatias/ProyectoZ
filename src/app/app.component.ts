import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './common/services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from './common/services/usuarios.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public appPages: any = [];
  isActive = false;
  userRole: string | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    public usuarioService: UsuarioService,
  ) { }

  ngOnInit() {
    this.usuarioService.ngOnInit();
  }

  toggleActive() {
    this.isActive = !this.isActive;
  }

  goToProfile() {
    this.authService.isAuthenticated().then(isAuth => {
      
      if (isAuth) {
        this.router.navigate(['perfil']);
      }
      else {
        this.router.navigate(['/seguridad/login']);
      }
    }).catch(error => {
      console.error('Error al verificar autenticación:', error);
      this.router.navigate(['/seguridad/login']);
    });
  }

  logout() {
    this.authService.logout().then(() => {
      console.log('Usuario ha cerrado sesión');
      this.router.navigate(['/seguridad/login']);
      window.location.reload(); // Recargar la página
    }).catch(error => {
      console.error('Error al cerrar sesión:', error);
    });
  }
}
