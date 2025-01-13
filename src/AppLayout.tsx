import React, { useState } from 'react';
import { Card, Layout } from 'antd';
import DocumentForm from './Components/DocumentForm';
import DocumentRead from './Components/DocumentRead';
import './App.css';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  const [formattedFields, setFormattedFields] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string>('');

  return (
    <Layout className="layout">
      <Content className="content">
        <Card className="card">
          <DocumentForm
            setFormattedFields={setFormattedFields}
            setSelectedDocument={setSelectedValue}
          />
        </Card>

        {formattedFields && (
          <Card className="card">
            <DocumentRead
              formattedFields={formattedFields}
              setSelectedDocument={selectedValue}
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default AppLayout;
