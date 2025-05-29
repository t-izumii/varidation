// 必要なインポート
import { ValidationResult, ValidationError, ValidatorOptions } from '../types';

/**
 * 全てのバリデーターの基底クラス
 * Chain of Responsibilityパターンを実装
 */
export abstract class BaseValidator {
    // 次のバリデーターへの参照
    protected next: BaseValidator | null = null;
    
    /**
     * バリデーションを実行する抽象メソッド
     * 各バリデーターで実装必須
     */
    abstract validate(value: any, options?: ValidatorOptions): ValidationResult | Promise<ValidationResult>;
    
    /**
     * 次のバリデーターを設定
     * @param validator 次のバリデーター
     * @returns 次のバリデーター（メソッドチェーン用）
     */
    setNext(validator: BaseValidator): BaseValidator {
        this.next = validator;
        return validator;
    }
    
    /**
     * 次のバリデーターを実行
     * @param value 検証する値
     * @param options オプション
     * @returns バリデーション結果
     */
    protected async handleNext(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        if (this.next) {
            const result = await this.next.validate(value, options);
            return result;
        }
        
        // 次のバリデーターがない場合は成功を返す
        return {
            isValid: true,
            errors: []
        };
    }
    
    /**
     * 複数のバリデーション結果を結合
     * @param currentResult 現在のバリデーション結果
     * @param nextResult 次のバリデーション結果
     * @returns 結合されたバリデーション結果
     */
    protected combineResults(currentResult: ValidationResult, nextResult: ValidationResult): ValidationResult {
        return {
            isValid: currentResult.isValid && nextResult.isValid,
            errors: [...currentResult.errors, ...nextResult.errors]
        };
    }
    
    /**
     * 値が空かどうかをチェック
     * @param value チェックする値
     * @returns 空の場合true
     */
    protected isEmpty(value: any): boolean {
        // nullの場合
        if (value === null) return true;
        
        // undefinedの場合
        if (value === undefined) return true;
        
        // 文字列の場合、空文字列かスペースのみかチェック
        if (typeof value === 'string') {
            return value.trim() === '';
        }
        
        // 配列の場合、要素が0個かチェック
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        
        // オブジェクトの場合、プロパティがないかチェック
        if (typeof value === 'object') {
            return Object.keys(value).length === 0;
        }
        
        // それ以外は空ではないとする
        return false;
    }
    
    /**
     * 値を文字列に安全に変換する（型安全性を向上）
     * @param value 変換する値
     * @param ruleName ルール名（エラーメッセージ用）
     * @param defaultMessage デフォルトエラーメッセージ
     * @param options オプション
     * @returns 文字列変換結果または ValidationResult エラー
     */
    protected convertToString(
        value: any, 
        ruleName: string, 
        defaultMessage: string, 
        options?: ValidatorOptions
    ): { success: true; value: string } | { success: false; result: ValidationResult } {
        if (typeof value === 'string') {
            return { success: true, value };
        } else if (typeof value === 'number') {
            return { success: true, value: String(value) };
        } else {
            // 文字列でも数値でもない場合はエラー
            const message = this.createErrorMessage(ruleName, defaultMessage, options);
            return { 
                success: false, 
                result: this.createFailureResult([
                    this.createError(ruleName, message, value)
                ])
            };
        }
    }
    
    /**
     * エラーメッセージを作成
     * @param rule ルール名
     * @param defaultMessage デフォルトメッセージ
     * @param options オプション
     * @returns エラーメッセージ
     */
    protected createErrorMessage(rule: string, defaultMessage: string, options?: ValidatorOptions): string {
        // オプションでカスタムメッセージが指定されていればそれを使う
        if (options?.message) {
            return options.message;
        }
        
        return defaultMessage;
    }
    
    /**
     * ValidationErrorオブジェクトを作成
     * @param rule ルール名
     * @param message エラーメッセージ
     * @param value 検証した値
     * @returns ValidationError
     */
    protected createError(rule: string, message: string, value?: any): ValidationError {
        return {
            rule,
            message,
            value
        };
    }
    
    /**
     * 成功の結果を返す
     * @returns 成功のValidationResult
     */
    protected createSuccessResult(): ValidationResult {
        return {
            isValid: true,
            errors: []
        };
    }
    
    /**
     * 失敗の結果を返す
     * @param errors エラーの配列
     * @returns 失敗のValidationResult
     */
    protected createFailureResult(errors: ValidationError[]): ValidationResult {
        return {
            isValid: false,
            errors
        };
    }
}
