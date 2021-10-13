import { React, Component, useStore, Section, Each, nonable, Any, If, Switch, Case, useState } from 'nautil';
import { LayoutEditorStore } from './store.js';
import { makeKeyChain } from 'ts-fns';
import { InfoIcon, ArrayDownIcon, EditIcon } from '../components/icons';
import { Popover, Input, Switch as Toggler, Tooltip, Dropdown, Menu, InputNumber, Select, Modal, AutoComplete } from 'antd';
import { InputTags } from '../components/input-tags';
import { DATA_TYPES, DATA_TYPES_OPTIONS, getDataType, createFormattedValue, createDefaultValue, convertValueByType } from '../shared/utils.js';
import { JsonCode } from '../components/json-code/json-code.jsx';

import { ModelEditContext, FieldsSearchContext } from './context.js';

export class SettingsSidebar extends Component {
  static props = {
    store: LayoutEditorStore,
  }

  shouldUpdate() {
    return false;
  }

  Render() {
    const { store } = this.props;
    const { state, components } = useStore(store, ['selectedKeyPath']);
    const { selectedKeyPath } = state;
    const [isComponentJsonEditorShow, setComponentJsonEditorShow] = useState(false);

    const emptyHolder = <Section stylesheet={['formast-layout-editor__settings-sidebar']}></Section>;

    if (!selectedKeyPath) {
      return emptyHolder;
    }

    const handleEditJson = (nextJson) => {
      store.updateNode(selectedKeyPath, nextJson);
      setComponentJsonEditorShow(false);
    };

    const { value: componentJson } = store.parse(selectedKeyPath);
    if (!componentJson) {
      return emptyHolder;
    }
    const { type } = componentJson;

    // 必须从组件上读取配置信息
    const component = components[type];
    if (!component) {
      return emptyHolder;
    }
    const { formastConfig, formast: formastOptions = {} } = component;

    const { settings = [], title } = formastConfig;
    const { requireProps = [] } = formastOptions;

    return (
      <Section stylesheet={['formast-layout-editor__settings-sidebar']}>
        <Section stylesheet={['formast-layout-editor__settings-sidebar__header', 'formast-layout-editor__settings-sidebar__edit-item__title']}>
          <h2>
            <span>{title}</span>
            <Popover placement="leftTop" trigger="click" className="formast-layout-editor__settings-sidebar__edit-item__icon" title={title} content={(
              <div>
                <p>Type: {type}</p>
                <p>{`<${type}${requireProps ? ` ${requireProps.join(' ')}` : ''} />`}</p>
              </div>
            )}><span><InfoIcon /></span></Popover>
          </h2>
          <div className="formast-layout-editor__settings-sidebar__header__actions">
            <Tooltip title="直接编辑JSON" placement="leftTop">
              <span onClick={() => setComponentJsonEditorShow(true)}><EditIcon /></span>
            </Tooltip>
          </div>
        </Section>
        <Each of={settings} render={(setting) => {
          const { key } = setting;
          return (
            <SettingItem
              key={key}
              data={setting}
              keyPath={[...selectedKeyPath, ...makeKeyChain(key)]}
              store={store}
            />
          );
        }} />
        <If is={isComponentJsonEditorShow} render={() => (
          <JsonEditor
            isShow={isComponentJsonEditorShow}
            initJson={componentJson}
            onCancel={() => setComponentJsonEditorShow(false)}
            onSubmit={handleEditJson}
          />
        )} />
      </Section>
    );
  }
}

function JsonEditor(props) {
  const { onCancel, onSubmit, initJson, isShow } = props;
  const [value, setValue] = useState(initJson);
  return (
    <Modal
      title="编辑组件JSON"
      centered
      destroyOnClose
      visible={isShow}
      width={900}
      onCancel={onCancel}
      onOk={() => onSubmit(value)}
    >
      <JsonCode value={value} onChange={setValue} />
    </Modal>
  );
}

class SettingItem extends Component {
  static props = {
    title: nonable(String),
    keyPath: [String, Number],
    description: nonable(String),
    types: nonable(Object.values(DATA_TYPES)),
    options: nonable([{ text: String, value: Any }]),
    store: LayoutEditorStore,
  }

