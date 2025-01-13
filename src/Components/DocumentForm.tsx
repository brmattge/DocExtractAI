import React, { useEffect, useRef, useState } from 'react';
import { Select, Form, theme, InputRef, Tag, Input, Typography, Button, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { getAnalyzeResult, uploadDocumentToApi } from '../Services/AzureAIDocumentIntelligence ';

const { Option } = Select;

interface DocumentFormProps {
    setFormattedFields: (formattedFields: string) => void;
    setSelectedDocument: (formattedFields: string) => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ setFormattedFields, setSelectedDocument }) => {
    const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
    const { token } = theme.useToken();
    const [fixedTags, setFixedTags] = useState<string[]>([]);
    const [newTags, setNewTags] = useState<string[]>([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);

    const handleChange = (value: string, option: any) => {
        setSelectedValue(value);
        setSelectedDocument(option.children);

        if (value === 'apolice') {
            setFixedTags(['Número da apólice', 'Número do contrato', 'Proposta', 'Vigência do seguro', 'Dados do segurado', 'Prêmio total']);
            setNewTags([]);
        } else if (value === 'nfse') {
            setFixedTags(['Número da nota', 'Data e hora da emissão', 'Nome do tomador de serviços', 'Discriminação dos serviços', 'Valor total dos serviços']);
            setNewTags([]);
        } else {
            setFixedTags([]);
            setNewTags([]);
        }
    };

    const handleClose = (removedTag: string) => {
        if (!fixedTags.includes(removedTag)) {
            const newTagsUpdated = newTags.filter((tag) => tag !== removedTag);
            setNewTags(newTagsUpdated);
        }
    };

    const showInput = () => {
        setInputVisible(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && !newTags.includes(inputValue)) {
            setNewTags([...newTags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };

    const forMap = (tag: string) => (
        <span key={tag} style={{ display: 'inline-block', marginRight: 8, marginBottom: 16 }}>
            <Tag
                closable={!fixedTags.includes(tag) && !isDisabled}
                onClose={(e) => {
                    e.preventDefault();
                    if (!isDisabled) {
                        handleClose(tag);
                    }
                }}
                color="blue"
            >
                {tag}
                {fixedTags.includes(tag) && (
                    <span style={{ color: 'red', marginLeft: 4, fontSize: '16px' }}>*</span>
                )}
            </Tag>
        </span>
    );

    const fixedTagChild = fixedTags.map(forMap);
    const newTagChild = newTags.map(forMap);

    const tagPlusStyle: React.CSSProperties = {
        background: token.colorBgContainer,
        borderStyle: 'dashed',
    };

    const formatTagsForQuery = (tags: string[]) => {
        return tags.map(tag => tag.replace(/\s+/g, '_'));
    };

    const handleFileChange = async (info: any) => {
        setIsDisabled(true);

        const fileList = info.fileList;

        if (fileList.length > 1) {
            message.error('Você só pode selecionar um arquivo.');
            setIsDisabled(false);
            return;
        }

        const currentFile = fileList[0]?.originFileObj;

        if (currentFile) {
            if (currentFile.type !== 'image/jpeg') {
                message.error('Apenas arquivos .jpg são permitidos.');
                return;
            }

            const removeAccents = (str: string) => {
                return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            };

            const fileName = removeAccents(currentFile.name.toLowerCase());

            if (selectedValue === 'apolice' && !fileName.includes('apolice')) {
                message.error('O arquivo deve ser uma Apólice de Seguro. Certifique-se que o nome do arquivo contém a nomenclatura apolice.', 5);
                setIsDisabled(false);
                return;
            }

            if (selectedValue === 'nfse' && !fileName.includes('nfs-e')) {
                message.error('O arquivo deve ser uma NFS-e. Certifique-se que o nome do arquivo contém a nomenclatura nfs-e.', 5);
                setIsDisabled(false);
                return;
            }

            try {
                await form.validateFields();

                if (currentFile) {
                    await handleUpload(currentFile);
                }
            } catch (error) {
                setIsDisabled(false);
            }
        }
    };

    const handleUpload = async (currentFile: File) => {
        try {
            message.success('Upload iniciado...');

            const base64Source = await convertFileToBase64(currentFile);
            const cleanedBase64Source = base64Source.split(',')[1];

            const formattedFixedTags = formatTagsForQuery(fixedTags);
            const formattedNewTags = formatTagsForQuery(newTags);

            const queryFields = [...formattedFixedTags, ...formattedNewTags].join('%2C');

            const body = {
                base64Source: cleanedBase64Source,
            };

            const response = await uploadDocumentToApi(cleanedBase64Source, queryFields);

            const apimRequestId = response.headers['apim-request-id'];

            if (apimRequestId) {
                message.warning('Analisando o documento...', 5);

                setTimeout(async () => {
                    try {
                        const resultResponse = await getAnalyzeResult(apimRequestId);

                        message.success('Upload finalizado com sucesso!');

                        const fields = resultResponse.data.analyzeResult.documents[0].fields;

                        const formatText = (fieldName: string, value: any) => {
                            const formattedFieldName = fieldName.replace(/_/g, ' ');
                            return `<strong>${formattedFieldName}:</strong> ${value}`;
                        };

                        const formattedFields = Object.keys(fields)
                            .map(field => {
                                const value = fields[field].valueString || '';
                                return formatText(field, value);
                            })
                            .join('<br/>');

                        setFormattedFields(formattedFields);

                        setIsDisabled(false);
                    } catch (resultError) {
                        message.error('Falha ao obter o resultado da análise. Aguarde alguns segundos e tente novamente.');
                        setIsDisabled(false);
                    }
                }, 5000);
            } else {
                message.success('Não foi possível fazer upload.');
                setIsDisabled(false);
            }
        } catch (error) {
            message.error('Falha ao fazer upload do documento.');
            setIsDisabled(false);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleReset = () => {
        setIsDisabled(false);
        form.resetFields();
        setSelectedValue(undefined);
        setFixedTags([]);
        setNewTags([]);
    };

    return (
        <div>
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="Tipo de Documento"
                    name="tipoDocumento"
                    rules={[{ required: true, message: 'Tipo de Documento é obrigatório' }]}
                >
                    <Select
                        value={selectedValue}
                        onChange={handleChange}
                        placeholder="Selecione"
                        disabled={isDisabled}
                    >
                        <Option value="apolice">Apólice de Seguro</Option>
                        <Option value="nfse">NFS-e</Option>
                    </Select>
                </Form.Item>
            </Form>

            <Typography.Text style={{ display: 'block', marginBottom: 8 }}>
                Dados a serem buscados
            </Typography.Text>

            <div style={{ marginBottom: 16 }}>
                {selectedValue && (
                    <div style={{ marginBottom: 8 }}>
                        <div>{fixedTagChild}</div>
                        <div>{newTagChild}</div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                {inputVisible ? (
                    <Input
                        ref={inputRef}
                        type="text"
                        size="large"
                        style={{ width: 400, height: 30, fontSize: '12px' }}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputConfirm}
                        onPressEnter={handleInputConfirm}
                        disabled={isDisabled} />
                ) : (
                    <Tag
                        onClick={!isDisabled ? showInput : undefined}
                        style={{
                            ...tagPlusStyle,
                            width: 400,
                            height: 30,
                            fontSize: '12px',
                            lineHeight: '30px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <PlusOutlined style={{ fontSize: '12px', marginRight: '8px' }} /> Adicionar nova busca
                    </Tag>
                )}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <Upload
                        beforeUpload={() => false}
                        onChange={handleFileChange}
                        maxCount={1}
                        accept="image/jpeg"
                        disabled={isDisabled}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />} disabled={isDisabled}>
                            Upload
                        </Button>
                    </Upload>

                    <Button onClick={handleReset}>Resetar</Button>
                </div>
            </div>
        </div>
    );
};

export default DocumentForm;
