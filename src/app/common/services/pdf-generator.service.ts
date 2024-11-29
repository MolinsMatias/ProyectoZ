import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PersonajeI } from '../models/personajes.models'; // Asegúrate de que el modelo esté correctamente importado
import { Timestamp } from 'firebase/firestore';

// Asegúrate de agregar las fuentes virtuales de pdfMake
(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  constructor(private firestore: AngularFirestore) { }

  // Método para generar el PDF con fecha
  generatePdfFecha(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDateTime = new Date().toLocaleString('es-ES');
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    // Consultar los personajes de Firestore entre las fechas proporcionadas
    this.firestore.collection<PersonajeI>('Personajes', ref =>
      ref.where('createAt', '>=', start)
        .where('createAt', '<=', end)
        .orderBy('createAt')
    ).get().subscribe(snapshot => {
      const personajes: PersonajeI[] = snapshot.docs.map(doc => {
        const data = doc.data() as PersonajeI;
        return {
          id: doc.id,  // Incluye el ID del documento
          nombre: data.nombre,
          createAt: data.createAt instanceof Timestamp ? data.createAt.toDate() : data.createAt, // Asegúrate de convertir a Date si es Timestamp
          ki: data.ki, // Agregar los otros campos para cumplir con la interfaz
          maxKi: data.maxKi,
          raza: data.raza,
          sexo: data.sexo,
          descripcion: data.descripcion,
          imagen: data.imagen,
          faccion: data.faccion,
        };
      });

      // Crear el contenido para el PDF
      const docDefinition: any = {
        content: [
          { text: 'Informe de Personajes de "ProyectoZ"', style: 'header' },
          { text: `Generado el: ${currentDateTime}`, style: 'subheader' },
          { text: `Desde: ${start.toLocaleDateString('es-ES')} Hasta: ${end.toLocaleDateString('es-ES')}`, style: 'subheader' },
          { text: '\n' }, // Salto de línea
          
          {
            style: 'content',
            table: {
              widths: ['25%', '25%', '25%', '25%'],  // Anchos de las columnas
              body: [
                [
                  { text: 'Nombre', style: 'tableHeader' },
                  { text: 'Fecha de Creación', style: 'tableHeader' },
                  { text: 'Raza', style: 'tableHeader' },
                  { text: 'Sexo', style: 'tableHeader' },
                ],
                // Insertar los datos de los personajes
                ...personajes.map(personaje => [
                  personaje.nombre,
                  (personaje.createAt instanceof Timestamp ? personaje.createAt.toDate() : new Date(personaje.createAt)).toLocaleDateString('es-ES'),
                  personaje.raza,
                  personaje.sexo
                ])
              ]
            },
            layout: 'lightHorizontalLines', // Diseño de líneas horizontales ligeras
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 14,
            italics: true,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            alignment: 'center',
            fillColor: '#f2f2f2',
            margin: [0, 5]
          },
          content:{
            fontSize: 12,
            italics: false,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          }
        }
      };

      // Crear el PDF y abrirlo para descarga
      pdfMake.createPdf(docDefinition).download('informe_personajes_rango.pdf');
    });
  }

  // Método para generar el PDF sin fecha (todos los personajes)
  generatePdfTodos() {
    // Consultar todos los personajes de Firestore
    this.firestore.collection<PersonajeI>('Personajes').get().subscribe(snapshot => {
      const personajes: PersonajeI[] = snapshot.docs.map(doc => {
        const data = doc.data() as PersonajeI;
        return {
          id: doc.id,  // Incluye el ID del documento
          nombre: data.nombre,
          createAt: data.createAt instanceof Timestamp ? data.createAt.toDate() : data.createAt,
          ki: data.ki,
          maxKi: data.maxKi,
          raza: data.raza,
          sexo: data.sexo,
          descripcion: data.descripcion,
          imagen: data.imagen,
          faccion: data.faccion,
        };
      });

      // Crear el contenido para el PDF
      const currentDateTime = new Date().toLocaleString('es-ES');
      const docDefinition: any = {
        
        content: [
          { text: 'Informe de personajes básico de "ProyectoZ"', style: 'header' },
          { text: `Generado el: ${currentDateTime}`, style: 'subheader' },
          { text: 'Todos los personajes', style: 'subheader' },
          { text: '\n' }, // Salto de línea
          this.createTable(personajes),
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 14,
            italics: true,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            alignment: 'center',
            fillColor: '#f2f2f2',
            margin: [0, 5]
          },
          content:{
            fontSize: 12,
            italics: false,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          }
        }
      };

      // Crear el PDF y abrirlo para descarga
      pdfMake.createPdf(docDefinition).download('informe_personajes_basico.pdf');
    });
  }

  generatePdfPorVariasSecciones() {
    // Consultar los personajes de Firestore
    this.firestore.collection<PersonajeI>('Personajes').get().subscribe(snapshot => {
      const personajes: PersonajeI[] = snapshot.docs.map(doc => {
        const data = doc.data() as PersonajeI;
        return {
          id: doc.id,
          nombre: data.nombre,
          createAt: data.createAt instanceof Timestamp ? data.createAt.toDate() : data.createAt,
          ki: data.ki,
          maxKi: data.maxKi,
          raza: data.raza,
          sexo: data.sexo,
          descripcion: data.descripcion,
          imagen: data.imagen,
          faccion: data.faccion,
        };
      });

      // Crear el contenido para el PDF
      const currentDateTime = new Date().toLocaleString('es-ES');
      const docDefinition: any = {
        content: [
          { text: 'Informe de personajes full de "ProyectoZ"', style: 'header' },
          { text: `Generado el: ${currentDateTime}`, style: 'subheader' },

          // Página 1: Todos los personajes juntos
          {
            text: 'Todos los personajes', style: 'subheader',
          },
          this.createTable(personajes),

          // Página 2: Por mes
          {
            text: 'Por Mes', style: 'subheader',
            pageBreak: 'before' // Salto de página antes de esta sección
          },
          ...this.createTablesByMonth(personajes),

          // Página 3: Separado por Raza
          {
            text: 'Por Raza', style: 'subheader',
            pageBreak: 'before' // Salto de página antes de esta sección
          },
          ...this.createTablesByRaza(personajes),

          // Página 4: Separado por facción
          {
            text: 'Por Facción', style: 'subheader',
            pageBreak: 'before' // Salto de página antes de esta sección
          },
          ...this.createTablesByFaccion(personajes),

          // Página 5: Separado por sexo
          {
            text: 'Por Sexo', style: 'subheader',
            pageBreak: 'before' // Salto de página antes de esta sección
          },
          ...this.createTablesBySexo(personajes),
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 14,
            italics: true,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            alignment: 'center',
            fillColor: '#f2f2f2',
            margin: [0, 5]
          },
          tableHeaderFocus: {
            bold: true,
            fontSize: 12,
            alignment: 'center',
            fillColor: '#c2c2c2',
            margin: [0, 5]
          },
          content:{
            fontSize: 12,
            italics: false,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          }
        }
      };

      // Crear el PDF y abrirlo para descarga
      pdfMake.createPdf(docDefinition).download('informe_personajes_full.pdf');
    });
  }

  // Función para crear una tabla con todos los personajes
  createTable(personajes: PersonajeI[]) {
    return {
      style: 'content',
      table: {
        widths: ['20%', '20%', '20%', '20%', '20%'],
        body: [
          [
            { text: 'Nombre', style: 'tableHeader' },
            { text: 'Fecha de Creación', style: 'tableHeader' },
            { text: 'Raza', style: 'tableHeader' },
            { text: 'Facción', style: 'tableHeader' },
            { text: 'Sexo', style: 'tableHeader' },
          ],
          ...personajes.map(personaje => [
            personaje.nombre,
            (personaje.createAt instanceof Timestamp ? personaje.createAt.toDate() : new Date(personaje.createAt)).toLocaleDateString('es-ES'),
            personaje.raza,
            personaje.faccion,
            personaje.sexo
          ])
        ]
      }, layout: 'lightHorizontalLines'
    };
  }

  // Función para crear tablas separadas por mes
  createTablesByMonth(personajes: PersonajeI[]) {
    // Obtenemos un arreglo único de meses basado en la fecha de creación
    const meses = Array.from(new Set(personajes.map(p => new Date(p.createAt instanceof Timestamp ? p.createAt.toDate() : p.createAt).getMonth())));

    return meses.map(mes => {
      // Filtramos los personajes que pertenecen al mes actual
      const personajesMes = personajes.filter(p => new Date(p.createAt instanceof Timestamp ? p.createAt.toDate() : p.createAt).getMonth() === mes);

      return {
        text: `Mes: ${mes + 1}`, // Mes con formato adecuado (1-12)
        style: 'content',
        table: {
          widths: ['20%', '20%', '20%', '20%', '20%'],
          body: [
            [
              { text: 'Nombre', style: 'tableHeader' },
              { text: 'Fecha de Creación', style: 'tableHeaderFocus' },
              { text: 'Raza', style: 'tableHeader' },
              { text: 'Facción', style: 'tableHeader' },
              { text: 'Sexo', style: 'tableHeader' },
            ],
            ...personajesMes.map(personaje => [
              personaje.nombre,
              // Convertimos createAt a un Date si es un Timestamp o si ya es un Date
              new Date(personaje.createAt instanceof Timestamp ? personaje.createAt.toDate() : personaje.createAt)
                .toLocaleDateString('es-ES'),  // Formateamos la fecha
              personaje.raza,
              personaje.faccion,
              personaje.sexo
            ])
          ]
        }, layout: 'lightHorizontalLines'
      };
    });
  }
  // Función para crear tablas separadas por raza
  createTablesByRaza(personajes: PersonajeI[]) {
    const razas = Array.from(new Set(personajes.map(p => p.raza)));
    return razas.map(raza => {
      const personajesRaza = personajes
      .filter(p => p.raza === raza)
      .sort((a,b) => a.nombre.localeCompare(b.nombre))
      return {
        text: raza,
        style: 'content',
        table: {
          widths: ['20%', '20%', '20%', '20%', '20%'],
          body: [
            [
              { text: 'Nombre', style: 'tableHeader' },
              { text: 'Fecha de Creación', style: 'tableHeader' },
              { text: 'Raza', style: 'tableHeaderFocus' },
              { text: 'Facción', style: 'tableHeader' },
              { text: 'Sexo', style: 'tableHeader' },
            ],
            ...personajesRaza.map(personaje => [
              personaje.nombre,
              (personaje.createAt instanceof Timestamp ? personaje.createAt.toDate() : new Date(personaje.createAt)).toLocaleDateString('es-ES'),
              personaje.raza,
              personaje.faccion,
              personaje.sexo
            ])
          ]
        }, layout: 'lightHorizontalLines'
      };
    });
  }

  // Función para crear tablas separadas por facción
  createTablesByFaccion(personajes: PersonajeI[]) {
    const facciones = Array.from(new Set(personajes.map(p => p.faccion)));
    return facciones.map(faccion => {
      const personajesFaccion = personajes
      .filter(p => p.faccion === faccion)
      .sort((a,b) => a.nombre.localeCompare(b.nombre))
      return {
        text: faccion,
        style: 'content',
        table: {
          widths: ['20%', '20%', '20%', '20%', '20%'],
          body: [
            [
              { text: 'Nombre', style: 'tableHeader' },
              { text: 'Fecha de Creación', style: 'tableHeader' },
              { text: 'Raza', style: 'tableHeader' },
              { text: 'Facción', style: 'tableHeaderFocus' },
              { text: 'Sexo', style: 'tableHeader' },
            ],
            ...personajesFaccion.map(personaje => [
              personaje.nombre,
              (personaje.createAt instanceof Timestamp ? personaje.createAt.toDate() : new Date(personaje.createAt)).toLocaleDateString('es-ES'),
              personaje.raza,
              personaje.faccion,
              personaje.sexo
            ])
          ]
        }, layout: 'lightHorizontalLines'
      };
    });
  }

  // Función para crear tablas separadas por sexo
  createTablesBySexo(personajes: PersonajeI[]) {
    const sexos = Array.from(new Set(personajes.map(p => p.sexo)));
    return sexos.map(sexo => {
      const personajesSexo = personajes
      .filter(p => p.sexo === sexo)
      .sort((a,b) => a.nombre.localeCompare(b.nombre))
      return {
        text: sexo,
        style: 'content',
        table: {
          widths: ['20%', '20%', '20%', '20%', '20%'],
          body: [
            [
              { text: 'Nombre', style: 'tableHeader' },
              { text: 'Fecha de Creación', style: 'tableHeader' },
              { text: 'Raza', style: 'tableHeader' },
              { text: 'Facción', style: 'tableHeader' },
              { text: 'Sexo', style: 'tableHeaderFocus' },
            ],
            ...personajesSexo.map(personaje => [
              personaje.nombre,
              (personaje.createAt instanceof Timestamp ? personaje.createAt.toDate() : new Date(personaje.createAt)).toLocaleDateString('es-ES'),
              personaje.raza,
              personaje.faccion,
              personaje.sexo
            ])
          ]
        }, layout: 'lightHorizontalLines'
      };
    });
  }




}
