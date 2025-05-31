import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidatorOptions } from '../types';

/**
 * 郵便番号バリデーター
 */
export class PostalCodeValidator extends BaseValidator {
    private patterns = {
        postalCodeWithHyphens: /^\d{3}-\d{4}$/,
        postalCodeWithoutHyphens: /^\d{7}$/,
        halfWidth: /^[0-9\-]+$/
    };

    private defaultMessages = {
        default: '郵便番号の形式が正しくありません。',
        withHyphens: '郵便番号はハイフン付きの形式で入力してください。',
        withoutHyphens: '郵便番号はハイフンなしの形式で入力してください。',
        halfWidth: '半角数字で入力してください。'
    };

    /**
     * 郵便番号の形式を検証
     */
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        if (this.isEmpty(value)) {
            return await this.handleNext(value, options);
        }

        // 文字列または数値に変換
        const conversionResult = this.convertToString(value, 'postal-code', this.defaultMessages.default, options);
        if (!conversionResult.success) {
            return conversionResult.result;
        }
        const stringValue = conversionResult.value;

        // 全角数字を半角に変換
        const normalizedValue = this.normalizeNumber(stringValue);

        // 半角数字チェック
        if (!this.patterns.halfWidth.test(normalizedValue)) {
            const message = this.createErrorMessage('postal-code-halfwidth', this.defaultMessages.halfWidth, options);
            return this.createFailureResult([
                this.createError('postal-code-halfwidth', message, value)
            ]);
        }

        // ハイフンの許可設定を取得
        const allowHyphens = options?.allowHyphens ?? null;

        // 郵便番号形式のチェック
        let isValid = false;
        let errorMessage = this.defaultMessages.default;

        if (allowHyphens === true) {
            isValid = this.patterns.postalCodeWithHyphens.test(normalizedValue);
            errorMessage = this.defaultMessages.withHyphens;
        } else if (allowHyphens === false) {
            isValid = this.patterns.postalCodeWithoutHyphens.test(normalizedValue);
            errorMessage = this.defaultMessages.withoutHyphens;
        } else {
            // null の場合は両方許可
            isValid = this.patterns.postalCodeWithHyphens.test(normalizedValue) || 
                     this.patterns.postalCodeWithoutHyphens.test(normalizedValue);
        }

        if (!isValid) {
            const message = this.createErrorMessage('postal-code', errorMessage, options);
            return this.createFailureResult([
                this.createError('postal-code', message, value)
            ]);
        }

        // 郵便番号自動入力が有効な場合の処理（オプション）
        if (options?.usePostalCodeJS && options?.onValidPostalCode) {
            options.onValidPostalCode(normalizedValue);
        }

        // 検証成功、次のバリデーターへ
        return await this.handleNext(normalizedValue, options);
    }

    /**
     * 全角数字を半角に変換
     */
    private normalizeNumber(value: string): string {
        return value
            .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
            .replace(/[ー－]/g, '-');
    }
}
