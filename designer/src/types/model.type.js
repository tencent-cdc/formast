import { ifexist, Dict, List, Any, Mapping, Enum } from 'nautil'
import { VALUE_TYPES } from '../config/constants.js'

const AttributeConfigObj = {
  key: String, // attribute名
  title: ifexist(String), // 显示名
  description: ifexist(String), // 简单的提示语
  types: ifexist(new List(Object.values(VALUE_TYPES))), // 支持的输入类型
  value: Any, // 默认值
  // 当 types 支持 VALUE_TYPES.ENUM 时，需要传入 options 表示下拉选项
  options: ifexist([
    {
      text: String,
      value: Any,
    },
  ]),
  disabled: ifexist(Boolean), // 该选项是否禁止编辑
  emptyDrop: ifexist(Boolean), // 当值为空时，是否删除该属性
}

export const SchemaConfigType = new Dict({
  // attributes 控制界面上需要显示那些可用来编辑的元数据
  attributes: ifexist([
    AttributeConfigObj,
  ]),
  // rules 根据字段控制 attributes 的配置，rules 多出 field 信息，表示针对某个字段，覆盖原来的 attributes 的配置
  rules: ifexist([
    {
      field: String, // 字段名
      ...AttributeConfigObj,
    },
  ]),
  // 控制权限
  policies: ifexist(new Mapping({
    key: new Enum(['$', String]), // $表示全局设置
    value: {
      edit: ifexist(Boolean), // 是否可编辑
      remove: ifexist(Boolean), // 是否可移除
      rename: ifexist(Boolean), // 是否可重命名，前提是 edit=true 为 flase 的时候打开弹窗不能修改字段的 key
    },
  })),
  // 默认状态值
  state: ifexist(Object),
})
