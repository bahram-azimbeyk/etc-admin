import {
  Component,
  ViewChild,
  Input,
  OnInit,
  Inject,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import {
  FormGroup,
  NgForm,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, startWith, map, switchMap } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { Urls } from '../settings';

import {
  CoreService,
  FormService,
  JsonSaver,
  ClipboardService,
  ReloaderService,
  SharedDataService,
} from './services';
import {
  CoreWindow,
  CoreSchema,
  CoreForm,
  CoreComponent,
  CoreMigration,
  FlatNode,
  CoreBlog,
  CoreCategorie,
} from './models';
import { window_form, blog_form } from './forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AuthService } from '../authenticate/services';
import { MatMenuTrigger } from '@angular/material/menu';
import tinymce from 'tinymce/tinymce';

// Default icons are required for TinyMCE 5.3 or above
import 'tinymce/icons/default';

// A theme is also required
import 'tinymce/themes/silver';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'core-admin',
  templateUrl: './templates/admin.html',
})
export class AdminComponent {
  ITEMS = [
    {
      link: 'window',
      icon: 'window',
    },
    {
      link: 'schema',
      icon: 'schema',
    },
    {
      link: 'blog',
      icon: 'web',
    },
  ];
  selectedItem = null;
  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit() {
    var childRoute = this.activatedRoute.firstChild.firstChild;
    if (childRoute) {
      var mode = this.activatedRoute.firstChild.firstChild.snapshot.data.mode;
      this.selectedItem = this.ITEMS.find((item) => item.link === mode);
    }
  }
  onSelect(newItem, drawer) {
    if (!drawer.opened || this.selectedItem === newItem) {
      drawer.toggle();
    }
    this.selectedItem = newItem;
  }
  onSignOut() {
    this.authService.logout().subscribe(
      (result) => (window.location.href = '/'),
      (error) => (window.location.href = '/')
    );
  }
}
@Component({
  selector: 'core-sidebar',
  templateUrl: './templates/sidebar.html',
})
export class SidebarComponent implements OnInit {
  @Input() mode: string;
  data: any[];
  blog_tags: string[];
  schemaTemplate = new CoreSchema();
  router_events$;