  shouldUpdate() {
    return false;
  }

  handleUpdateJson(parent, name, params, value) {
    const { store } = this.props;
    store.updateComponentJson(parent, name, params, value);
  }

  Render() {
    const { keyPath, store, data: setting } = this.props;
    const { name, params, value, parent } = store.useKeyPath(keyPath);
    const { title, description, key, types, options, fn } = setting;

    if (key === 'bind') {
      const tl = title || '字段绑定';
      return (
        <FieldsSearchContext.Consumer>
          {handleSearch => (
            <RichInput
              title={tl}
              name={name}
              description={description || '将本组件和模型上的字段进行绑定，以实现自动完成数据更新等能力'}
              fn={false}
              value={value}
              types={[DATA_TYPES.STR, DATA_TYPES.NIL]}
              onChange={(_, value) => {
                this.handleUpdateJson(parent, name, null, value);
              }}
              onSearch={str => handleSearch(str, store)}
            >
              <ModelEditContext.Consumer>{value => value}</ModelEditContext.Consumer>
            </RichInput>
          )}
        </FieldsSearchContext.Consumer>
      );
    }

    if (key === 'id') {
      const tl = title || 'ID绑定';
      return (
        <RichInput
          title={tl}
          name={name}
          description={description || 'UI节点上的ID值，该值使得该节点具有唯一性，便于调试等'}
          fn={false}
          value={value}
          types={[DATA_TYPES.STR, DATA_TYPES.NIL]}
          onChange={(_, value) => {
            this.handleUpdateJson(parent, name, null, value);
          }}
        />
      );
    }

    if (key === 'deps') {
      const tl = title || '依赖字段';
      return (
        <FieldsSearchContext.Consumer>
          {handleSearch => (
            <Section stylesheet={['formast-layout-editor__settings-sidebar__edit-item']}>
              <h4 className="formast-layout-editor__settings-sidebar__edit-item__title">
                <span>{tl}</span>
                <Popover title={tl} content={(
                  <ul>
                    <li>Key: {key}</li>
                    <li>通过依赖字段，可以提升性能</li>
                  </ul>
                )}><InfoIcon /></Popover>
              </h4>
              <div>
                <InputTags tags={value || []} onChange={(tags) => {
                  this.handleUpdateJson(parent, name, params, tags);
                }} onSearch={str => handleSearch(str, store)} />
              </div>
            </Section>
          )}
        </FieldsSearchContext.Consumer>
      );
    }

    if (key === 'visible') {
      const tl = title || '可见性';
      return (
        <RichInput
          title={tl}
          name={name}
          description={description || '该组件是否可见，仅支持表达式'}
          fn={false}
          value={value}
          types={[DATA_TYPES.EXP, DATA_TYPES.BOOL, DATA_TYPES.NIL]}
          onChange={(_, value) => {
            this.handleUpdateJson(parent, name, null, value);
          }}
        />
      );
    }

    if (key === 'repeat') {
      const tl = title || '循环';
      return (
        <RichInput
          title={tl}
          name={name}
          description={description || '该组件会被循环输出，注意循环特殊语法'}
          fn={false}
          value={value}
          types={[DATA_TYPES.STR, DATA_TYPES.NIL]}
          onChange={(_, value) => {
            this.handleUpdateJson(parent, name, null, value);
          }}
        />
      );
    }

    if (key === 'model') {
      const tl = title || '子模型绑定';
      return (
        <RichInput
          title={tl}
          name={name}
          description={description || '绑定子模型，改变当前作用域'}
          value={value}
          types={[DATA_TYPES.STR, DATA_TYPES.EXP, DATA_TYPES.NIL]}
          fn={false}
          onChange={(_, value) => {
            this.handleUpdateJson(parent, name, null, value);
          }}
        />
      );
    }

    return (
      <RichInput
        title={title || key}
        name={name}
        params={params}
        description={description}
        fn={fn}
        value={value}
        types={types}
        options={options}
        onChange={(params, value) => {
          this.handleUpdateJson(parent, name, params, value);
        }}
      />
    );
  }
}

