import { ValidationResult, ValidationRule, ValidatorOptions } from '../types';
import { BaseValidator } from '../validators/BaseValidator';
import { RequiredValidator } from '../validators/RequiredValidator';
import { EmailValidator, EmailConfirmValidator } from '../validators/EmailValidator';
import { TelValidator } from '../validators/TelValidator';
import { PostalCodeValidator } from '../validators/PostalCodeValidator';
import { TextValidator } from '../validators/TextValidator';
import { CustomValidator } from '../validators/CustomValidator';

/**
 * バリデーションエンジン
 * バリデーターの登録と実行を管理
 */
export class Validator {
    private validators: Map<string, BaseValidator> = new Map();
    private validatorFactories: Map<string, () => BaseValidator> = new Map();
    
    constructor() {
        // 標準バリデーターを登録
        this.registerDefaultValidators();
    }

    /**
     * 標準バリデーターを登録
     */
    private registerDefaultValidators(): void {
        // 必須
        this.registerValidatorFactory('required', () => new RequiredValidator());
        
        // メール
        this.registerValidatorFactory('email', () => new EmailValidator());
        this.registerValidatorFactory('email-conf', () => new EmailConfirmValidator());
        
        // 電話番号
        this.registerValidatorFactory('tel', () => new TelValidator());
        
        // 郵便番号
        this.registerValidatorFactory('postal-code', () => new PostalCodeValidator());
        
        // テキスト形式
        this.registerValidatorFactory('number', () => {
            const validator = new TextValidator();
            return validator;
        });
        
        this.registerValidatorFactory('hiragana', () => {
            const validator = new TextValidator();
            return validator;
        });
        
        this.registerValidatorFactory('katakana', () => {
            const validator = new TextValidator();
            return validator;
        });
        
        this.registerValidatorFactory('password', () => {
            const validator = new TextValidator();
            return validator;
        });
    }

    /**
     * バリデーターファクトリーを登録
     */
    registerValidatorFactory(name: string, factory: () => BaseValidator): void {
        this.validatorFactories.set(name, factory);
    }

    /**
     * カスタムバリデーターを登録
     */
    registerCustomValidator(
        name: string, 
        validationFunction: (value: any, options?: ValidatorOptions) => boolean | Promise<boolean>,
        errorMessage?: string
    ): void {
        this.registerValidatorFactory(name, () => new CustomValidator(validationFunction, errorMessage));
    }

    /**
     * バリデーターチェーンを構築
     */
    private buildValidatorChain(rules: string[], options?: ValidatorOptions): BaseValidator | null {
        if (rules.length === 0) return null;

        const validators: BaseValidator[] = [];
        
        for (const rule of rules) {
            // カスタムエラーメッセージのチェック（emesse1, emesse2等）
            if (rule.startsWith('emesse')) {
                if (options) {
                    options.customMessageKey = rule;
                }
                continue;
            }

            // バリデーターを生成
            const factory = this.validatorFactories.get(rule);
            if (factory) {
                const validator = factory();
                
                // テキストバリデーターの場合は、タイプを設定
                if (validator instanceof TextValidator) {
                    // textTypeを設定
                    validators.push(validator);
                } else {
                    validators.push(validator);
                }
            }
        }

        if (validators.length === 0) return null;

        // チェーンを構築
        for (let i = 0; i < validators.length - 1; i++) {
            validators[i].setNext(validators[i + 1]);
        }

        return validators[0];
    }

    /**
     * バリデーションを実行
     */
    async validate(value: any, rules: string | string[], options?: ValidatorOptions): Promise<ValidationResult> {
        // ルールを配列に変換
        const ruleArray = typeof rules === 'string' ? rules.split(',').map(r => r.trim()) : rules;
        
        // オプションにバリデーションタイプを追加（互換性のため）
        const validationOptions = {
            ...options,
            validationTypes: ruleArray
        };
        
        // テキストバリデーター用のタイプを設定
        if (ruleArray.includes('number') || ruleArray.includes('hiragana') || 
            ruleArray.includes('katakana') || ruleArray.includes('password')) {
            const textType = ruleArray.find(r => ['number', 'hiragana', 'katakana', 'password'].includes(r));
            if (textType) {
                validationOptions.textType = textType;
            }
        }

        // バリデーターチェーンを構築
        const validatorChain = this.buildValidatorChain(ruleArray, validationOptions);
        
        if (!validatorChain) {
            // バリデーターがない場合は成功を返す
            return {
                isValid: true,
                errors: []
            };
        }

        // バリデーションを実行
        try {
            return await validatorChain.validate(value, validationOptions);
        } catch (error) {
            // エラーが発生した場合
            return {
                isValid: false,
                errors: [{
                    rule: 'validation-error',
                    message: `バリデーションエラー: ${error}`,
                    value
                }]
            };
        }
    }

    /**
     * HTML要素からバリデーションルールを取得
     */
    getRulesFromElement(element: HTMLElement): string[] {
        const rules: string[] = [];

        // data-validate属性から取得
        if (element.dataset.validate) {
            rules.push(...element.dataset.validate.split(',').map(r => r.trim()));
        }

        // 要素タイプに基づいた追加ルール
        if (element instanceof HTMLInputElement) {
            // type属性に基づいたルール
            if (element.type === 'email' && !rules.includes('email')) {
                rules.push('email');
            } else if (element.type === 'tel' && !rules.includes('tel')) {
                rules.push('tel');
            } else if (element.type === 'password' && !rules.includes('password')) {
                rules.push('password');
            }
            
            // required属性
            if (element.required && !rules.includes('required')) {
                rules.push('required');
            }
        }

        return rules;
    }

    /**
     * HTML要素の値を取得
     */
    getElementValue(element: HTMLElement): any {
        if (element instanceof HTMLInputElement) {
            if (element.type === 'checkbox') {
                return element.checked;
            } else if (element.type === 'radio') {
                return element.checked ? element.value : '';
            } else {
                return element.value;
            }
        } else if (element instanceof HTMLSelectElement) {
            return element.value;
        } else if (element instanceof HTMLTextAreaElement) {
            return element.value;
        }

        return '';
    }

    /**
     * HTML要素をバリデート
     */
    async validateElement(element: HTMLElement, options?: ValidatorOptions): Promise<ValidationResult> {
        const rules = this.getRulesFromElement(element);
        const value = this.getElementValue(element);
        
        // 要素タイプをオプションに追加
        const elementOptions = {
            ...options,
            elementType: element.tagName.toLowerCase()
        };
        
        if (element instanceof HTMLInputElement) {
            elementOptions.elementType = element.type;
        }

        return this.validate(value, rules, elementOptions);
    }
}
