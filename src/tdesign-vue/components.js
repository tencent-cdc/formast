import {
  ButtonConfig,
  InputConfig,
  InputNumberConfig,
  TextAreaConfig,
  RadioGroupConfig,
  CheckboxGroupConfig,
  SelectConfig,
  FormConfig,
  FormItemConfig,
} from '../_shared/component-configs.js';
import { connectVueComponent } from '../vue/index.js';
import {
  Button as TButton,
  Form as TForm,
  Input as TInput,
  InputNumber as TInputNumber,
  TextArea as TTextArea,
  RadioGroup as TRadioGroup,
  CheckboxGroup as TCheckboxGroup,
  Select as TSelect,
  FormItem as TFormItem,
} from 'tdesign-vue';

export { Text, Label, HBox, VBox, FormGroup, Loop } from '../theme-vue/components.js';

export const Button = connectVueComponent(TButton, ButtonConfig);

export const Form = connectVueComponent(TForm, FormConfig);

export const FormItem = connectVueComponent(TFormItem, FormItemConfig);

export const Input = connectVueComponent(TInput, InputConfig);

export const InputNumber = connectVueComponent(TInputNumber, InputNumberConfig);

export const TextArea = connectVueComponent(TTextArea, TextAreaConfig);

export const RadioGroup = connectVueComponent(TRadioGroup, RadioGroupConfig);

export const CheckboxGroup = connectVueComponent(TCheckboxGroup, CheckboxGroupConfig);

export const Select = connectVueComponent(TSelect, SelectConfig);
