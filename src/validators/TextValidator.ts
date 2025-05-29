import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidatorOptions } from '../types';

/**
 * テキスト形式バリデーター
 * 数字、ひらがな、カタカナ、パスワードなどのテキスト形式を検証
 */
export class TextValidator extends BaseValidator {
    private patterns = {
        number: /^[0-9０-９]+$/,
        hiragana: /^[ぁ-んー　 ]+$/,
        katakana: /^[ァ-ヶー　 ]+$/,
        halfWidth: /^[0-9]+$/,
        password: /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,16}$/i, // 半角英数字をそれぞれ含む8文字以上16文字以下
    };

    private defaultMessages = {
        number: '数字で入力してください。',
        hiragana: '全角ひらがなで入力してください。',
        katakana: '全角カタカナで入力してください。',
        halfWidth: '半角数字で入力してください。',
        password: '半角英数字をそれぞれ含む8文字以上16文字以下で入力してください。'
    };

    /**
     * テキスト形式を検証
     */
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        // 空の場合はスキップ（RequiredValidatorで処理）
        if (this.isEmpty(value)) {
            return await this.handleNext(value, options);
        }

        // 文字列または数値に変換
        const conversionResult = this.convertToString(value, 'text', '文字列を入力してください。', options);
        if (!conversionResult.success) {
            return conversionResult.result;
        }
        const stringValue = conversionResult.value;

        // 検証タイプを取得
        const validationType = options?.textType || options?.validationType;
        if (!validationType) {
            // タイプが指定されていない場合は、次のバリデーターへ
            return await this.handleNext(stringValue, options);
        }

        // 各種テキスト形式の検証
        switch (validationType) {
            case 'number':
                // halfWidthがバリデーションルールに含まれている場合のみ半角数字チェック
                const hasHalfWidth = options?.validationTypes && options.validationTypes.includes('halfWidth');
                if (hasHalfWidth) {
                    const normalizedValue = this.normalizeNumber(stringValue);
                    if (!this.patterns.halfWidth.test(normalizedValue)) {
                        const message = this.defaultMessages.halfWidth;
                        return this.createFailureResult([
                            this.createError('halfwidth', message, value)
                        ]);
                    }
                    if (!this.patterns.number.test(normalizedValue)) {
                        const message = this.defaultMessages.number;
                        return this.createFailureResult([
                            this.createError('number', message, value)
                        ]);
                    }
                } else {
                    // 通常の数字チェック
                    if (!this.patterns.number.test(stringValue)) {
                        const message = this.defaultMessages.number;
                        return this.createFailureResult([
                            this.createError('number', message, value)
                        ]);
                    }
                }
                break;

            case 'halfWidth':
                if (!this.patterns.halfWidth.test(stringValue)) {
                    const message = this.createErrorMessage('halfwidth', this.defaultMessages.halfWidth, options);
                    return this.createFailureResult([
                        this.createError('halfwidth', message, value)
                    ]);
                }
                break;

            case 'hiragana':
                if (!this.patterns.hiragana.test(stringValue)) {
                    const message = this.createErrorMessage('hiragana', this.defaultMessages.hiragana, options);
                    return this.createFailureResult([
                        this.createError('hiragana', message, value)
                    ]);
                }
                break;

            case 'katakana':
                if (!this.patterns.katakana.test(stringValue)) {
                    const message = this.createErrorMessage('katakana', this.defaultMessages.katakana, options);
                    return this.createFailureResult([
                        this.createError('katakana', message, value)
                    ]);
                }
                break;

            case 'password':
                if (!this.patterns.password.test(stringValue)) {
                    const message = this.createErrorMessage('password', this.defaultMessages.password, options);
                    return this.createFailureResult([
                        this.createError('password', message, value)
                    ]);
                }
                break;

            default:
                // 未知のタイプの場合は、次のバリデーターへ
                break;
        }

        // 検証成功、次のバリデーターへ
        return await this.handleNext(stringValue, options);
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
