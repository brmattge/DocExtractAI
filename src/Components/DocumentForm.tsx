import React, { useEffect, useRef, useState } from 'react';
import { Select, Form, theme, InputRef, Tag, Input, Typography, Button } from 'antd';
import { SelectProps } from 'antd/es/select';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';

const { Option } = Select;

const DocumentForm: React.FC = () => {
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

    const handleChange: SelectProps['onChange'] = (value) => {
        setSelectedValue(value);

        if (value === 'apolice') {
            setFixedTags(['CNPJ', 'Número da Apólice', 'Valor da Apólice', 'Validade da Apólice']);
            setNewTags([]);
        } else if (value === 'nfe') {
            setFixedTags(['CNPJ', 'Número da NF-e', 'Valor da Nota', 'Data de Emissão', 'Descrição dos produtos ou serviços']);
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

    const handleUploadClick = () => {
        form.validateFields().then(() => {
            setIsDisabled(true);
            message.success('Upload iniciado...');
        }).catch(() => {

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
                        <Option value="apolice">Apólice</Option>
                        <Option value="nfe">NF-e</Option>
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

                <Button
                    type="primary"
                    style={{ marginLeft: 'auto', marginRight: '8px' }}
                    onClick={handleUploadClick}
                    icon={<UploadOutlined />}
                >
                    Upload PDF
                </Button>

                <Button onClick={handleReset}>Resetar</Button>
            </div>
        </div>
    );
};

export default DocumentForm;
