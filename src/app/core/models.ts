export class CoreWindow {
  id: string;
  slug: string;
  window_type: string;
  language: string;
  name: string;
  tab_title: string;
  theme: string;
  components: any[];
}
export class CoreLanguage {
  code: string;
  direction: string;
  icon: string;
  name: string;
}
export class CoreSchema {
  id: string;
  name: string;
  schema: {
    type: string;
    properties: any;
    required: string[];
  };
  constructor() {
    this.id = '';
    this.name = '';
    this.schema = {
      type: 'object',
      properties: {
        fieldname1: {
          type: 'string',
          pattern: '.{4}',
          description: 'this string has to be atleast 4 characters',
        },
        fieldname2: { type: 'string', enum: ['asd', 'das', 'sad'] },
        fieldname3: { type: 'boolean' },
      },
      required: ['fieldname1'],
    };
  }
}
export class CoreBlog {
  title: string;
  id: string;
  date_created: Date;
  text: string;
  slug: string;
  banner: string;
  categories: string;
  parent_category: string;
  tags: string[];
  description: string;
}
export class CoreCategorie {
  sub_categories: [
    {
      id: string;
      name: string;
      sub_categories: any[];
      categories: [
        {
          id: string;
          name: string;
          parent_category: string;
        }
      ];
    }
  ];
}
export class CoreMigration {
  delete: string;
  add: {
    name: string;
    type: string;
    required: boolean;
    enum: string[];
    description: string;
    default: any;
  };
  constructor() {
    this.delete = '';
    this.add = {
      name: 'example',
      type: 'string',
      required: true,
      enum: [''],
      description: 'nothing',
      default: '',
    };
  }
}

export class CoreComponent {
  id: string;
  name: string;
  attrs: any;
  component_schema: string;
  components: any[];
  is_reference: boolean;
}

export class CoreForm {
  components: CoreInput[];
  constructor(components?: CoreInput[]) {
    this.components = components;
  }
  clone() {
    var inputs = [];
    this.components.forEach((element) => inputs.push(element.clone()));
    var new_form = new CoreForm(inputs);
    return new_form;
  }
}
export class CoreInput {
  name: string;
  input_type: string;
  placeholder: string | undefined;
  pattern: string | undefined;
  required: string;
  value: string;
  components: string[] | undefined;
  constructor(
    name: string,
    input_type: string,
    required: string,
    components?: string[],
    placeholder = '',
    pattern = '',
    value = ''
  ) {
    this.name = name;
    this.input_type = input_type;
    this.required = required;
    this.placeholder = placeholder;
    this.pattern = pattern;
    this.value = value;
    this.components = components;
  }
  clone() {
    var new_input = Object.assign({}, this);
    return new_input;
  }
}
export interface FlatNode {
  component: CoreComponent;
  expandable: boolean;
  name: string;
  level: number;
}
