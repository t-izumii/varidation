// Core
export { FormManager } from './core/FormManager';
export { Validator } from './core/Validator';
export { EventManager } from './utils/EventManager';
export { ValidationEvents } from './events/ValidationEvents';

// Core managers
export { FieldStateManager } from './core/FieldStateManager';
export { ErrorDisplayManager } from './core/ErrorDisplayManager';
export { ValidationEngine } from './core/ValidationEngine';
export { AccessibilityManager } from './core/AccessibilityManager';

// Validators
export { BaseValidator } from './validators/BaseValidator';
export { RequiredValidator } from './validators/RequiredValidator';
export { EmailValidator, EmailConfirmValidator } from './validators/EmailValidator';
export { TelValidator } from './validators/TelValidator';
export { PostalCodeValidator } from './validators/PostalCodeValidator';
export { TextValidator } from './validators/TextValidator';
export { CustomValidator, CompositeValidator, ConditionalValidator } from './validators/CustomValidator';

// UI
export { FieldState, FieldGroupState } from './ui/FieldState';
export { ErrorDisplay } from './ui/ErrorDisplay';
export { Accessibility } from './ui/Accessibility';

// Utils
export { Debouncer, debounce } from './utils/Debounce';
export { DOMHelper } from './utils/DOMHelper';
export { Normalizer } from './utils/Normalizer';

// Types
export * from './types';

// デフォルトエクスポート（互換性のため）
import { FormManager } from './core/FormManager';
import { FormManagerOptions } from './types';
import { PostalCodeValidator } from './validators/PostalCodeValidator';
import { TelValidator } from './validators/TelValidator';
import { EmailValidator, EmailConfirmValidator } from './validators/EmailValidator';
import { TextValidator } from './validators/TextValidator';
import { RequiredValidator } from './validators/RequiredValidator';
import { BaseValidator } from './validators/BaseValidator';
import { CustomValidator, CompositeValidator, ConditionalValidator } from './validators/CustomValidator';

/**
 * グローバルに公開するFormValidatorクラス
 * 既存のFormValidator.jsとの互換性を保つ
 */
export class FormValidator {
    private static instance: FormManager | null = null;
    
    // バリデータークラスを直接アクセス可能にする
    static PostalCodeValidator = PostalCodeValidator;
    static TelValidator = TelValidator;
    static EmailValidator = EmailValidator;
    static EmailConfirmValidator = EmailConfirmValidator;
    static TextValidator = TextValidator;
    static RequiredValidator = RequiredValidator;
    static BaseValidator = BaseValidator;
    static CustomValidator = CustomValidator;
    static CompositeValidator = CompositeValidator;
    static ConditionalValidator = ConditionalValidator;
    
    /**
     * 初期化（シングルトンパターン）
     */
    static init(options?: Partial<FormManagerOptions> & { debug?: boolean }, errorMessages?: Record<string, string>): FormManager {
        // フォーム要素を取得
        const form = document.querySelector('form');
        if (!form) {
            throw new Error('Form element not found');
        }

        // オプションを統合
        const mergedOptions: Partial<FormManagerOptions> & { debug?: boolean } = {
            ...options,
            customMessages: {
                ...options?.customMessages,
                ...errorMessages
            },
            disableSubmitUntilValid: options?.disableSubmitUntilValid
        };

        // 既存のオプションを変換
        if ('allowHyphensInTel' in (options || {})) {
            // TODO: バリデーターごとのオプション設定を実装
        }

        // インスタンスを作成
        if (this.instance) {
            this.instance.destroy();
        }
        
        this.instance = new FormManager(form as HTMLFormElement, mergedOptions);
        
        return this.instance;
    }

    /**
     * 現在のインスタンスを取得
     */
    static getInstance(): FormManager | null {
        return this.instance;
    }

    /**
     * count、disableSubmitUntilValidの必須の数を再チェック
     */
    static update(): void {
        if (this.instance) {
            this.instance.updateValidationCount();
        } else {
            console.warn('[FormValidator] Instance not found. Please initialize first.');
        }
    }

    /**
     * 必須項目をすべて一括でバリデーション、必須項目以外でも入力があれば対象のバリデーションを実行
     */
    static async check(): Promise<void> {
        if (this.instance) {
            await this.instance.validateAllFields();
        } else {
            console.warn('[FormValidator] Instance not found. Please initialize first.');
        }
    }

}

// window オブジェクトに追加（ブラウザ環境の場合）
if (typeof window !== 'undefined') {
    (window as any).FormValidator = FormValidator;
    (window as any).FormManager = FormManager;
}

export default FormValidator;
