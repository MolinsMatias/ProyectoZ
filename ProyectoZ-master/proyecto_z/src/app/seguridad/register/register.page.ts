import { Component, OnInit, HostListener } from '@angular/core';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, AbstractControl } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { UsuarioI } from '../../common/models/usuario.models';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/common/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../login/login.page.scss'],
})
export class RegisterPage implements OnInit {


  usuarioForm!: FormGroup;
  usuario: UsuarioI; // Cambia a un solo objeto UsuarioI

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private raindrops: { x: number, y: number, speed: number, length: number }[] = [];
  private maxRaindrops: number = 55;

  constructor(private formBuilder: FormBuilder
    , public loadingController: LoadingController,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Especificamos que todos los campos son obligatorios
    this.usuarioForm = this.formBuilder.group({
      'nombre': [null, [Validators.required, this.nom]],
      'apellido': [null, [Validators.required, this.ape]],
      'password': [null, [Validators.required, this.contador]],
      'email': [null, [Validators.required, this.aragna]],
      'raza': [null, Validators.required],
    });
    this.usuario = {} as UsuarioI; // Inicializa el objeto usuario
  }

  aragna(control: AbstractControl) {
    const fin = ['.cl', '.com', '.io', '.CL', '.COM', '.IO'];
    if (control.value && !control.value.includes('@')) {
      return { 'emailInvalid': 'tu eri wn o te pegaron de chico te falta el: @' };
    }
    if (control.value && !fin.some(domain => control.value.includes(domain))) {
      return { 'emailInvalid': 'Mira saco de animal el correo debe tener uno de estos: .cl, .com o .io' };

    }
    return null;
  }
  contador(numerico: AbstractControl) {
    if (numerico.value && numerico.value.length < 8) {
      return { 'contra': 'mira saco wea con esa wea tan corta te cagan al toque y la cuenta tambien,que sea mayor de 8cm y de caracteres igual ya que no te sirve' };
    }
    return null;
  }
  nom(numerico: AbstractControl) {
    if (numerico.value && numerico.value.length < 2) {
      return { 'no': 'mire master es su primera advertencia asi que no dire nada pero el nombre tiene que ser mayor o igual a 3 caracteres' };
    }
    return null;
  }
  ape(numerico: AbstractControl) {
    if (numerico.value && numerico.value.length < 4) {
      return { 'ap': 'oe yapo esta es tu segunda advertencia hace la wea bien o se te advertira de peor forma como sea el apellido tiene que ser mayo o igual a 4' };
    }
    return null;
  }

  // se ejecutara cuando presione el Submit
  async onFormSubmit() {
    if (this.usuarioForm.valid) {
      const formValues = this.usuarioForm.value;
      this.authService.register(formValues); // Asegúrate de que el método register esté definido en tu servicio
    } else {
      // Manejar errores de validación si es necesario
      console.log('Formulario inválido', this.usuarioForm.errors);
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
