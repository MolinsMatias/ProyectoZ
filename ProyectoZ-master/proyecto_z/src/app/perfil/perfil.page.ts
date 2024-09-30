import { Component, OnInit, HostListener } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../common/services/auth.service';
import { Router } from '@angular/router';

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

  usuario: { nombre: string; email: string | null; apellido?: string; raza: string; role?: string; } = {
    nombre: 'Forastero',
    email: 'ejemplo@gmail.com',
    apellido: 'Mr Aragna',
    raza: 'Soldado de clase baja',
  };

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router
  ) {}

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
  
            // Cargar el rol del usuario y las páginas
            this.userRole = usuarioData.role; // Asegúrate de que el rol se obtenga correctamente
          }
          this.loadAppPages(); // Carga las páginas aquí, después de obtener el rol
          console.log('Datos del usuario autenticado:', this.usuario);
        });
      } else {
        console.log('No hay usuario autenticado');
        this.loadAppPages(); // Carga las páginas también cuando no hay usuario autenticado
      }
    });
  }
  
  
  loadAppPages() {
    this.appPages = [
      { title: 'Lista de personajes', url: '/personajes/lista-personaje', icon: 'person' },
      { title: 'Planetas', url: '/planetas/lista-planetas', icon: 'planet' },
    ];
    if (this.userRole === 'admin') {
      this.appPages.push({ title: 'Crear personaje', url: '/personajes/crear-personaje', icon: 'add' });
    }
  }

  toggleActive() {
    this.isActive = !this.isActive;
  }

  goToProfile() {
    this.authService.isAuthenticated().then(isAuth => {
      if (isAuth) {
        this.router.navigate(['/personajes/lista-personaje']);
      } else {
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
