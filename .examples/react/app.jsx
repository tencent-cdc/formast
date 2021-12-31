import React, { useState, useCallback, useRef } from 'react';
import { Formast } from '../../src/react';
import schemaJson from './form.json';
import { isEmpty } from 'ts-fns';
import { Select, Input, Label } from '../../src/react-d/components.jsx';

const Options = {
  components: {
    Select,
    Input,
    Label,
  },
}

export default function App() {
  const [errors, setErrors] = useState([]);
  const [data, setData] = useState({});
  const [random, setRandom] = useState(Math.random());
  const ref = useRef();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    const errors = ref.current.validate();
    if (errors.length) {
      setErrors(errors);
      setData({});
      return;
    }

    const data = ref.current.toData();
    setErrors([]);
    setData(data);
  }, []);

  const getJson = () => new Promise((r) => {
    setTimeout(() => r(schemaJson), 2000);
  });

  return (
    <div>
      <Formast
        schema={getJson}
        props={{
          onSubmit: handleSubmit,
          random: random,
        }}
        options={Options}
        onLoad={({ model }) => ref.current = model}
      >
        <span>正在加载...</span>
      </Formast>
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
