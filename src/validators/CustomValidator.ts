import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidatorOptions } from '../types';

/**
 * カスタムバリデーター
 * ユーザー定義の検証ロジックを実行
 */
export class CustomValidator extends BaseValidator {
    private customValidationFunction: (value: any, options?: ValidatorOptions) => boolean | Promise<boolean>;
    private customErrorMessage: string;

    /**
     * コンストラクタ
     * @param validationFunction カスタム検証関数
     * @param errorMessage エラーメッセージ
     */
    constructor(
        validationFunction: (value: any, options?: ValidatorOptions) => boolean | Promise<boolean>,
        errorMessage: string = 'カスタムバリデーションエラー'
    ) {
        super();
        this.customValidationFunction = validationFunction;
        this.customErrorMessage = errorMessage;
    }

    /**
     * カスタムバリデーションを実行
     */
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        try {
            // カスタム検証関数を実行
            const isValid = await this.customValidationFunction(value, options);

            if (!isValid) {
                const message = this.createErrorMessage('custom', this.customErrorMessage, options);
                return this.createFailureResult([
                    this.createError('custom', message, value)
                ]);
            }

            // 検証成功、次のバリデーターへ
            return await this.handleNext(value, options);
        } catch (error) {
            // エラーが発生した場合
            const message = options?.message || `バリデーションエラー: ${error}`;
            return this.createFailureResult([
                this.createError('custom-error', message, value)
            ]);
        }
    }
}

/**
 * 複数のバリデーターを組み合わせるカスタムバリデーター
 */
export class CompositeValidator extends BaseValidator {
    private validators: BaseValidator[] = [];

    /**
     * バリデーターを追加
     */
    addValidator(validator: BaseValidator): this {
        this.validators.push(validator);
        return this;
    }

    /**
     * 全てのバリデーターを実行
     */
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        let combinedResult: ValidationResult = this.createSuccessResult();

        // 全てのバリデーターを実行
        for (const validator of this.validators) {
            const result = await validator.validate(value, options);
            
            // エラーがあれば結果を結合
            if (!result.isValid) {
                combinedResult = this.combineResults(combinedResult, result);
            }
        }

        // 全ての検証が成功した場合のみ、次のバリデーターへ
        if (combinedResult.isValid) {
            return await this.handleNext(value, options);
        }

        return combinedResult;
    }
}

/**
 * 条件付きバリデーター
 * 特定の条件下でのみバリデーションを実行
 */
export class ConditionalValidator extends BaseValidator {
    private condition: (value: any, options?: ValidatorOptions) => boolean | Promise<boolean>;
    private validator: BaseValidator;

    /**
     * コンストラクタ
     * @param condition 条件関数
     * @param validator 条件が真の場合に実行するバリデーター
     */
    constructor(
        condition: (value: any, options?: ValidatorOptions) => boolean | Promise<boolean>,
        validator: BaseValidator
    ) {
        super();
        this.condition = condition;
        this.validator = validator;
    }

    /**
     * 条件に基づいてバリデーションを実行
     */
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        try {
            // 条件をチェック
            const shouldValidate = await this.condition(value, options);

            if (shouldValidate) {
                // 条件が真の場合、バリデーターを実行
                const result = await this.validator.validate(value, options);
                
                // エラーがあれば返す
                if (!result.isValid) {
                    return result;
                }
            }

            // 条件が偽、またはバリデーション成功の場合、次のバリデーターへ
            return await this.handleNext(value, options);
        } catch (error) {
            // エラーが発生した場合
            const message = `条件チェックエラー: ${error}`;
            return this.createFailureResult([
                this.createError('conditional-error', message, value)
            ]);
        }
    }
}
