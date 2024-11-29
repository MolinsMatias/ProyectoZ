import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { FaccionI } from 'src/app/common/models/facciones.models';
import { PersonajeI } from 'src/app/common/models/personajes.models';
import { RazaI } from 'src/app/common/models/raza.models';
import { SexoI } from 'src/app/common/models/sexo.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { Timestamp } from 'firebase/firestore'

@Component({
  selector: 'app-crear-personaje',
  templateUrl: './crear-personaje.page.html',
  styleUrls: ['./crear-personaje.page.scss'],
})
export class CrearPersonajePage implements OnInit {

  personajes: PersonajeI[] = [];
  sexo: SexoI[] = [];
  raza: RazaI[] = [];
  faccion: FaccionI[] = [];

  newPersonaje: PersonajeI;
  cargando: boolean = false;

  constructor(private firestoreService: FirestoreService, private loadingCtrl: LoadingController) {
    this.initPersonajes();
  }

  ngOnInit() {
    this.loadPersonajes();
    this.loadSexo();
    this.loadRaza();
    this.loadFaccion();
  }

  loadPersonajes() {
    this.firestoreService.getCollectionChanges<PersonajeI>('Personajes').subscribe(cambios => {
      if (cambios) {
        this.personajes = cambios;
      }
    });
  }

  loadSexo() {
    this.firestoreService.getCollectionChanges<SexoI>('Sexos').subscribe({
      next: (cambios) => { 
        if (cambios) {
          this.sexo = cambios;
        } else {
          console.warn('No se encontraron cambios en la colección sexo.');
        }
      },
      error: (error) => {
        console.error('Error al cargar sexo:', error);
      }
    });
  }

  loadRaza() {
    this.firestoreService.getCollectionChanges<RazaI>('Razas').subscribe({
      next: (cambios) => { 
        if (cambios) {
          this.raza = cambios;
        } else {
          console.warn('No se encontraron cambios en la colección raza.');
        }
      },
      error: (error) => {
        console.error('Error al cargar raza:', error);
      }
    });
  }

  loadFaccion() {
    this.firestoreService.getCollectionChanges<FaccionI>('Facciones').subscribe({
      next: (cambios) => { 
        if (cambios) {
          this.faccion = cambios;
        } else {
          console.warn('No se encontraron cambios en la colección raza.');
        }
      },
      error: (error) => {
        console.error('Error al cargar raza:', error);
      }
    });
  }
  
  
  initPersonajes() {
    this.newPersonaje = {
      id: this.firestoreService.createIdDoc(),
      nombre: null,
      ki: null,
      maxKi: null,
      raza: null,
      sexo: null,
      descripcion: null,
      imagen: null,
      faccion: null,
      createAt: Timestamp.now()
    };
  }

  async save() {
    this.cargando = true;
    const loading = await this.showLoading(); 
  
    try {
      await this.firestoreService.createDocumentID(this.newPersonaje, "Personajes", this.newPersonaje.id);
    } catch (error) {
      console.error('Error al guardar:', error);  
    } finally {
      this.cargando = false;
      loading.dismiss();  
      location.reload()
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
}
