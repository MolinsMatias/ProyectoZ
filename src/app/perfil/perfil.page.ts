import { Component, OnInit, HostListener } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../common/services/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirestoreService } from '../common/services/firestore.service';
import { RazaI } from '../common/models/raza.models';
import { UsuarioService } from '../common/services/usuarios.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  public appPages: any = [];
  isActive = false;
  userRole: string | null = null;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private raindrops: { x: number, y: number, speed: number, length: number }[] = [];
  private maxRaindrops: number = 50;
  isEditing: boolean = false;
  raza: RazaI[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private firestoreService: FirestoreService,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    public usuarioService: UsuarioService,
  ) { }

  ngOnInit() {
    this.usuarioService.ngOnInit(); // Llama a la inicialización
    
  }
  async onSubmit() {
    try {
      const user = await this.afAuth.currentUser; // Obtener el usuario actual
      if (user) {
        // Preparar los datos a actualizar
        const updateData = {
          apellido: this.usuarioService.usuario.apellido,
          raza: this.usuarioService.usuario.raza,
          nombre: this.usuarioService.usuario.nombre,
          imagen: this.usuarioService.usuario.imagen,
        };

        // Llamar a updateDocument para actualizar los datos en Firestore
        await this.firestoreService.updateDocument(updateData, `usuarios/${user.uid}`);

        // Mostrar una alerta de éxito
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Los cambios han sido guardados correctamente.',
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
        console.error('No hay usuario autenticado');
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

  toggleActive() {
    this.isActive = !this.isActive;
  }


  async logout() {
    try {
      // Cerrar sesión usando el servicio de autenticación
      await this.authService.logout();

      // Mostrar la alerta de despedida
      const alert = await this.alertController.create({
        header: 'Hasta pronto',
        message: 'Esperamos volver a verte pronto.',
        buttons: [{
          text: 'OK',
          handler: () => {
            // Recargar la página cuando el usuario presiona OK
            window.location.reload();
          }
        }]
      });

      // Presentar la alerta
      await alert.present();

      // Redirigir al home (sin recargar aquí, se hará después de la alerta)
      await this.router.navigate(['/home']);

      console.log('Usuario ha cerrado sesión');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      // Mostrar alerta en caso de error
      const errorAlert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un problema al intentar cerrar sesión. Inténtalo nuevamente.',
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  }
  ngAfterViewInit(): void {
    this.canvas = document.getElementById('rainfall') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.resizeCanvas();
    this.animate();
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createRaindrop() {
    const x = Math.random() * this.canvas.width;
    const y = -5;
    const speed = Math.random() * 5 + 2;
    const length = Math.random() * 20 + 10;

    this.raindrops.push({ x, y, speed, length });
  }

  private updateRaindrops() {
    for (let i = 0; i < this.raindrops.length; i++) {
      const raindrop = this.raindrops[i];
      raindrop.y += raindrop.speed;

      if (raindrop.y > this.canvas.height) {
        this.raindrops.splice(i, 1);
        i--;
      }
    }
  }

  private drawRaindrops() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = 'aqua';
    this.ctx.lineWidth = 2;

    for (const raindrop of this.raindrops) {
      this.ctx.beginPath();
      this.ctx.moveTo(raindrop.x, raindrop.y);
      this.ctx.lineTo(raindrop.x, raindrop.y + raindrop.length);
      this.ctx.stroke();
    }
  }

  private animate() {
    if (this.raindrops.length < this.maxRaindrops) {
      this.createRaindrop();
    }
    this.updateRaindrops();
    this.drawRaindrops();

    requestAnimationFrame(() => this.animate());
  }
}