import React from 'react';
import { Card, Layout } from 'antd';
import DocumentForm from './Components/DocumentForm';
import DocumentRead from './Components/DocumentRead';
import './App.css';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  return (
    <Layout className="layout">
      <Content className="content">
        <Card className="card">
          <DocumentForm />
        </Card>
        <Card className="card">
          <DocumentRead />
        </Card>
      </Content>
    </Layout>
  );
};

export default AppLayout;
