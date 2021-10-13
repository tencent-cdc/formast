import { Tag, Input, Tooltip, AutoComplete } from 'antd';
import React, { Component } from 'react';
import { AddIcon } from '../icons';

export class InputTags extends Component {
  state = {
    tags: [],
    inputVisible: false,
    inputValue: '',
    editInputIndex: -1,
    editInputValue: '',
    searchOptions: [],
  };

  handleClose = (removedTag) => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
    if (this.props.onChange) {
      this.props.onChange(tags);
    }
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input && this.input.focus());
  };

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  handleChange = (value) => {
    this.setState({ inputValue: value });
  }

  handleSelect = (value) => {
    this.setState({ inputValue: value }, this.handleInputConfirm);
  }

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
    if (this.props.onChange) {
      this.props.onChange(tags);
    }
  };

  handleEditInputChange = (e) => {
    this.setState({ editInputValue: e.target.value });
  };

  handleEditInputConfirm = () => {
    const { tags, editInputIndex, editInputValue } = this.state;
    const newTags = [...tags];
    newTags[editInputIndex] = editInputValue;
    this.setState({
      tags: newTags,
      editInputIndex: -1,
      editInputValue: '',
    });
    if (this.props.onChange) {
      this.props.onChange(newTags);
    }
  };

  saveInputRef = (input) => {
    this.input = input;
  };

  saveEditInputRef = (input) => {
    this.editInput = input;
  };

  componentDidMount() {
    const { tags } = this.props;
    if (tags && tags.length) {
      this.setState({ tags });
    }
  }

  handleSearch = (value) => {
    const { onSearch } = this.props;
    Promise.resolve(onSearch(value)).then((data) => {
      // [{ label, value }]
      this.setState({ searchOptions: data });
    });
  };

  render() {
    const { tags, inputVisible, inputValue, editInputIndex, editInputValue } = this.state;
    const { unremovableTags, onSearch } = this.props;
    return (
      <div className="formast__input-tags">
        {tags.map((tag, index) => {
          if (editInputIndex === index) {
            return (
              <Input
                ref={this.saveEditInputRef}
                key={tag}
                size="small"
                className="input-tags__tag-input"
                value={editInputValue}
                onChange={this.handleEditInputChange}
                onBlur={this.handleEditInputConfirm}
                onPressEnter={this.handleEditInputConfirm}
              />
            );
          }

          const isLongTag = tag.length > 20;

          const tagElem = (
            <Tag
              className="input-tags__edit-tag"
              key={tag}
              closable={unremovableTags ? !unremovableTags.includes(tag) : true}
              onClose={() => this.handleClose(tag)}
            >
              <span
                onClick={(e) => {
                  if (unremovableTags ? !unremovableTags.includes(tag) : true) {
                    this.setState({ editInputIndex: index, editInputValue: tag }, () => {
                      this.editInput.focus();
                    });
                    e.preventDefault();
                  }
                }}
              >
                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
              </span>
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}

        {!!inputVisible && !!onSearch && (
          <AutoComplete
            className="input-tags__tag-input"
            value={inputValue}
            options={this.state.searchOptions}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
            onBlur={this.handleInputConfirm}
            onSearch={this.handleSearch}
          />
        )}
        {!!inputVisible && !onSearch && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            className="input-tags__tag-input"
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag className="input-tags__tag-add input-tags__edit-tag" onClick={this.showInput}>
            <AddIcon /> 添加
          </Tag>
        )}
      </div>
    );
  }
}
