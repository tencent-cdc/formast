import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/neat.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/fold/foldgutter.css';

import { React, Component } from 'nautil';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import './jsonlint';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';

export class JsonCode extends Component {
  static props = {
    value: Object,
    onChange: true,
    onError: false,
  }

  handleChange = (editor, data, value) => {
    // 只能看，不能编辑
    if (this.props.disabled) {
      return;
    }
    try {
      const json = JSON.parse(value);
      this.props.onChange(json);
    } catch (e) {
      if (this.props.onError) {
        this.props.onError(e, value);
      }
    }
  };

  shouldUpdate() {
    return false;
  }

  render() {
    const { value } = this.props;
    const code = JSON.stringify(value, null, 4);
    return (
      <CodeMirror
        options={{
          mode: 'application/json',
          theme: 'neat',
          lineNumbers: true,
          styleActiveLine: true,
          foldGutter: true,
          lineWrapping: true,
          matchBrackets: true,
          gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
          lint: true,
          smartIndent: true,
          indentWithTabs: true,
          indentUnit: 4,
        }}
        value={code}
        onChange={this.handleChange}
      />
    );
  }
}
export default JsonCode;