  formjson: any;
  selectedItem = null;
  constructor(
    public dialog: MatDialog,
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit() {}
  ngOnChanges() {
    var childRoute = this.activatedRoute.firstChild.firstChild;
    if (childRoute) {
      var selectedItemId =
        this.activatedRoute.firstChild.firstChild.snapshot.paramMap.get('id');
      var selectedItemSlug =
        this.activatedRoute.firstChild.firstChild.snapshot.paramMap.get('slug');
    }
    if (this.mode === 'window') {
      this.getWindows().subscribe((windows) => {
        this.data = windows;
        this.selectedItem = this.data.find(
          (element) => element.id === selectedItemId
        );
      });
      this.getWindowType().subscribe((result: any[]) => {
        var window_types = result.map((n: any) => n['window_type']);
        this.formjson = window_form.clone();
        this.formjson['components'][4]['components'] = window_types;
      });
    } else if (this.mode === 'schema') {
      this.getSchemas().subscribe((schemas) => {
        this.data = schemas;
        this.selectedItem = this.data.find(
          (element) => element.id === selectedItemId
        );
      });
    } else if (this.mode === 'blog') {
      this.getBlog().subscribe((blogs) => {
        this.data = blogs;
        this.selectedItem = this.data.find(
          (element) => element.slug === selectedItemSlug
        );
        this.formjson = blog_form.clone();
      });
    }
  }
  openWindowAdderDialog() {
    var dialog_data = {
      title: ' Window',
      url: `${Urls.rootUrl}/api/admin/window`,
      formjson: this.formjson,
      saveMethod: 'post',
      hasDelete: false,
    };

    var dialogRef = this.dialog.open(ModalFormComponent, {
      width: '500px',
      data: dialog_data,
    });
  }
  openSchemaAdderDialog() {
    var dialog_data = {
      title: ' Schema',
      url: `${Urls.rootUrl}/api/admin/schema`,
      formjson: this.formjson,
      saveMethod: 'post',
      hasDelete: false,
    };

    var dialogRef = this.dialog.open(ModalFormComponent, {
      width: '500px',
      data: dialog_data,
    });
  }
  openBlogAdderDialog() {
    var dialog_data = {
      title: ' Blog',
      url: `${Urls.rootUrl}/api/admin/paper`,
      formjson: this.formjson,
      saveMethod: 'post',
      hasDelete: false,
    };

    var dialogRef = this.dialog.open(ModalFormComponent, {
      width: '500px',
      data: dialog_data,
    });
  }
  onSelect(newItem) {
    this.selectedItem = newItem;
  }
  getWindowType(): Observable<any> {
    return this.coreService.getObject<any>(
      `${Urls.rootUrl}/api/admin/windowtype`
    );
  }
  getWindows(): Observable<CoreWindow[]> {
    return this.coreService.getObject<CoreWindow[]>(
      `${Urls.rootUrl}/api/admin/window`
    );
  }
  getSchemas(): Observable<CoreSchema[]> {
    return this.coreService.getObject<CoreSchema[]>(
      `${Urls.rootUrl}/api/admin/schema`
    );
  }
  getBlog(): Observable<CoreBlog[]> {
    return this.coreService.getObject<CoreBlog[]>(
      `${Urls.rootUrl}/api/admin/paper`
    );
  }
}
@Component({
  selector: 'core-schema',
  templateUrl: './templates/schema.html',
})
export class SchemaComponent implements OnInit {
  schema_id: string;
  schema: CoreSchema;
  schemaForm: FormGroup;
  schemaFormJson: CoreForm;
  migrationTemplate = new CoreMigration();
  router_events$;
  url: string;
  constructor(
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formService: FormService
  ) {
    this.router_events$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    );
  }
  ngOnInit() {
    this.main();
    this.router_events$.subscribe((event: NavigationEnd) => {
      this.main();
    });
  }
  main() {
    this.schema_id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.schema_id) {
      this.url = `${Urls.rootUrl}/api/admin/schema/${this.schema_id}`;
      this.getSchema().subscribe((schema) => {
        this.schema = Object.assign({}, schema);
        this.schemaForm = Object.assign(
          {},
          this.formService.schemaToForm(schema)
        );
        this.schemaFormJson = Object.assign(
          {},
          this.formService.schemaToJson(schema)
        );
      });
    }
  }
  ngOnDestroy() {
    if (this.router_events$) this.router_events$.unsubscribe();
  }
  getSchema(): Observable<CoreSchema> {
    return this.coreService.getObject<CoreSchema>(
      `${Urls.rootUrl}/api/admin/schema/${this.schema_id}`
    );
  }
}
@Component({
  selector: 'core-blog',
  templateUrl: './templates/blog.html',
})
export class BlogComponent implements OnInit {
  blogForm = this.fb.group({
    text: ['', []],
    title: ['', [Validators.required]],
    slug: [
      '',
      [Validators.required, Validators.pattern('^[a-z0-9][a-z-0-9]*[a-z0-9]$')],
    ],
    description: ['', [Validators.maxLength(500)]],
    categories: ['', []],
    parentscategories: ['', []],
  });
  fileForm = new FormGroup({
    banner: new FormControl('', []),
  });
  slug: string;
  bannerLink: string;
  loading = true;
  allTags: any[];
  allCategories: any;
  categoryOptions: any[];
  blogTags: any[] = [];
  tagCtrl = new FormControl();
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER];
  filteredTags: Observable<string[]>;
  uploading = false;
  deleting = false;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  mediaUrl = Urls.rootUrl;
  router_events$;
  constructor(
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private sharedDataService: SharedDataService
  ) {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) =>
        tag ? this._filter(tag) : this.allTags.slice()
      )
    );
    this.router_events$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    );
  }
  private _filter(value: string): any {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(
      (tag) => tag.toLowerCase().indexOf(filterValue) === 0
    );
  }
  ngOnInit() {
    this.main();
    this.router_events$.subscribe(() => {
      this.main();
    });
  }
  main() {
    this.loading = true;
    this.slug = this.activatedRoute.snapshot.paramMap.get('slug');
    if (this.slug) {
      this.getBlog()
        .pipe(
          switchMap((blog) => {
            this.blogForm.get('text').setValue(blog.text);
            this.blogForm.get('title').setValue(blog.title);
            this.blogForm.get('slug').setValue(blog.slug);
            this.blogForm.get('description').setValue(blog.description);
            this.blogForm.get('categories').setValue(blog.categories);
            this.blogForm
              .get('parentscategories')
              .setValue(blog.parent_category);
            this.blogTags = blog.tags;
            this.bannerLink = blog.banner;
            this.loading = false;
            this.getParentsCategories().subscribe((cat: CoreCategorie) => {
              this.allCategories = cat;

              this.fillCategories(blog.parent_category);
            });
            return this.sharedDataService.sharedTags;
          })
        )
        .subscribe((tags) => {
          this.allTags = tags;
        });
    }
  }
  getBlog(): Observable<CoreBlog> {
    return this.coreService.getObject<CoreBlog>(
      `${Urls.rootUrl}/api/admin/paper/${this.slug}`
    );
  }
  getParentsCategories() {
    return this.coreService.getObject<CoreCategorie>(
      `${Urls.rootUrl}/api/admin/paperparentcategory`
    );
  }
  fillCategories(name: string) {
    if (!name) {
      this.categoryOptions = [];
      return;
    }
    let selectedSubCate = this.allCategories.sub_categories.find(
      (subCategory) => name === subCategory.name
    );
    this.categoryOptions = selectedSubCate.categories;
  }
  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.fileForm.get('banner').setValue(file);
    }
    this.fileForm.get('banner').updateValueAndValidity();
  }
  onSave() {
    if (this.blogForm.valid) {
      this.uploading = true;
      const formData = new FormData();
      for (let inp of Object.keys(this.blogForm.controls)) {
        formData.append(inp, this.blogForm.get(inp).value);
      }
      console.log(formData);

      this.blogTags.forEach((tag) => {
        formData.append('tags', tag);
      });
      if (this.fileForm.get('banner').value) {
        formData.append('banner', this.fileForm.get('banner').value);
      }
      this.coreService
        .putObject<any>(
          Urls.rootUrl + '/api/admin/paper/' + this.slug,
          formData
        )
        .subscribe(
          (result) => {
            window.location.href = `blog/${result.slug}`;
          },
          (error) => {
            alert(error.message);
            console.log(error);
          }
        );
    }
  }
  deleteItem() {
    if (confirm('Are you sure to delete "' + this.slug + '"?')) {
      this.deleting = true;
      this.coreService
        .deleteObject<any>(Urls.rootUrl + '/api/admin/paper/' + this.slug)
        .subscribe(
          (result) => {
            window.location.href = `blog/`;
          },
          (error) => {
            console.log('error');
          }
        );
    }
  }
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim()) {
      this.blogTags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.tagCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.blogTags.indexOf(fruit);

    if (index >= 0) {
      this.blogTags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.blogTags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.blogTags, event.previousIndex, event.currentIndex);
  }

  ngOnDestroy() {
    if (this.router_events$) this.router_events$.unsubscribe();
  }
  uploadCb(blobInfo, success, failure, progress) {
    var xhr, formData;
    var token = localStorage.getItem('token');

    xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.open('POST', 'https://api.etcuniverse.com/api/admin/papermedia/');
    xhr.setRequestHeader('Authorization', token);
    xhr.upload.onprogress = function (e) {
      progress((e.loaded / e.total) * 100);
    };

    xhr.onload = function () {
      var json;

      if (xhr.status === 403) {
        failure('HTTP Error: ' + xhr.status, { remove: true });
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        failure('HTTP Error: ' + xhr.status);
        return;
      }

      json = JSON.parse(xhr.responseText);

      if (!json) {
        failure('Invalid JSON: ' + xhr.responseText);
        return;
      }
      if (json.detail) {
        // failure(`${json.detail}`)
        alert('This file was existed');
      }
      success(`https://api.etcuniverse.com${json.file_field}`);
    };

    xhr.onerror = function () {
      failure(
        'Image upload failed due to a XHR Transport error. Code: ' + xhr.status
      );
    };

    formData = new FormData();
    formData.append('file_field', blobInfo.blob());

    xhr.send(formData);
  }

  useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  tinyConfig = {
    plugins: [
      '  preview paste  searchreplace autolink directionality code visualblocks visualchars  image link media  codesample table charmap hr   anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable  quickbars emoticons',
    ],
    imagetools_cors_hosts: ['picsum.photos'],
    menubar: 'file edit view insert format tools table help',
    toolbar:
      'undo redo | bold italic underline strikethrough |  fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | ltr rtl| outdent indent | numlist bullist | forecolor backcolor removeformat | charmap emoticons | insertfile image media link anchor | preview  ',
    toolbar_sticky: true,
    image_advtab: true,
    directionality: 'rtl',
    content_style: 'img { height: auto;}',
    video_template_callback: function (data) {
      return (
        '<video width="' +
        data.width +
        '" height="' +
        data.height +
        '"' +
        (data.poster ? ' poster="' + data.poster + '"' : '') +
        ' controls="controls">\n' +
        '<source src="' +
        data.source +
        '"' +
        (data.sourcemime ? ' type="' + data.sourcemime + '"' : '') +
        ' />\n' +
        (data.altsource
          ? '<source src="' +
            data.altsource +
            '"' +
            (data.altsourcemime ? ' type="' + data.altsourcemime + '"' : '') +
            ' />\n'
          : '') +
        '</video>'
      );
    },
    images_upload_handler: this.uploadCb,
    importcss_append: true,
    template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
    template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
    height: 500,
    image_caption: true,
    quickbars_selection_toolbar:
      'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    noneditable_noneditable_class: 'mceNonEditable',
    toolbar_mode: 'sliding',
    contextmenu: 'link image imagetools table',

    // skin: this.useDarkMode ? 'oxide-dark' : 'oxide',
    // content_css: this.useDarkMode ? 'dark' : 'default',
  };
  get banner(): FormControl {
    return this.fileForm.get('banner') as FormControl;
  }
}
@Component({
  selector: 'core-navigator',
  templateUrl: './templates/navigator.html',
  animations: [
    trigger('mobileDesktopFrame', [
      state(
        'mobile',
        style({
          height: '760px',
          width: '369px',
          paddingTop: '0',
          paddingRight: '0',
          content: 'url(../../../assets/img/iphone.png)',
        })
      ),
      state(
        'desktop',
        style({
          height: '792px',
          width: '1312px',
          paddingTop: '0',
          paddingRight: '3px',
          content: 'url(../../../assets/img/macbook.png)',
        })
      ),
      transition('mobile <=> desktop', [animate('0.25s ease-in-out')]),
    ]),
    trigger('mobileDesktopIFrame', [
      state(
        'mobile',
        style({
          height: '561px',
          width: '320px',
        })
      ),
      state(
        'desktop',
        style({
          height: '600px',
          width: '1000px',
        })
      ),
      transition('mobile <=> desktop', [animate('0.25s ease-in-out')]),
    ]),
  ],
})
export class NavigatorComponent implements OnInit {
  window_id: string;
  window: CoreWindow;
  formjson: any;
  iframe_url: SafeResourceUrl;
  iframe_loading: boolean;
  iframe_toggle = localStorage.getItem('previewMode');
  iframe_modes = [
    {
      frame_top_offset: '0px',
      frame_left_offset: '3px',
      frame: 'macbook.png',
      width: '1000px',
      frame_width: '1312px',
      height: '600px',
      frame_height: '792px',
    },
    {
      frame_top_offset: '0px',
      frame_left_offset: '0px',
      frame: 'iphone.png',
      width: '320px',
      frame_width: '369px',
      height: '561px',
      frame_height: '760px',
    },
  ];
  router_events$;
  constructor(
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public clipboardService: ClipboardService,
    private snackBar: MatSnackBar,
    private reloader: ReloaderService,
    public dialog: MatDialog,
    public sanitizer: DomSanitizer
  ) {}
  ngOnInit() {
    this.iframe_loading = true;
    this.window_id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.window_id) {
      this.getWindow().subscribe((window) => {
        this.window = Object.assign({}, window);
        this.setIFrameUrl();
        this.populateForm();
      });
      this.router_events$ = this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      );
      this.router_events$.subscribe((event) => {
        this.window_id = this.activatedRoute.snapshot.paramMap.get('id');
        this.window = null;
        this.getWindow().subscribe((window) => {
          this.window = Object.assign({}, window);
          this.setIFrameUrl();
          this.populateForm();
        });
      });
    }
  }
  ngOnDestroy() {
    if (this.router_events$) this.router_events$.unsubscribe();
  }
  iframeOnChange(event) {
    localStorage.setItem('previewMode', event.checked);
  }
  setIFrameUrl() {
    this.iframe_url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://etcuniverse.com/${this.window.language}/${this.window.window_type}/${this.window.slug}`
    );
  }

  openWindowEditDialog() {
    var dialog_data = {
      title: 'Edit Window',
      url: `${Urls.rootUrl}/api/admin/window/${this.window_id}`,
      formjson: this.formjson,
      saveMethod: 'put',
      hasDelete: true,
    };

    var dialogRef = this.dialog.open(ModalFormComponent, {
      width: '500px',
      data: dialog_data,
    });
  }
  openComponentAddDialog(): void {
    const dialogRef = this.dialog.open(ComponentAdder, {
      width: '500px',
      data: { parent_id: this.window_id, parent_type: 'window' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
  getWindow(): Observable<CoreWindow> {
    return this.coreService.getObject<CoreWindow>(
      `${Urls.rootUrl}/api/admin/window/${this.window_id}`
    );
  }
  getWindowTypes(): Observable<any> {
    return this.coreService.getObject<any>(
      `${Urls.rootUrl}/api/admin/windowtype`
    );
  }
  populateForm() {
    this.getWindowTypes().subscribe((result) => {
      var window_types = result.map((n) => n['window_type']);
      this.formjson = window_form.clone();
      this.formjson['components'][4]['components'] = window_types;
      this.formjson.components.forEach((element, index) => {
        this.formjson.components[index]['value'] = this.window[element['name']];
      });
    });
  }
  paste(isRef: boolean = false) {
    if (!isRef) {
      this.clipboardService.pasteFromClipboard(this.window_id).subscribe(
        (result) => {
          this.snackBar
            .open('Components pasted successfully', 'Reload', {
              duration: 4000,
            })
            .afterDismissed()
            .subscribe(() => {
              this.reloader.reload();
            });
        },
        (error) => {
          this.snackBar.open('Copy failed', 'Dismiss', {
            duration: 4000,
          });
        }
      );
    } else {
      this.clipboardService.pasteRefFromClipboard(this.window_id).subscribe(
        (result) => {
          this.snackBar
            .open('Components pasted successfully', 'Reload', {
              duration: 4000,
            })
            .afterDismissed()
            .subscribe(() => {
              this.reloader.reload();
            });
        },
        (error) => {
          this.snackBar.open('Copy failed', 'Dismiss', {
            duration: 4000,
          });
        }
      );
    }
  }
}

@Component({
  selector: 'core-tree',
  templateUrl: './templates/tree.html',
})
export class TreeComponent implements OnInit {
  @Input() data: any;

  private _transformer = (node: CoreComponent, level: number) => {
    return {
      component: node,
      expandable: !!node.components && node.components.length > 0,
      name: node.name,
      level: level,
    };
  };
  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.components
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  router_events$: Subscription;
  isCopied: boolean = false;
  copyStates: {
    id: string;
    isCopied: boolean;
    data: any;
  }[] = [];
  contextMenuPosition = { x: 0, y: 0 };
  constructor(
    public dialog: MatDialog,
    public clipboardService: ClipboardService,
    private snackBar: MatSnackBar,
    private reloader: ReloaderService,
    private coreService: CoreService
  ) {}

  ngOnInit() {
    this.dataSource.data = this.data.components;
    var states = JSON.parse(localStorage.getItem('expandedStates') || '{}');
    this.treeControl.dataNodes.forEach((element) => {
      if (element.component.id in states && states[element.component.id]) {
        this.treeControl.expand(element);
      }
    });
  }
  ngOnChanges() {
    this.dataSource.data = this.data.components;
    var states = JSON.parse(localStorage.getItem('expandedStates') || '{}');
    this.treeControl.dataNodes.forEach((element) => {
      if (element.component.id in states && states[element.component.id]) {
        this.treeControl.expand(element);
      }
    });
  }
  openRefOriginalWindow(refId) {
    this.coreService
      .getObject<any>(`${Urls.rootUrl}/api/admin/reference/window/${refId}`)
      .subscribe((resualt) => {
        window.location.href = `/window/${resualt.window}`;
      });
  }
  // removeRefComponent(node: FlatNode) {
  //   const parentNode = this.getParentNode(node);
  //   let parentNodeId: string;
  //   if (parentNode === null) {
  //     // "data" is the parent window which is a Input from parent component
  //     parentNodeId = this.data.id;
  //   } else {
  //     parentNodeId = parentNode.component.id;
  //   }

  //   this.coreService
  //     .deleteObject(`${Urls.rootUrl}/api/admin/reference`, {
  //       parent_id: parentNodeId,
  //       component_id: node.component.id,
  //     })
  //     .subscribe((result) => {
  //       this.reloader.reload();
  //     });
  // }
  isRefDisabled(node: FlatNode) {
    if (this.treeControl.getLevel(node) < 1) {
      return false;
    }
    if (this.getParentNode(node).component.is_reference) {
      return true;
    }
  }
  getParentNode(node: FlatNode) {
    const currentLevel = this.treeControl.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const index = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = index; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.treeControl.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
  }
  onContextMenu(event: MouseEvent, trigger: MatMenuTrigger) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY - 10;
    trigger.openMenu();
  }
  openComponentEditDialog(component: CoreComponent) {
    this.dialog.open(ComponentEditor, {
      width: '500px',
      data: component,
    });
  }
  openComponentAddDialog(component: CoreComponent) {
    this.dialog.open(ComponentAdder, {
      width: '500px',
      data: { parent_id: component.id, parent_type: 'component' },
    });
  }
  copy(component: CoreComponent) {
    this.clipboardService.copyToClipboard(component.id);
    this.snackBar.open('Components copied!', 'Dismiss', { duration: 4000 });
  }
  paste(component: CoreComponent, isRef: boolean = false) {
    if (!isRef) {
      this.clipboardService.pasteFromClipboard(component.id).subscribe(
        (result) => {
          this.snackBar
            .open('Components pasted successfully', 'Reload', {
              duration: 4000,
            })
            .afterDismissed()
            .subscribe(() => {
              this.reloader.reload();
            });
        },
        (error) => {
          this.snackBar.open('Copy failed', 'Dismiss', {
            duration: 4000,
          });
        }
      );
    } else {
      // this.clipboardService.pasteRefFromClipboard(component.id).subscribe(
      //   (result) => {
      //     this.snackBar
      //       .open('Components pasted successfully', 'Reload', {
      //         duration: 4000,
      //       })
      //       .afterDismissed()
      //       .subscribe(() => {
      //         this.reloader.reload();
      //       });
      //   },
      //   (error) => {
      //     this.snackBar.open('Copy failed', 'Dismiss', {
      //       duration: 4000,
      //     });
      //   }
      // );
      console.log('not working yet!');
    }
  }
  hasChild(_: number, node: FlatNode) {
    return node.expandable;
  }
  saveExpandedStates(node) {
    var states = JSON.parse(localStorage.getItem('expandedStates') || '{}');
    states[node.component.id] = this.treeControl.isExpanded(node);
    localStorage.setItem('expandedStates', JSON.stringify(states));
  }
}

@Component({
  selector: 'core-component-editor',
  templateUrl: './templates/component-editor.html',
})
export class ComponentEditor implements OnInit {
  url: string;
  selected_schema: CoreSchema;

  schemaForm: FormGroup;
  schemaFormJson: CoreForm;
  errors = [];

  constructor(
    private coreService: CoreService,
    private formService: FormService,
    private reloader: ReloaderService,
    public dialogRef: MatDialogRef<ComponentEditor>,
    @Inject(MAT_DIALOG_DATA) public component: CoreComponent
  ) {}
  ngOnInit() {
    this.url = `${Urls.rootUrl}/api/admin/component/${this.component.id}`;
    this.getSchema().subscribe((schema) => {
      this.selected_schema = schema;
      this.schemaFormJson = this.formService.schemaToJson(
        schema,
        this.component
      );
      this.schemaForm = this.formService.schemaToForm(schema, this.component);
    });
  }
  getSchema() {
    return this.coreService.getObject<CoreSchema>(
      `${Urls.rootUrl}/api/admin/schema/${this.component.component_schema}`
    );
  }
  onSave() {
    if (this.schemaForm.valid) {
      var attrs = Object.assign({}, this.schemaForm.value);
      var api_template = {
        name: attrs.name,
        component_type: attrs.component_type,
        is_hidden: attrs.is_hidden || false,
        order: attrs.order,
      };
      delete attrs['name'];
      delete attrs['component_type'];
      delete attrs['is_hidden'];
      delete attrs['order'];
      api_template['attrs'] = attrs;
      api_template['component_schema'] = this.selected_schema.id;

      this.coreService.putObject<any>(this.url, api_template).subscribe(
        (result) => {
          this.reloader.reload();
          this.dialogRef.close(true);
        },
        (error) => {
          this.errors = error;
        }
      );
    }
  }
  deleteItem() {
    this.coreService.deleteObject<any>(this.url).subscribe(
      (result) => {
        this.reloader.reload();
        this.dialogRef.close(true);
      },
      (error) => {
        this.errors = error;
      }
    );
  }
}
@Component({
  selector: 'core-component-adder',
  templateUrl: './templates/component-adder.html',
})
export class ComponentAdder implements OnInit {
  url: string;
  selected_schema: CoreSchema;
  schemas: CoreSchema[];
  filteredSchemas: Observable<CoreSchema[]>;
  schemaControl = new FormControl();

  schemaForm: FormGroup;
  schemaFormJson: CoreForm;
  errors = [];

  constructor(
    private coreService: CoreService,
    private formService: FormService,
    public dialogRef: MatDialogRef<ComponentAdder>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit() {
    this.url = `${Urls.rootUrl}/api/admin/${this.data.parent_type}/${this.data.parent_id}`;

    this.getSchemas().subscribe((schemas) => {
      this.schemas = schemas;
      this.filteredSchemas = this.schemaControl.valueChanges.pipe(
        startWith(''),
        map((value) => (typeof value === 'string' ? value : value.name)),
        map((name) => (name ? this._filter(name) : this.schemas.slice()))
      );
    });
  }
  getSchemas() {
    return this.coreService.getObject<CoreSchema[]>(
      `${Urls.rootUrl}/api/admin/schema`
    );
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  displayFn(schema: CoreSchema): string {
    return schema && schema.name ? schema.name : '';
  }

  private _filter(name: string): CoreSchema[] {
    const filterValue = name.toLowerCase();

    return this.schemas.filter(
      (schema) => schema.name.toLowerCase().indexOf(filterValue) === 0
    );
  }
  onSelect(schema: CoreSchema) {
    this.selected_schema = schema;
    this.schemaForm = this.formService.schemaToForm(schema);
    this.schemaFormJson = this.formService.schemaToJson(schema);
  }
  onSave() {
    if (this.schemaForm.valid) {
      var attrs = Object.assign({}, this.schemaForm.value);
      var api_template = {
        name: attrs.name,
        component_type: attrs.component_type,
        is_hidden: attrs.is_hidden || false,
        order: attrs.order,
      };
      delete attrs['name'];
      delete attrs['component_type'];
      delete attrs['is_hidden'];
      delete attrs['order'];
      api_template['attrs'] = attrs;
      api_template['component_schema'] = this.selected_schema.id;

      this.coreService.setObject<any>(this.url, api_template).subscribe(
        (result) => {
          // this.modalService.dismissAll();
          location.reload();
        },
        (error) => {
          this.errors = error;
        }
      );
    }
  }
}

@Component({
  selector: 'core-modal-code',
  templateUrl: './templates/modal-code.html',
})
export class ModalCodeComponent {
  @Input() data: any;
  @Input() title: string;
  @Input() url: string;
  @Input() icon: string;
  @Input() saveMethod: string;
  @Input() hasDelete: boolean;
  public isCollapsed = true;
  errors = [];
  constructor(private coreService: CoreService, private jsonSaver: JsonSaver) {}
  open(content) {
    // this.modalService.open(content).result.then();
  }
  onSave() {
    if (this.saveMethod === 'post') {
      this.coreService.setObject<any>(this.url, this.jsonSaver.data).subscribe(
        (result) => {
          // this.modalService.dismissAll();
          location.reload();
        },
        (error) => {
          this.errors = error;
        }
      );
    } else if (this.saveMethod === 'put') {
      this.coreService.putObject<any>(this.url, this.jsonSaver.data).subscribe(
        (result) => {
          // this.modalService.dismissAll();
          location.reload();
        },
        (error) => {
          this.errors = error;
        }
      );
    }
  }
  deleteItem() {
    this.coreService.deleteObject<any>(this.url).subscribe(
      (result) => {
        // this.modalService.dismissAll();
        location.reload();
      },
      (error) => {
        this.errors = error;
      }
    );
  }
}
@Component({
  selector: 'core-modal-form',
  templateUrl: './templates/modal-form.html',
})
export class ModalFormComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  errors = [];
  constructor(
    private coreService: CoreService,
    private formService: FormService,
    private reloader: ReloaderService,
    public dialogRef: MatDialogRef<ModalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit() {
    this.formGroup = this.formService.jsonToForm(this.data.formjson);
  }
  ngOnDestroy() {}
  onSave() {
    if (this.formGroup.valid) {
      if (this.data.saveMethod === 'post') {
        this.coreService
          .setObject<any>(this.data.url, this.formGroup.value)
          .subscribe(
            (result) => {
              location.reload();
            },
            (error) => {
              this.errors = error;
            }
          );
      } else if (this.data.saveMethod === 'put') {
        this.coreService
          .putObject<any>(this.data.url, this.formGroup.value)
          .subscribe(
            (result) => {
              this.reloader.reload();
              this.dialogRef.close(true);
            },
            (error) => {
              this.errors = error;
            }
          );
      }
    } else {
    }
  }
  deleteItem() {
    this.coreService.deleteObject<any>(this.data.url).subscribe(
      (result) => {
        this.reloader.backToParent();
        this.dialogRef.close(true);
      },
      (error) => {
        this.errors = error;
      }
    );
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'core-json-edit',
  templateUrl: './templates/json-edit.html',
})
export class JsonEditComponent implements OnInit {
  public editorOptions: JsonEditorOptions;
  @Input() public data: any;
  @ViewChild(JsonEditorComponent, { static: false })
  editor: JsonEditorComponent;

  constructor(private jsonSaver: JsonSaver) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'tree';
    this.editorOptions.expandAll = true;
  }
  ngOnInit() {
    if (this.data.id === '') {
      delete this.data['id'];
    }
  }
  ngOnChanges() {
    if (this.data.id === '') {
      delete this.data['id'];
    }
  }

  getData(edited: any) {
    this.jsonSaver.data = edited;
  }
}
