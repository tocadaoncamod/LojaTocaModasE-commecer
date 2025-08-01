/**
 * Serviço de validação matemática de CPF e CNPJ
 * Implementa algoritmos oficiais de validação
 */

export interface ValidationResult {
  isValid: boolean;
  type: 'cpf' | 'cnpj' | 'unknown';
  formatted: string;
  errors: string[];
}

export class CpfCnpjValidator {
  /**
   * Valida CPF ou CNPJ automaticamente
   */
  static validate(document: string): ValidationResult {
    const cleaned = this.cleanDocument(document);
    
    if (cleaned.length === 11) {
      return this.validateCPF(cleaned);
    } else if (cleaned.length === 14) {
      return this.validateCNPJ(cleaned);
    } else {
      return {
        isValid: false,
        type: 'unknown',
        formatted: document,
        errors: ['Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)']
      };
    }
  }

  /**
   * Validação matemática de CPF
   */
  static validateCPF(cpf: string): ValidationResult {
    const cleaned = this.cleanDocument(cpf);
    const errors: string[] = [];

    // Verificar comprimento
    if (cleaned.length !== 11) {
      errors.push('CPF deve ter exatamente 11 dígitos');
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleaned)) {
      errors.push('CPF não pode ter todos os dígitos iguais');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        type: 'cpf',
        formatted: this.formatCPF(cleaned),
        errors
      };
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (digit1 !== parseInt(cleaned.charAt(9))) {
      errors.push('Primeiro dígito verificador inválido');
    }

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    if (digit2 !== parseInt(cleaned.charAt(10))) {
      errors.push('Segundo dígito verificador inválido');
    }

    return {
      isValid: errors.length === 0,
      type: 'cpf',
      formatted: this.formatCPF(cleaned),
      errors
    };
  }

  /**
   * Validação matemática de CNPJ
   */
  static validateCNPJ(cnpj: string): ValidationResult {
    const cleaned = this.cleanDocument(cnpj);
    const errors: string[] = [];

    // Verificar comprimento
    if (cleaned.length !== 14) {
      errors.push('CNPJ deve ter exatamente 14 dígitos');
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleaned)) {
      errors.push('CNPJ não pode ter todos os dígitos iguais');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        type: 'cnpj',
        formatted: this.formatCNPJ(cleaned),
        errors
      };
    }

    // Validação do primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (digit1 !== parseInt(cleaned.charAt(12))) {
      errors.push('Primeiro dígito verificador inválido');
    }

    // Validação do segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    if (digit2 !== parseInt(cleaned.charAt(13))) {
      errors.push('Segundo dígito verificador inválido');
    }

    return {
      isValid: errors.length === 0,
      type: 'cnpj',
      formatted: this.formatCNPJ(cleaned),
      errors
    };
  }

  /**
   * Remove caracteres não numéricos
   */
  static cleanDocument(document: string): string {
    return document.replace(/\D/g, '');
  }

  /**
   * Formata CPF: 000.000.000-00
   */
  static formatCPF(cpf: string): string {
    const cleaned = this.cleanDocument(cpf);
    if (cleaned.length !== 11) return cpf;
    
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ: 00.000.000/0000-00
   */
  static formatCNPJ(cnpj: string): string {
    const cleaned = this.cleanDocument(cnpj);
    if (cleaned.length !== 14) return cnpj;
    
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata automaticamente CPF ou CNPJ
   */
  static formatDocument(document: string): string {
    const cleaned = this.cleanDocument(document);
    
    if (cleaned.length <= 11) {
      return this.formatCPF(cleaned);
    } else {
      return this.formatCNPJ(cleaned);
    }
  }

  /**
   * Gera CPF válido para testes
   */
  static generateValidCPF(): string {
    // Gerar 9 primeiros dígitos aleatórios
    const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += base[i] * (10 - i);
    }
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    base.push(digit1);

    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += base[i] * (11 - i);
    }
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    base.push(digit2);

    return this.formatCPF(base.join(''));
  }

  /**
   * Gera CNPJ válido para testes
   */
  static generateValidCNPJ(): string {
    // Gerar 12 primeiros dígitos (8 base + 4 filial)
    const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
    base.push(0, 0, 0, 1); // Filial 0001

    // Calcular primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += base[i] * weights1[i];
    }
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    base.push(digit1);

    // Calcular segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += base[i] * weights2[i];
    }
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    base.push(digit2);

    return this.formatCNPJ(base.join(''));
  }

  /**
   * Verifica se é CPF ou CNPJ válido
   */
  static isValidDocument(document: string): boolean {
    return this.validate(document).isValid;
  }

  /**
   * Detecta tipo do documento
   */
  static getDocumentType(document: string): 'cpf' | 'cnpj' | 'unknown' {
    const cleaned = this.cleanDocument(document);
    
    if (cleaned.length === 11) return 'cpf';
    if (cleaned.length === 14) return 'cnpj';
    return 'unknown';
  }
}