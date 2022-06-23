import { connectVueComponent } from '../vue/index.js';
import { TextConfig, LabelConfig, ButtonConfig, HBoxConfig, VBoxConfig, InputConfig, InputNumberConfig, TextAreaConfig, RadioGroupConfig, CheckboxGroupConfig, SelectConfig, FormConfig, FormGroupConfig, FormItemConfig, LoopConfig } from '../_shared/configs.js';

export const Text = connectVueComponent({}, TextConfig);

export const Label = connectVueComponent({}, LabelConfig);

export const Button = connectVueComponent({}, ButtonConfig);

export const HBox = connectVueComponent({}, HBoxConfig);

export const VBox = connectVueComponent({}, VBoxConfig);

export const Input = connectVueComponent({}, InputConfig);

export const InputNumber = connectVueComponent({}, InputNumberConfig);

export const Textarea = connectVueComponent({}, TextAreaConfig);

export const RadioGroup = connectVueComponent({}, RadioGroupConfig);

export const CheckboxGroup = connectVueComponent({}, CheckboxGroupConfig);

export const Select = connectVueComponent({}, SelectConfig);

export const Form = connectVueComponent({}, FormConfig);

export const FormGroup = connectVueComponent({}, FormGroupConfig);

export const FormItem = connectVueComponent({}, FormItemConfig);

export const Loop = connectVueComponent({}, LoopConfig);
