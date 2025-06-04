import type { ValidationResult, ValidationError } from '../types';
import { Validator } from './Validator';

interface ValidationOptions {
    validateOnInput: boolean;
    validateOnBlur: boolean;
    debounceDelay: number;
}

/**
 * バリデーションエンジンクラス
 * フィールドの検証ロジックを管理
 */
export class ValidationEngine {
    private options: ValidationOptions;
    private validator = new Validator();

    constructor(options: ValidationOptions) {
        this.options = options;
    }

    /**
     * フィールドを検証
     */
    async validateField(
        field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
        value: string,
        customMessages: Record<string, string> = {},
        validationOptions?: Record<string, any>
    ): Promise<ValidationResult> {
        // ValidatorのvalidateElementを使う
        return await this.validator.validateElement(field, {
            customMessages,
            validationOptions
        });
    }

    /**
     * Input要素のバリデーション
     */
    private async validateInputField(
        field: HTMLInputElement,
        value: string,
        errors: ValidationError[],
        customMessages: Record<string, string>
    ): Promise<void> {
        const type = field.type;

        // 型固有のバリデーション
        switch (type) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    errors.push({
                        rule: 'email',
                        message: customMessages.email || '有効なメールアドレスを入力してください',
                        value
                    });
                }
                break;

            case 'url':
                if (value && !this.isValidUrl(value)) {
                    errors.push({
                        rule: 'url',
                        message: customMessages.url || '有効なURLを入力してください',
                        value
                    });
                }
                break;

            case 'tel':
                if (value && !this.isValidPhone(value)) {
                    errors.push({
                        rule: 'tel',
                        message: customMessages.tel || '有効な電話番号を入力してください',
                        value
                    });
                }
                break;

            case 'number':
                if (value && !this.isValidNumber(value)) {
                    errors.push({
                        rule: 'number',
                        message: customMessages.number || '有効な数値を入力してください',
                        value
                    });
                }
                break;
        }

        // 長さのバリデーション
        if (field.minLength > 0 && value.length < field.minLength) {
            errors.push({
                rule: 'minlength',
                message: customMessages.minlength || `${field.minLength}文字以上で入力してください`,
                value
            });
        }

        if (field.maxLength > 0 && value.length > field.maxLength) {
            errors.push({
                rule: 'maxlength',
                message: customMessages.maxlength || `${field.maxLength}文字以下で入力してください`,
                value
            });
        }

        // 数値範囲のバリデーション
        if (type === 'number' && value) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                if (field.min && numValue < parseFloat(field.min)) {
                    errors.push({
                        rule: 'min',
                        message: customMessages.min || `${field.min}以上の値を入力してください`,
                        value
                    });
                }

                if (field.max && numValue > parseFloat(field.max)) {
                    errors.push({
                        rule: 'max',
                        message: customMessages.max || `${field.max}以下の値を入力してください`,
                        value
                    });
                }
            }
        }

        // パターンのバリデーション
        if (field.pattern && value) {
            const regex = new RegExp(field.pattern);
            if (!regex.test(value)) {
                errors.push({
                    rule: 'pattern',
                    message: customMessages.pattern || '入力形式が正しくありません',
                    value
                });
            }
        }
    }

    /**
     * Select要素のバリデーション
     */
    private validateSelectField(
        field: HTMLSelectElement,
        value: string,
        errors: ValidationError[],
        customMessages: Record<string, string>
    ): void {
        // 必須チェックは基本バリデーションで実施済み
        // 追加のselect固有のバリデーションがあればここに実装
    }

    /**
     * Textarea要素のバリデーション
     */
    private validateTextareaField(
        field: HTMLTextAreaElement,
        value: string,
        errors: ValidationError[],
        customMessages: Record<string, string>
    ): void {
        // 長さのバリデーション
        if (field.minLength > 0 && value.length < field.minLength) {
            errors.push({
                rule: 'minlength',
                message: customMessages.minlength || `${field.minLength}文字以上で入力してください`,
                value
            });
        }

        if (field.maxLength > 0 && value.length > field.maxLength) {
            errors.push({
                rule: 'maxlength',
                message: customMessages.maxlength || `${field.maxLength}文字以下で入力してください`,
                value
            });
        }
    }

    /**
     * メールアドレスの形式チェック
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * URLの形式チェック
     */
    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 電話番号の形式チェック
     */
    private isValidPhone(phone: string): boolean {
        const phoneRegex = /^[\d\-\(\)\+\s]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    /**
     * 数値の形式チェック
     */
    private isValidNumber(value: string): boolean {
        return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    }
}
