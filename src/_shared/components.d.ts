/**
 * 统一规定默认集成包组件的接口
 */

/**
 * 虚拟DOM节点
 */
type VNode = string | any;

export interface Text {
  hidden?: boolean;
  keepAlive?: boolean;
  children: string;
}

export interface Label {
  hidden?: boolean;
  keepAlive?: boolean;
  children: VNode;
}

export interface Button {
  hidden?: boolean;
  keepAlive?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: string;
}

export interface HBox {
  hidden?: boolean;
  keepAlive?: boolean;
  children: VNode;
}

export interface VBox {
  hidden?: boolean;
  keepAlive?: boolean;
  children: VNode;
}

export interface Input {
  type?: 'text' | 'email' | 'url' | 'search';
  highlight?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  keepAlive?: boolean;
  value: string | null;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export interface InputNumber {
  highlight?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  max?: number;
  min?: number;
  keepAlive?: boolean;
  value: number | null;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export interface TextArea {
  highlight?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  keepAlive?: boolean;
  value: string | null;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  /**
   * 是否允许换行
   */
  nowrap?: boolean;
}

type Option<K = 'label' | 'value'> = {
  [key: K]: string;
}

export interface RadioGroup {
  options: Option[];
  valueKey?: string;
  labelKey?: string;
  name: string;
  value: string;
  onChange: (value: string, item: Option) => void;
  highlight?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  keepAlive?: boolean;
}

export interface CheckboxGroup {
  options: Option[];
  valueKey?: string;
  labelKey?: string;
  value: string[];
  onChange: (value: string[], items: Option[]) => void;
  highlight?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  keepAlive?: boolean;
}

// TODO multile, nested
export interface Select {
  options: Option[];
  valueKey?: string;
  labelKey?: string;
  value: string;
  onChange: (value: string, item: Option) => void;
  highlight?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  keepAlive?: boolean;
}

export interface Form {
  onSubmit: (e: any) => void;
}

export interface FormGroup {
  title?: string;
  hidden?: boolean;
  keepAlive?: boolean;
  children: VNode;
}

export interface FormItem {
  hidden?: boolean;
  keepAlive?: boolean;
  errors?: { message: string }[];
  label?: string;
  suffix?: VNode;
  children: VNode;
}

export interface Loop<T = any> {
  items: T[];
  render: (item: T, i: number, key: string) => VNode;
  empty?: VNode;
}
