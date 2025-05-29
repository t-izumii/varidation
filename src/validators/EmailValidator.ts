import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidatorOptions } from '../types';

/**
 * メールアドレスバリデーター
 */
export class EmailValidator extends BaseValidator {
    private emailPattern = /^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/;
    private defaultMessage = 'メールアドレスの形式が正しくありません。';

    /**
     * メールアドレスの形式を検証
     */
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        // 空の場合はスキップ（RequiredValidatorで処理）
        if (this.isEmpty(value)) {
            return await this.handleNext(value, options);
        }

        // 文字列または数値に変換
        const conversionResult = this.convertToString(value, 'email', this.defaultMessage, options);
        if (!conversionResult.success) {
            return conversionResult.result;
        }
        const stringValue = conversionResult.value;

        // メールアドレスの形式をチェック
        if (!this.emailPattern.test(stringValue)) {
            const message = this.createErrorMessage('email', this.defaultMessage, options);
            return this.createFailureResult([
                this.createError('email', message, value)
            ]);
        }

        // メールアドレス確認フィールドとの一致チェック（オプション）
        if (options?.checkConfirmation) {
            const confirmValue = options.confirmationValue;
            if (confirmValue && stringValue !== confirmValue) {
                const message = options.mismatchMessage || 'メールアドレスが一致しません。';
                return this.createFailureResult([
                    this.createError('email-mismatch', message, value)
                ]);
            }
        }

        // 検証成功、次のバリデーターへ
        return await this.handleNext(stringValue, options);
    }
}

/**
 * メールアドレス確認バリデーター
 */
export class EmailConfirmValidator extends BaseValidator {
    private defaultMessage = 'メールアドレスが一致しません。';

    /**
     * メールアドレスの一致を検証
     */
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        // 空の場合はスキップ（RequiredValidatorで処理）
        if (this.isEmpty(value)) {
            return await this.handleNext(value, options);
        }

        // 文字列または数値に変換
        const conversionResult = this.convertToString(value, 'email-conf', this.defaultMessage, options);
        if (!conversionResult.success) {
            return conversionResult.result;
        }
        const stringValue = conversionResult.value;

        // 比較対象のメールアドレスを取得
        const originalEmail = options?.originalEmail;
        if (!originalEmail) {
            // 比較対象がない場合は、DOM要素から取得を試みる（互換性のため）
            const emailElement = document.querySelector('input[data-validate*="email"]:not([data-validate*="email-conf"])') as HTMLInputElement;
            if (emailElement) {
                const emailValue = emailElement.value;
                if (stringValue !== emailValue) {
                    const message = this.createErrorMessage('email-conf', this.defaultMessage, options);
                    return this.createFailureResult([
                        this.createError('email-conf', message, value)
                    ]);
                }
            }
        } else {
            // オプションで指定された値と比較
            if (stringValue !== originalEmail) {
                const message = this.createErrorMessage('email-conf', this.defaultMessage, options);
                return this.createFailureResult([
                    this.createError('email-conf', message, value)
                ]);
            }
        }

        // 検証成功、次のバリデーターへ
        return await this.handleNext(stringValue, options);
    }
}
