import React, { useState, useRef } from 'react';
import SchemaForm from '../../../src/antd/gpt/gpt';
import { Button, Spin, Input, message } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import VoiceGif from './voice.gif';
import { createSspeechRecorder } from './speech'
import './app.css';

const { TextArea } = Input;

export default function App() {
  const [prompt, setPropmt] = useState(`
模型:
  name 姓名 string
  age 年龄 number
  sex 性别 string options=男,女
字段逻辑：
  当年龄大于10时，性别才展示，否则隐藏
  当年龄大于15时，性别必填
布局:
  姓名
  年龄
  性别
提交目标地址：
  /api/save
  `.trim());
  const [schema, setSchema] = useState({});
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const speechRecorder = useRef();

  const handleSend = async () => {
    if (!prompt.trim()) {
      message.error('请填写提示语');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3005/api/gpt', {
        method: 'post',
        body: JSON.stringify({ prompt }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());
      const { code, error, data } = res;
      if (code) {
        message.error(error)
      }
      else {
        const { schema } = data;
        setSchema(schema)
      }
    }
    catch (e) {
      message.error(e.message)
    }
    finally {
      setLoading(false)
    }
  }

  const handleEndSpeech = () => {
    setRecording(false);
    speechRecorder.current?.stop();
    speechRecorder.current = null;
  }

  const handleStartSpeech = () => {
    setRecording(true)
    speechRecorder.current = createSspeechRecorder({
      onChange: setPropmt,
      onEnd: handleEndSpeech,
    })
  }

  return (
    <section>
      <main>
        {loading ? <div className="center"><Spin /></div> : prompt ? <SchemaForm schema={schema}></SchemaForm> : null}
      </main>
      <aside>
        <div className="prompt"><TextArea placeholder="请输入formast提示语..." className="prompt-input" value={prompt} onChange={e => setPropmt(e.target.value)}></TextArea></div>
        <div className="buttons">
          <Button shape="circle" icon={<AudioOutlined />} onClick={handleStartSpeech} />
          <Button type="primary" onClick={handleSend}>生成表单</Button>
        </div>
      </aside>
      <div className="voice-overlay" style={{ display: recording ? 'flex' : 'none' }} onClick={handleEndSpeech}><img src={VoiceGif} /></div>
    </section>
  );
}
