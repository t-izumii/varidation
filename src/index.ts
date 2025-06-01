// ================================================================================================
// メインエントリーポイント - ライブラリの全ての機能をエクスポート
// ================================================================================================

// ---- Coreモジュールのエクスポート ----
// FormManagerクラス：フォーム全体の管理を行うメインクラス
export { FormManager } from './core/FormManager';
// Validatorクラス：バリデーションエンジンの中核
export { Validator } from './core/Validator';
// EventManagerクラス：イベント管理のためのユーティリティクラス
export { EventManager } from './utils/EventManager';
// ValidationEventsクラス：バリデーション関連のイベント定数
export { ValidationEvents } from './events/ValidationEvents';

// ---- Core Manager群のエクスポート ----
// FieldStateManagerクラス：フィールドの状態管理を担当
export { FieldStateManager } from './core/FieldStateManager';
// ErrorDisplayManagerクラス：エラー表示の管理を担当
export { ErrorDisplayManager } from './core/ErrorDisplayManager';
// ValidationEngineクラス：バリデーション処理の実行エンジン
export { ValidationEngine } from './core/ValidationEngine';
// AccessibilityManagerクラス：アクセシビリティ機能の管理
export { AccessibilityManager } from './core/AccessibilityManager';

// ---- Validator群のエクスポート ----
// BaseValidatorクラス：全バリデーターの基底クラス
export { BaseValidator } from './validators/BaseValidator';
// RequiredValidatorクラス：必須入力チェックバリデーター
export { RequiredValidator } from './validators/RequiredValidator';
// EmailValidatorクラス：メールアドレス形式チェックバリデーター
// EmailConfirmValidatorクラス：メールアドレス確認フィールド用バリデーター
export { EmailValidator, EmailConfirmValidator } from './validators/EmailValidator';
// TelValidatorクラス：電話番号形式チェックバリデーター
export { TelValidator } from './validators/TelValidator';
// PostalCodeValidatorクラス：郵便番号形式チェックバリデーター
export { PostalCodeValidator } from './validators/PostalCodeValidator';
// TextValidatorクラス：テキスト形式（ひらがな、カタカナ等）チェックバリデーター
export { TextValidator } from './validators/TextValidator';
// CustomValidatorクラス：カスタムバリデーション機能を提供
// CompositeValidatorクラス：複数バリデーターの組み合わせ機能
// ConditionalValidatorクラス：条件付きバリデーション機能
export { CustomValidator, CompositeValidator, ConditionalValidator } from './validators/CustomValidator';

// ---- UIコンポーネント群のエクスポート ----
// FieldStateクラス：フィールド単体の状態管理
// FieldGroupStateクラス：フィールドグループの状態管理
export { FieldState, FieldGroupState } from './ui/FieldState';
// ErrorDisplayクラス：エラー表示UI管理
export { ErrorDisplay } from './ui/ErrorDisplay';
// Accessibilityクラス：アクセシビリティ機能のUI管理
export { Accessibility } from './ui/Accessibility';

// ---- ユーティリティ群のエクスポート ----
// Debouncerクラス：デバウンス処理のユーティリティ
// debounce関数：関数デコレーター形式のデバウンス機能
export { Debouncer, debounce } from './utils/Debounce';
// DOMHelperクラス：DOM操作のヘルパーユーティリティ
export { DOMHelper } from './utils/DOMHelper';
// Normalizerクラス：入力値正規化のユーティリティ
export { Normalizer } from './utils/Normalizer';

// ---- 型定義のエクスポート ----
// TypeScriptの型定義をすべてエクスポート
export * from './types';

// ================================================================================================
// 既存FormValidator.jsとの互換性のためのデフォルトエクスポート
// ================================================================================================

// 必要なクラスのインポート
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
    // シングルトンパターン用のインスタンス保持
    private static instance: FormManager | null = null;
    
    // ---- バリデータークラスを直接アクセス可能にする（静的プロパティ） ----
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
     * フォームバリデーションのセットアップを行う
     */
    static init(options?: Partial<FormManagerOptions> & { debug?: boolean }, errorMessages?: Record<string, string>): FormManager {
        // フォーム要素を取得（form要素が存在しない場合はエラー）
        const form = document.querySelector('form');
        if (!form) {
            throw new Error('Form element not found');
        }

        // オプションを統合（新しいオプションと既存のエラーメッセージを結合）
        const mergedOptions: Partial<FormManagerOptions> & { debug?: boolean } = {
            ...options,
            customMessages: {
                ...options?.customMessages,
                ...errorMessages
            },
            disableSubmitUntilValid: options?.disableSubmitUntilValid
        };

        // 既存のオプションを変換（後方互換性のため）
        if ('allowHyphensInTel' in (options || {})) {
            // TODO: バリデーターごとのオプション設定を実装
        }

        // 既存のインスタンスがあれば破棄
        if (this.instance) {
            this.instance.destroy();
        }
        
        // 新しいインスタンスを作成
        this.instance = new FormManager(form as HTMLFormElement, mergedOptions);
        
        return this.instance;
    }

    /**
     * 現在のインスタンスを取得
     * シングルトンインスタンスの取得
     */
    static getInstance(): FormManager | null {
        return this.instance;
    }

    /**
     * count、disableSubmitUntilValidの必須の数を再チェック
     * 除外エリアの切り替え時などに使用
     */
    static update(): void {
        if (this.instance) {
            // カウントを手動で更新
            this.instance.updateValidationCount();
        } else {
            console.warn('[FormValidator] Instance not found. Please initialize first.');
        }
    }

    /**
     * 必須項目をすべて一括でバリデーション、必須項目以外でも入力があれば対象のバリデーションを実行
     * フォーム送信前の一括チェックなどに使用
     */
    static async check(): Promise<void> {
        if (this.instance) {
            // 全フィールドのバリデーションを実行
            await this.instance.validateAllFields();
        } else {
            console.warn('[FormValidator] Instance not found. Please initialize first.');
        }
    }

}

// ================================================================================================
// ブラウザ環境でのグローバルオブジェクトへの追加
// ================================================================================================

// window オブジェクトに追加（ブラウザ環境の場合）
if (typeof window !== 'undefined') {
    // FormValidatorをグローバルに公開
    (window as any).FormValidator = FormValidator;
    // FormManagerもグローバルに公開（デバッグ用）
    (window as any).FormManager = FormManager;
}

// ---- デフォルトエクスポート ----
// FormValidatorクラスをデフォルトエクスポート
export default FormValidator;
