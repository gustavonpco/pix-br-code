/**
 * Implementação da função principal para geração de códigos Pix
 */
import * as QRCode from 'qrcode';
import { formatarValor, calcularCRC16, gerarCampoEMV, gerarCampoComSubcampos } from './utils';

/**
 * Gera um código Pix (Copia e Cola) ou QR Code em base64
 * 
 * @param chave Chave Pix do recebedor (CPF, CNPJ, e-mail, telefone ou chave aleatória)
 * @param nome Nome do recebedor
 * @param cidade Cidade do recebedor
 * @param valor Valor da transação (ex: "0.10", "10.00")
 * @param identificador Identificador da transação (txid)
 * @param gerarQRCode Se true, retorna a imagem do QR Code em base64; se false, retorna apenas o código Pix (Copia e Cola)
 * @returns String com o código Pix ou imagem do QR Code em base64
 */
export async function Pix(
  chave: string,
  nome: string,
  cidade: string,
  valor: string,
  identificador: string,
  gerarQRCode: boolean = false
): Promise<string> {
  // Validações básicas
  if (!chave) throw new Error('Chave Pix é obrigatória');
  if (!nome) throw new Error('Nome do recebedor é obrigatório');
  if (!cidade) throw new Error('Cidade do recebedor é obrigatória');
  if (!valor) throw new Error('Valor é obrigatório');
  
  // Formata o valor conforme padrão Pix
  const valorFormatado = formatarValor(valor);
  
  // Limita o tamanho do identificador (txid)
  const txid = identificador.substring(0, 25);
  
  // Início do payload do Pix (Payload Format Indicator)
  let payload = gerarCampoEMV('00', '01');
  
  // Point of Initiation Method
  // 11 = QR Code pode ser reutilizado várias vezes (estático)
  // 12 = QR Code só pode ser utilizado uma vez (dinâmico)
  payload += gerarCampoEMV('01', '11');
  
  // Merchant Account Information - Pix
  // Domínio "br.gov.bcb.pix"
  const merchantAccountInfo: [string, string][] = [
    ["00", "br.gov.bcb.pix"],
    ["01", chave],
  ];
  
  // Adiciona o identificador se fornecido
  if (txid) {
    merchantAccountInfo.push(['05', txid]);
  }
  
  payload += gerarCampoComSubcampos('26', merchantAccountInfo);
  
  // Merchant Category Code (MCC)
  payload += gerarCampoEMV('52', '0000');
  
  // Transaction Currency (986 = BRL - Real Brasileiro)
  payload += gerarCampoEMV('53', '986');
  
  // Transaction Amount (valor da transação)
  if (parseFloat(valorFormatado) > 0) {
    payload += gerarCampoEMV('54', valorFormatado);
  }
  
  // Country Code (BR - Brasil)
  payload += gerarCampoEMV('58', 'BR');
  
  // Merchant Name (nome do recebedor)
  payload += gerarCampoEMV('59', nome);
  
  // Merchant City (cidade do recebedor)
  payload += gerarCampoEMV('60', cidade);
  
  // Additional Data Field Template (campo adicional)
  if (identificador) {
    const additionalDataField: [string, string][] = [
      ["05", txid], // Reference Label (identificador da transação)
    ];
    payload += gerarCampoComSubcampos('62', additionalDataField);
  }
  
  // CRC16 (checksum)
  // Adiciona o campo do CRC vazio para calcular o CRC
  payload += '6304';
  
  // Calcula o CRC16 e adiciona ao payload
  const crc = calcularCRC16(payload);
  payload = payload.substring(0, payload.length - 4) + '6304' + crc;
  
  // Se solicitado, gera o QR Code em base64
  if (gerarQRCode) {
    try {
      const qrCodeBase64 = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 250
      });
      return qrCodeBase64;
    } catch (error) {
      throw new Error(`Erro ao gerar QR Code: ${error}`);
    }
  }
  
  // Retorna o código Pix (Copia e Cola)
  return payload;
}
