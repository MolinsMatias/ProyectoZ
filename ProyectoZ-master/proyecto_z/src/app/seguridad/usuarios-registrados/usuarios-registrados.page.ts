import { Component, OnInit } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';

import { UsuarioI } from 'src/app/common/models/usuario.models';
@Component({
  selector: 'app-usuarios-registrados',
  templateUrl: './usuarios-registrados.page.html',
  styleUrls: ['./usuarios-registrados.page.scss'],
})
export class UsuariosRegistradosPage implements OnInit {
  usuarios: UsuarioI[] = [];

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.getUsuarios();
  }

  getUsuarios() {
    this.firestore.collection<UsuarioI>('usuarios').valueChanges().subscribe((usuarios: UsuarioI[]) => {
        this.usuarios = usuarios.map(usuario => ({
            ...usuario,
        }));
        console.log('Usuarios obtenidos:', this.usuarios);
    }, error => {
        console.error('Error al obtener usuarios:', error);
    });
}
}
