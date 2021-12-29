import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

interface AnyObj {
  [key: string]: any;
}

interface ComponentJson {
  type: string;
  props: AnyObj;
  children: string | ComponentJson | (string | ComponentJson)[];
  visible?: boolean | string;
  id?: string;
  bind?: string;
  deps?: string[];
  vars: {
    [key: string]: any,
  };
  model: string;
  repeat: string;
}

interface SchemaJson {
  model?: {
    [field: string]: AnyObj | AnyObj[],
  };

  layout: ComponentJson;

  settings?: AnyObj;

  declares?: {
    props?: string[],
    components?: string[],
    macros?: string[],
    global?: string[],
    filters?: string[],
    fns?: string[],
    fetch?: true,
  };
}

interface FormastOptions {
  macros?: {
    [key: string]: Function,
  };

  components: {
    [key: string]: ComponentType,
  };

  global?: AnyObj;

  filters?: {
    [key: string]: Function,
  };

  fns?: {
    [key: string]: Function,
  };

  fetch?: Function;
}
interface IContext {
  model: any;
  Formast: ComponentType;
  schema: SchemaJson;
  declares: SchemaJson['declares'];
  settings: SchemaJson['settings'];
}
export declare function createReactFormast(schema: SchemaJson, options?: FormastOptions): IContext;

interface FormastProps {
  options: FormastOptions;
  schema: SchemaJson | (() => Promise<SchemaJson>);
  props?: AnyObj;
  onLoad?: Function;
}
export declare function Formast(props: PropsWithChildren<FormastProps>): ReactNode;

interface ConnectOptions {
  requireBind?: boolean | string;
  requireDeps?: string[];
  requireProps?: string[];
  mapToProps?(
    compiledProps: {
      bind: Object,
      deps?: {
        [key: string]: Object,
      },
    },
    originalProps: AnyObj,
    information: {
      id: string,
      type: string,
      bind?: string | undefined,
      deps?: string[] | undefined,
    },
  ): AnyObj;
}
export declare function connectReactComponent(C: ComponentType, options: ConnectOptions): ComponentType;
