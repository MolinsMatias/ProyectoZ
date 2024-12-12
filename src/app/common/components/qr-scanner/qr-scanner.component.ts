import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
})
export class QrScannerComponent {
  constructor(private modalController: ModalController, private router: Router) {}

  handleQrCodeResult(result: string) {
    this.router.navigate([`personajes/detalle-personaje/${result}`]);
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
