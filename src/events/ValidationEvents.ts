// ================================================================================================
// バリデーションイベント定数 - バリデーション処理で使用するイベント名を定義
// ================================================================================================

/**
 * バリデーション関連のイベント定数
 * 全てのバリデーションイベント名をここで一元管理
 */
export const ValidationEvents = {
    /** フィールドがバリデーションされた時に発火するイベント */
    FIELD_VALIDATED: 'field:validated',
    
    /** フォーム全体がバリデーションされた時に発火するイベント */
    FORM_VALIDATED: 'form:validated',
    
    /** バリデーション済みフィールド数が更新された時に発火するイベント */
    COUNT_UPDATED: 'count:updated',
    
    /** 送信ボタンの状態が変更された時に発火するイベント */
    SUBMIT_STATE_CHANGED: 'submit:state-changed',
    
    /** フォームがリセットされた時に発火するイベント */
    FORM_RESET: 'form:reset',
    
    /** フィールドがフォーカスされた時に発火するイベント */
    FIELD_FOCUSED: 'field:focused',
    
    /** フィールドからフォーカスが外れた時に発火するイベント */
    FIELD_BLURRED: 'field:blurred',
    
    /** エラーが表示された時に発火するイベント */
    ERROR_SHOWN: 'error:shown',
    
    /** エラーがクリアされた時に発火するイベント */
    ERROR_CLEARED: 'error:cleared',
    
    /** バリデーションが開始された時に発火するイベント */
    VALIDATION_STARTED: 'validation:started',
    
    /** バリデーションが完了した時に発火するイベント */
    VALIDATION_COMPLETED: 'validation:completed'
} as const;

/**
 * イベント名の型定義
 * ValidationEventsオブジェクトの値の型を抽出
 */
export type ValidationEventName = typeof ValidationEvents[keyof typeof ValidationEvents];

// ---- イベントデータの型定義 ----

/**
 * カスタムイベントデータの基底インターフェース
 * 全てのバリデーションイベントデータが継承する共通プロパティ
 */
export interface ValidationEventData {
    timestamp: number;      // イベント発生時刻（ミリ秒）
    source: 'FormManager';  // イベントの発生源
}

/**
 * フィールドバリデーションイベントのデータ
 * 個別フィールドのバリデーション結果を含む
 */
export interface FieldValidationEventData extends ValidationEventData {
    fieldId: string;        // バリデーション対象のフィールドID
    field: HTMLElement;     // バリデーション対象のHTML要素
    isValid: boolean;       // バリデーション結果（成功/失敗）
    errors: string[];       // エラーメッセージの配列
    value: string;          // バリデーション時の値
}

/**
 * フォームバリデーションイベントのデータ
 * フォーム全体のバリデーション結果を含む
 */
export interface FormValidationEventData extends ValidationEventData {
    form: HTMLFormElement;                      // バリデーション対象のフォーム要素
    isValid: boolean;                           // フォーム全体のバリデーション結果
    validFieldCount: number;                    // バリデーション成功フィールド数
    totalFieldCount: number;                    // 総フィールド数
    errors: Record<string, string[]>;           // フィールドIDをキーとするエラー辞書
}

/**
 * カウント更新イベントのデータ
 * 必須フィールドの完了状況を含む
 */
export interface CountUpdateEventData extends ValidationEventData {
    valid: number;          // バリデーション済み必須フィールド数
    total: number;          // 必須フィールド総数
    isComplete: boolean;    // 全ての必須フィールドが完了したかどうか
    percentage: number;     // 完了率（0-100の数値）
}

/**
 * 送信状態変更イベントのデータ
 * 送信ボタンの有効/無効状態を含む
 */
export interface SubmitStateEventData extends ValidationEventData {
    canSubmit: boolean;     // 送信可能かどうか
    form: HTMLFormElement;  // 対象のフォーム要素
    reason?: string;        // 送信不可の理由（送信不可の場合）
}

/**
 * エラー関連イベントのデータ
 * エラーの表示/非表示時の情報を含む
 */
export interface ErrorEventData extends ValidationEventData {
    fieldId: string;        // エラーが発生したフィールドID
    field: HTMLElement;     // エラーが発生したHTML要素
    message: string;        // エラーメッセージ
    rule: string;           // エラーの原因となったバリデーションルール
}
