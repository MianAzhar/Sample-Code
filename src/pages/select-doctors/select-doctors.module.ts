import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectDoctorsPage } from './select-doctors';

@NgModule({
  declarations: [
    SelectDoctorsPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectDoctorsPage),
  ],
})
export class SelectDoctorsPageModule {}
