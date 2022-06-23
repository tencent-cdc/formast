import { connectVueComponent } from '../vue/index.js';

export const Text = connectVueComponent({}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { text } = bind;
    return { children: text };
  },
});
