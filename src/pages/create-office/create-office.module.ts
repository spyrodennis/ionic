import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateOfficePage } from './create-office';

@NgModule({
  declarations: [
    CreateOfficePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateOfficePage),
  ],
  exports: [
    CreateOfficePage
  ]
})
export class CreateOfficePageModule {}
