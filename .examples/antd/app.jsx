import React from 'react';
import schemaJson from '../_shared/form.json';
import * as Options from '../../src/antd';
import { Form } from '../react/app.jsx'

export default function App() {
  return <Form schemaJson={schemaJson} options={Options} />
}
