import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InformesPageRoutingModule } from './informes-routing.module';

import { InformesPage } from './informes.page';
import { DateRangePickerComponent } from 'src/app/common/components/date-range-picker/date-range-picker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InformesPageRoutingModule
  ],
  declarations: [InformesPage, DateRangePickerComponent]
})
export class InformesPageModule {}
