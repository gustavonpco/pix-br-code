import { describe, expect, test } from '@jest/globals';
import { Pix } from '../src/index';
import { formatarValor, calcularCRC16, gerarCampoEMV, gerarCampoComSubcampos } from '../src/utils';

// Mock para QRCode.toDataURL
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockedQRCode')
}));

describe('Utilitários', () => {
  test('formatarValor deve formatar corretamente', () => {
    expect(formatarValor('10')).toBe('10.00');
    expect(formatarValor('0.1')).toBe('0.10');
    expect(formatarValor('123.45')).toBe('123.45');
    expect(() => formatarValor('-10')).toThrow();
    expect(() => formatarValor('abc')).toThrow();
  });

  test('gerarCampoEMV deve gerar campo no formato correto', () => {
    expect(gerarCampoEMV('00', '01')).toBe('000201');
    expect(gerarCampoEMV('26', 'br.gov.bcb.pix')).toBe('2614br.gov.bcb.pix');
  });

  test('gerarCampoComSubcampos deve gerar campo com subcampos', () => {
    const subcampos: Array<[string, string]> = [
      ['00', 'br.gov.bcb.pix'],
      ['01', '12345678900']
    ];
    expect(gerarCampoComSubcampos('26', subcampos))
      .toBe('2630000014br.gov.bcb.pix01111234567890');
  });
});

describe('Função Pix', () => {
  test('deve gerar código Pix válido', async () => {
    const pixCode = await Pix(
      '12345678900',
      'FULANO DE TAL',
      'SAO PAULO',
      '10.00',
      'PEDIDO123'
    );
    
    // Verifica se o código começa com os campos obrigatórios
    expect(pixCode).toMatch(/^00020126/); // Payload Format Indicator + Point of Initiation Method
    
    // Verifica se contém a chave Pix
    expect(pixCode).toContain('12345678900');
    
    // Verifica se contém o nome do recebedor
    expect(pixCode).toContain('FULANO DE TAL');
    
    // Verifica se contém a cidade
    expect(pixCode).toContain('SAO PAULO');
    
    // Verifica se contém o valor
    expect(pixCode).toContain('10.00');
    
    // Verifica se contém o identificador
    expect(pixCode).toContain('PEDIDO123');
    
    // Verifica se termina com o CRC16
    expect(pixCode).toMatch(/6304[A-F0-9]{4}$/);
  });

  test('deve gerar QR Code em base64', async () => {
    const qrCode = await Pix(
      '12345678900',
      'FULANO DE TAL',
      'SAO PAULO',
      '10.00',
      'PEDIDO123',
      true
    );
    
    // Verifica se retorna uma string em base64
    expect(qrCode).toMatch(/^data:image\/png;base64,/);
  });

  test('deve validar parâmetros obrigatórios', async () => {
    await expect(Pix('', 'NOME', 'CIDADE', '10.00', 'ID')).rejects.toThrow('Chave Pix é obrigatória');
    await expect(Pix('12345678900', '', 'CIDADE', '10.00', 'ID')).rejects.toThrow('Nome do recebedor é obrigatório');
    await expect(Pix('12345678900', 'NOME', '', '10.00', 'ID')).rejects.toThrow('Cidade do recebedor é obrigatória');
    await expect(Pix('12345678900', 'NOME', 'CIDADE', '', 'ID')).rejects.toThrow('Valor é obrigatório');
  });
});