function RichInput(props) {
  const {
    title,
    name,
    params,
    description,
    value: originValue,
    types,
    options,
    onChange,
    onSearch,
    fn,
    children,
  } = props;
  const type = getDataType(originValue);
  const value = convertValueByType(originValue, type);

  const [searchOptions, setSearchOptions] = useState([]);

  const handleChange = (value) => {
    const result = createFormattedValue(value, type);
    onChange(params, result);
  };
  const handleToggle = (checked) => {
    if (checked) {
      onChange([], originValue);
    } else {
      onChange(null, originValue);
    }
  };
  const handleSelectType = (newType) => {
    if (type === newType) {
      return;
    }
    const value = createDefaultValue(newType);
    const result = createFormattedValue(value, newType);
    onChange(params, result);
  };
  const handleUpdateParams = (params) => {
    onChange(params, originValue);
  };
  const handleSelect = (value) => {
    onChange(params, value);
  };

  const handleSearch = (value) => {
    Promise.resolve(onSearch(value)).then((data) => {
      // [{ label, value }]
      setSearchOptions(data);
    });
  };

  return (
    <Section stylesheet={['formast-layout-editor__settings-sidebar__edit-item']}>
      <div className="formast-layout-editor__settings-sidebar__edit-item__title">
        <h4>
          <span>{title}</span>
          <Popover placement="leftTop" trigger="click" className="formast-layout-editor__settings-sidebar__edit-item__icon" title={title} content={(
            <ul className="formast-layout-editor__settings-sidebar__edit-item__info">
              <li>Key: {name}</li>
              {description ? <li>{description}</li> : null}
            </ul>
          )}><span><InfoIcon /></span></Popover>
          {children}
        </h4>
        <If is={!!fn && !options} render={() => (
          <Tooltip title="该属性是否使用函数？" placement="topLeft">
            <Toggler checked={!!params} onChange={handleToggle} checkedChildren="是" unCheckedChildren="否" />
          </Tooltip>
        )} />
        <If is={!!types && !options} render={() => (
          <Dropdown className="formast-layout-editor__settings-sidebar__edit-item__types" placement="bottomRight" arrow={true}
            overlay={(
              <Menu className="formast-layout-editor__settings-sidebar__edit-item__data-types">
                <Each of={types} render={item => (
                  <Menu.Item key={item}>
                    <div onClick={() => handleSelectType(item)}>{DATA_TYPES_OPTIONS[item].label}</div>
                  </Menu.Item>
                )} />
              </Menu>
            )}
          ><span><ArrayDownIcon /></span></Dropdown>
        )} />
      </div>
      <div className="formast-layout-editor__settings-sidebar__edit-item__content">
        <If is={!!fn} render={() => (
          <Input value={params || ''} onChange={e => handleUpdateParams(e.target.value)} prefix='参数：(' suffix=')' />
        )} />
        <If is={!!options} render={() => (
          <Select options={options} value={value} onChange={handleSelect} />
        )} />
        <If is={!!types && !options} render={() => (
            <Switch of={type}>
              <Case is={DATA_TYPES.STR}
                render={() => {
                  if (onSearch) {
                    return (
                      <AutoComplete
                        value={value}
                        onChange={value => handleChange(value)}
                        options={searchOptions}
                        onSearch={handleSearch}
                        onSelect={value => handleChange(value)}
                      />
                    );
                  }
                  return (
                    <Input
                      value={value}
                      onChange={e => handleChange(e.target.value)}
                      prefix='"'
                      suffix='"'
                    />
                  );
                }} />
              <Case is={DATA_TYPES.NUM}
                render={() => <InputNumber value={value} onChange={value => handleChange(+value)} />} />
              <Case is={DATA_TYPES.BOOL}
                render={() => <Toggler checked={value} onChange={checked => handleChange(checked)} />} />
              <Case is={DATA_TYPES.EXP}
                render={() => <Input value={value} onChange={e => handleChange(e.target.value)} prefix='"{' suffix='}"' />} />
              <Case is={DATA_TYPES.JSON}
                render={() => <JsonCode value={value} onChange={json => handleChange(json)} />} />
              <Case is={DATA_TYPES.NIL}>NULL</Case>
            </Switch>
        )} />
      </div>
    </Section>
  );
}
