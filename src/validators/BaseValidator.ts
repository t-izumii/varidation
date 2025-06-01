// ================================================================================================
// BaseValidator - 全てのバリデーターの基底クラス
// Chain of Responsibilityパターンを実装し、バリデーターチェーンを構築
// ================================================================================================

// 必要な型定義をインポート
import { ValidationResult, ValidationError, ValidatorOptions } from '../types';

/**
 * 全てのバリデーターの基底クラス
 * Chain of Responsibilityパターンを実装してバリデーターチェーンを構築
 * 各バリデーターはこのクラスを継承して独自の検証ロジックを実装する
 */
export abstract class BaseValidator {
    // ---- プライベートプロパティ ----
    // 次のバリデーターへの参照（チェーンパターン）
    protected next: BaseValidator | null = null;
    
    /**
     * バリデーションを実行する抽象メソッド
     * 各バリデーターで実装必須
     * @param value 検証する値
     * @param options バリデーターオプション
     * @returns バリデーション結果（同期または非同期）
     */
    abstract validate(value: any, options?: ValidatorOptions): ValidationResult | Promise<ValidationResult>;
    
    /**
     * 次のバリデーターを設定（チェーンパターンの実装）
     * @param validator 次のバリデーター
     * @returns 次のバリデーター（メソッドチェーン用）
     */
    setNext(validator: BaseValidator): BaseValidator {
        // 次のバリデーターを設定
        this.next = validator;
        // メソッドチェーンが可能なように次のバリデーターを返す
        return validator;
    }
    
    /**
     * 次のバリデーターを実行（チェーンの継続）
     * @param value 検証する値
     * @param options オプション
     * @returns バリデーション結果
     */
    protected async handleNext(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        if (this.next) {
            // 次のバリデーターが存在する場合は実行
            const result = await this.next.validate(value, options);
            return result;
        }
        
        // 次のバリデーターがない場合は成功を返す（チェーンの終端）
        return {
            isValid: true,
            errors: []
        };
    }
    
    /**
     * 複数のバリデーション結果を結合
     * 現在のバリデーション結果と次のバリデーション結果をマージ
     * @param currentResult 現在のバリデーション結果
     * @param nextResult 次のバリデーション結果
     * @returns 結合されたバリデーション結果
     */
    protected combineResults(currentResult: ValidationResult, nextResult: ValidationResult): ValidationResult {
        return {
            // 両方のバリデーションが成功した場合のみ全体が成功
            isValid: currentResult.isValid && nextResult.isValid,
            // エラー配列を結合（両方のエラーを保持）
            errors: [...currentResult.errors, ...nextResult.errors]
        };
    }
    
    // ================================================================================================
    // ヘルパーメソッド群 - 各バリデーターで共通して使用されるユーティリティ
    // ================================================================================================
    
    /**
     * 値が空かどうかをチェック
     * 様々な型の空判定を統一的に行う
     * @param value チェックする値
     * @returns 空の場合true
     */
    protected isEmpty(value: any): boolean {
        // null値の場合
        if (value === null) return true;
        
        // undefined値の場合
        if (value === undefined) return true;
        
        // 文字列の場合、空文字列またはスペースのみかチェック
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
     * バリデーション処理で統一的に文字列変換を行う
     * @param value 変換する値
     * @param ruleName ルール名（エラーメッセージ用）
     * @param defaultMessage デフォルトエラーメッセージ
     * @param options オプション
     * @returns 文字列変換結果またはValidationResultエラー
     */
    protected convertToString(
        value: any, 
        ruleName: string, 
        defaultMessage: string, 
        options?: ValidatorOptions
    ): { success: true; value: string } | { success: false; result: ValidationResult } {
        if (typeof value === 'string') {
            // 既に文字列の場合はそのまま返す
            return { success: true, value };
        } else if (typeof value === 'number') {
            // 数値の場合は文字列に変換
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
     * カスタムメッセージの優先順位を考慮してメッセージを決定
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
        
        // デフォルトメッセージを返す
        return defaultMessage;
    }
    
    /**
     * ValidationErrorオブジェクトを作成
     * エラー情報を統一的な形式で生成
     * @param rule ルール名
     * @param message エラーメッセージ
     * @param value 検証した値
     * @returns ValidationError
     */
    protected createError(rule: string, message: string, value?: any): ValidationError {
        return {
            rule,       // バリデーションルール名
            message,    // ユーザー向けエラーメッセージ
            value       // 検証対象の値（デバッグ用）
        };
    }
    
    /**
     * 成功の結果を返す
     * バリデーション成功時の標準的な戻り値
     * @returns 成功のValidationResult
     */
    protected createSuccessResult(): ValidationResult {
        return {
            isValid: true,   // バリデーション成功
            errors: []       // エラーなし
        };
    }
    
    /**
     * 失敗の結果を返す
     * バリデーション失敗時の標準的な戻り値
     * @param errors エラーの配列
     * @returns 失敗のValidationResult
     */
    protected createFailureResult(errors: ValidationError[]): ValidationResult {
        return {
            isValid: false,  // バリデーション失敗
            errors           // エラー配列
        };
    }
}
