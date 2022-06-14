import { CoreForm, CoreInput } from './models';
export const window_form = new CoreForm([
  new CoreInput('name', 'text', 'true', [], 'e.g IndexWindow'),
  new CoreInput('tab_title', 'text', 'true', [], 'e.g ETC Universe'),
  new CoreInput('slug', 'text', 'true', [], 'e.g index-window'),
  new CoreInput('theme', 'select', 'true', [
    'primary',
    'success',
    'info',
    'danger',
    'neutral',
  ]),
  new CoreInput('window_type', 'select', 'true', []),
  new CoreInput('language', 'select', 'true', ['en-us', 'fa-ir']),
]);

export const blog_form = new CoreForm([
  new CoreInput('title', 'text', 'true', [], 'e.g what to do what not to do?'),
  new CoreInput('slug', 'text', 'true', [], 'e.g what_to_do_what_not_to_do?'),
]);
