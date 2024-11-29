import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject } from 'rxjs';
import { RazaI } from '../models/raza.models';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    public appPages: any = [];
    userRole: string | null = null;
    usuario: { nombre: string; email: string | null; apellido?: string; raza: string; role?: string; imagen: string | null;} = {
        nombre: 'Forastero',
        email: null,
        raza: 'Soldado de clase baja',
        imagen: null,
    };

    raza: RazaI[] = [];


    constructor(
        private afAuth: AngularFireAuth,
        private firestoreService: FirestoreService,
        private firestore: AngularFirestore,
    ) { }

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
                        this.usuario.nombre = usuarioData.nombre;
                        this.usuario.imagen = usuarioData.imagen;

                        this.userRole = usuarioData.role;
                    }
                    this.loadAppPages();
                });
            } else {
                this.loadAppPages();
            }
        });
        this.loadRaza();
    }

    loadAppPages() {
        this.appPages = [
            { title: 'Lista de personajes', url: '/personajes/lista-personaje', icon: 'person' },
            { title: 'Planetas', url: '/planetas/lista-planetas', icon: 'planet' },
        ];
        if (this.userRole === 'admin') {
            this.appPages.push({ title: 'Panel Administrador', url: '/admin/panel-admin', icon: 'cash' });
        }
    }
    getEmail(): string | null {
        return this.usuario.email;
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
}

