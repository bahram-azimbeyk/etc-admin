import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgJsonEditorModule } from 'ang-jsoneditor';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import * as CoreComponents from './core/components';
import * as AuthComponents from './authenticate/components';
import * as Pipes from './core/pipes';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

@NgModule({
  declarations: [
    AppComponent,
    CoreComponents.AdminComponent,
    CoreComponents.SidebarComponent,
    CoreComponents.NavigatorComponent,
    CoreComponents.BlogComponent,
    CoreComponents.TreeComponent,
    CoreComponents.ModalCodeComponent,
    CoreComponents.ModalFormComponent,
    CoreComponents.JsonEditComponent,
    CoreComponents.ComponentAdder,
    CoreComponents.SchemaComponent,
    CoreComponents.ComponentEditor,
    AuthComponents.SigninComponent,
  ],
  imports: [
    BrowserModule,
    NgJsonEditorModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatGridListModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatTreeModule,
    MatSidenavModule,
    MatMenuModule,
    MatProgressBarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatChipsModule,
    EditorModule,
  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
