import React from 'react';

interface DocumentReadProps {
  formattedFields: string;
  setSelectedDocument: string;
}

const DocumentRead: React.FC<DocumentReadProps> = ({ formattedFields, setSelectedDocument }) => {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        Resultado do Documento - {setSelectedDocument}
      </h2>
      <div
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: formattedFields }}
      />
    </div>
  );
};

export default DocumentRead;
