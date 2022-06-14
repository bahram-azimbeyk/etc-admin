import { Injectable, ɵɵresolveBody } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { CoreComponent, CoreForm, CoreInput, CoreSchema } from './models';
import { AuthService } from '../authenticate/services';
import { Urls } from '../settings';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CoreService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}
  getObject<T>(url: string): Observable<T> {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.authService.token,
      }),
    };
    return this.httpClient.get<T>(url + '/', httpOptions);
  }
  setObject<T>(url: string, body: T): Observable<T> {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.authService.token,
      }),
    };
    return this.httpClient.post<T>(url + '/', body, httpOptions);
  }
  putObject<T>(url: string, body: T): Observable<T> {
    var httpOptions = {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json',
        Authorization: this.authService.token,
      }),
    };
    return this.httpClient.put<T>(url + '/', body, httpOptions);
  }
  deleteObject<T>(url: string, body: {} = {}): Observable<T> {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.authService.token,
      }),
      body: body,
    };
    return this.httpClient.delete<T>(url + '/', httpOptions);
  }
}

@Injectable({ providedIn: 'root' })
export class JsonSaver {
  public data: any;
}

@Injectable({ providedIn: 'root' })
export class FormService {
  constructor() {}
  jsonToForm(formjson: CoreForm): FormGroup {
    var formGroup = new FormGroup({});
    formjson.components.forEach((input) => {
      var validators = [];
      if (input.required === 'true') validators.push(Validators.required);
      if (input.pattern !== '')
        validators.push(Validators.pattern(input.pattern));
      var formControl = new FormControl(input.value, validators);
      formGroup.addControl(input.name, formControl);
    });
    return formGroup;
  }
  schemaToJson(schema: CoreSchema, preset?: CoreComponent): CoreForm {
    var res = new CoreForm([
      new CoreInput(
        'name',
        'text',
        'true',
        [],
        'Component name: e.g Navbar Item',
        '',
        preset ? preset['name'] : ''
      ),
      new CoreInput(
        'component_type',
        'text',
        'true',
        [],
        'Component type: e.g navbar',
        '',
        preset ? preset['component_type'] : schema.name
      ),
      new CoreInput(
        'is_hidden',
        'checkbox',
        'false',
        [],
        '',
        '',
        preset ? preset['is_hidden'] : false
      ),
      new CoreInput(
        'order',
        'text',
        'true',
        [],
        'Order of showing, e.g 2',
        '',
        preset ? preset['order'] : '1'
      ),
    ]);
    for (const [key, value] of Object.entries(schema.schema.properties)) {
      var input_type: string;
      var components = [];
      switch (value['type']) {
        case 'string':
          input_type = value['enum'] ? 'select' : 'text';
          break;
        case 'integer':
          input_type = 'number';
          break;
        case 'boolean':
          input_type = 'checkbox';
          break;
      }
      if (input_type === 'select') components = value['enum'];
      var input = new CoreInput(
        key,
        input_type,
        schema.schema.required.includes(key) ? 'true' : 'false',
        components,
        value['description'] || '',
        value['pattern'] || '',
        preset ? preset.attrs[key] : value['default']
      );
      res.components.push(input);
    }
    return res;
  }
  schemaToForm(schema: CoreSchema, preset?: CoreComponent): FormGroup {
    return this.jsonToForm(this.schemaToJson(schema, preset));
  }
}

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  constructor(private coreService: CoreService) {}
  showClipboard() {
    return localStorage.getItem('clipboard');
  }
  copyToClipboard(id) {
    localStorage.setItem('clipboard', id);
  }
  pasteFromClipboard(id) {
    return this.coreService.setObject<any>(
      `${Urls.rootUrl}/api/admin/component`,
      {
        component_id: localStorage.getItem('clipboard') || null,
        parent_id: id,
      }
    );
  }
  pasteRefFromClipboard(id) {
    return this.coreService.setObject<any>(
      `${Urls.rootUrl}/api/admin/reference`,
      {
        component_id: localStorage.getItem('clipboard') || null,
        parent_id: id,
      }
    );
  }
}

@Injectable({ providedIn: 'root' })
export class ReloaderService {
  constructor(private router: Router) {}
  reload() {
    var curr_url = this.router.url;
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([curr_url]));
  }
  backToParent() {
    var curr_url = this.router.url;
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() =>
        this.router.navigate([curr_url.split('/').slice(0, -1).join('/')])
      );
  }
}
@Injectable({ providedIn: 'root' })
export class SharedDataService {
  public tags = new BehaviorSubject([]);
  sharedTags = this.tags.asObservable();

  constructor(private api: CoreService) {
    this.refreshTags();
  }
  refreshTags() {
    this.api
      .getObject(`${Urls.rootUrl}/api/admin/tag`)
      .subscribe((tags: []) => {
        this.tags.next(tags);
      });
  }
}
