import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidatorOptions } from '../types';

/**
 * 必須入力バリデーター
 */
export class RequiredValidator extends BaseValidator {
    private defaultMessages = {
        default: 'この項目は入力必須です。',
        name: 'お名前を入力してください。',
        furiganaHira: 'ふりがなを入力してください。',
        furiganaKana: 'フリガナを入力してください。',
        postalCode: '郵便番号を入力してください。',
        postal: '住所を入力してください。',
        tel: '電話番号を入力してください。',
        email: 'メールアドレスを入力してください。',
        emailConf: '確認用メールアドレスを入力してください。',
        password: 'パスワードを入力してください。',
        text: 'お問い合わせ内容を入力してください。',
        checkbox: 'チェックボックスを選択してください。',
        radiobox: 'ラジオボタンを選択してください。',
        agree: '個人情報保護方針の同意にチェックを入れてください。',
        select: '選択してください。'
    };

    /**
     * 値が必須かどうかを検証
     */
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        // 値が空かチェック
        if (this.isEmpty(value)) {
            const message = this.determineErrorMessage(options);
            return this.createFailureResult([
                this.createError('required', message, value)
            ]);
        }

        // 値が存在する場合は、次のバリデーターに処理を渡す
        return await this.handleNext(value, options);
    }

    /**
     * エラーメッセージを決定
     */
    private determineErrorMessage(options?: ValidatorOptions): string {
        // カスタムメッセージが指定されている場合
        if (options?.message) {
            return options.message;
        }

        // カスタムエラーメッセージ（emesse1, emesse2等）が指定されている場合
        if (options?.customMessageKey && options?.customMessages?.[options.customMessageKey]) {
            return options.customMessages[options.customMessageKey];
        }

        // フィールドタイプに基づいたメッセージ
        if (options?.fieldType) {
            const fieldType = options.fieldType;
            if (fieldType in this.defaultMessages) {
                return (this.defaultMessages as any)[fieldType];
            }
        }

        // data-validate属性から判定（互換性のため）
        if (options?.validationTypes) {
            const types = options.validationTypes as string[];
            
            if (types.includes('name')) return this.defaultMessages.name;
            if (types.includes('furigana')) {
                if (types.includes('hiragana')) return this.defaultMessages.furiganaHira;
                if (types.includes('katakana')) return this.defaultMessages.furiganaKana;
            }
            if (types.includes('postal-code')) return this.defaultMessages.postalCode;
            if (types.includes('postal')) return this.defaultMessages.postal;
            if (types.includes('tel')) return this.defaultMessages.tel;
            if (types.includes('email-conf')) return this.defaultMessages.emailConf;
            if (types.includes('email')) return this.defaultMessages.email;
            if (types.includes('password')) return this.defaultMessages.password;
            if (types.includes('text')) return this.defaultMessages.text;
            if (types.includes('agree')) return this.defaultMessages.agree;
        }

        // 要素タイプに基づいたメッセージ
        if (options?.elementType === 'checkbox') return this.defaultMessages.checkbox;
        if (options?.elementType === 'radio') return this.defaultMessages.radiobox;
        if (options?.elementType === 'select') return this.defaultMessages.select;

        return this.defaultMessages.default;
    }
}
