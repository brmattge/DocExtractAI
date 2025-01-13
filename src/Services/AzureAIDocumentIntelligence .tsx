import axios from 'axios';

const apiBaseAnalyzeUrl = process.env.REACT_APP_API_BASE_ANALYZE_URL;
const apiBaseAnalyzeResultUrl = process.env.REACT_APP_API_BASE_ANALYZE_RESULT_URL;
const apiVersion = process.env.REACT_APP_API_VERSION;
const apiKey = process.env.REACT_APP_OCP_APIM_SUBSCRIPTION_KEY;

export const uploadDocumentToApi = async (base64Source: string, queryFields: string) => {
    try {
        const body = { base64Source };
        const response = await axios.post(
            `${apiBaseAnalyzeUrl}?api-version=${apiVersion}&stringIndexType=utf16CodeUnit&queryFields=${queryFields}&features=queryFields`,
            body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': apiKey,
                },
            }
        );
        return response;
    } catch (error) {
        throw new Error('Erro ao fazer upload do documento.');
    }
};

export const getAnalyzeResult = async (apimRequestId: string) => {
    try {
        const response = await axios.get(
            `${apiBaseAnalyzeResultUrl}/${apimRequestId}?api-version=${apiVersion}`,
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                },
            }
        );
        return response;
    } catch (error) {
        throw new Error('Erro ao obter o resultado da análise.');
    }
};
