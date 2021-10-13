import React, { useState, useCallback } from 'react';
import { createReactFormast } from '../../src/react/index.js';
import schemaJson from './form.json';
import { isEmpty } from 'ts-fns';
import { components } from '../../src/react-default';
import { InputNumber, FormItem } from './components.jsx'

const { Select, Input, Label } = components

const { model, Formast } = createReactFormast(schemaJson, {
  components: {
    Select,
    Input,
    Label,
    InputNumber,
    FormItem,
  },
})

export default function App() {
  const [errors, setErrors] = useState([]);
  const [data, setData] = useState({});
  const [random, setRandom] = useState(Math.random())

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    const errors = model.validate();
    if (errors.length) {
      setErrors(errors);
      setData({});
      return;
    }

    const data = model.toData();
    setErrors([])
    setData(data)
  }, [])

  return (
    <div>
      <Formast onSubmit={handleSubmit} random={random} />
      <div>
        {errors.map((err, i) => {
          return <div key={i} style={{ color: 'red' }}>{err.message}</div>
        })}
      </div>
      <pre>
        {isEmpty(data) ? null : JSON.stringify(data, null, 4)}
      </pre>
      <button onClick={() => setRandom(Math.random())}>Random</button>
    </div>
  );
}
