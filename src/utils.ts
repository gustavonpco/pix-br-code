/**
 * Utilitários para geração de códigos Pix
 */

/**
 * Formata um valor monetário para o padrão exigido pelo Pix
 * @param valor Valor a ser formatado (ex: "10.00", "0.10")
 * @returns Valor formatado conforme padrão \d{1,10}\.\d{2}
 */
export function formatarValor(valor: string): string {
  // Garante que o valor está no formato correto (regex \d{1,10}\.\d{2})
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico) || valorNumerico < 0) {
    throw new Error('Valor inválido. Deve ser um número positivo.');
  }
  
  return valorNumerico.toFixed(2);
}

/**
 * Calcula o CRC16 para o payload do Pix
 * @param str String para calcular o CRC16
 * @returns CRC16 em formato hexadecimal
 */
export function calcularCRC16(str: string): string {
  // Implementação do algoritmo CRC16-CCITT
  // Polinômio: x^16 + x^12 + x^5 + 1 (0x1021)
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  // Para cada caractere na string
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    
    // Para cada bit no byte
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }

  // Máscara de 16 bits e conversão para hexadecimal
  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera um campo EMV para o payload do Pix
 * @param id ID do campo EMV
 * @param valor Valor do campo
 * @returns Campo formatado no padrão EMV
 */
export function gerarCampoEMV(id: string, valor: string): string {
  const tamanho = valor.length.toString().padStart(2, '0');
  return `${id}${tamanho}${valor}`;
}

/**
 * Gera um campo EMV com subcampos
 * @param id ID do campo EMV
 * @param subcampos Array de subcampos no formato [id, valor]
 * @returns Campo formatado com subcampos
 */
export function gerarCampoComSubcampos(id: string, subcampos: Array<[string, string]>): string {
  let conteudo = '';
  
  // Gera cada subcampo
  for (const [subId, subValor] of subcampos) {
    conteudo += gerarCampoEMV(subId, subValor);
  }
  
  // Gera o campo principal com o conteúdo dos subcampos
  return gerarCampoEMV(id, conteudo);
}
