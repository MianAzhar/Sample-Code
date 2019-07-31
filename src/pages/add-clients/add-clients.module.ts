import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddClientsPage } from './add-clients';

@NgModule({
  declarations: [
    AddClientsPage,
  ],
  imports: [
    IonicPageModule.forChild(AddClientsPage),
  ],
})
export class AddClientsPageModule {}
