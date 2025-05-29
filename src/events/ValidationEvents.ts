/**
 * バリデーション関連のイベント定数
 */
export const ValidationEvents = {
    /** フィールドがバリデーションされた時 */
    FIELD_VALIDATED: 'field:validated',
    
    /** フォーム全体がバリデーションされた時 */
    FORM_VALIDATED: 'form:validated',
    
    /** バリデーション済みフィールド数が更新された時 */
    COUNT_UPDATED: 'count:updated',
    
    /** 送信ボタンの状態が変更された時 */
    SUBMIT_STATE_CHANGED: 'submit:state-changed',
    
    /** フォームがリセットされた時 */
    FORM_RESET: 'form:reset',
    
    /** フィールドがフォーカスされた時 */
    FIELD_FOCUSED: 'field:focused',
    
    /** フィールドからフォーカスが外れた時 */
    FIELD_BLURRED: 'field:blurred',
    
    /** エラーが表示された時 */
    ERROR_SHOWN: 'error:shown',
    
    /** エラーがクリアされた時 */
    ERROR_CLEARED: 'error:cleared',
    
    /** バリデーションが開始された時 */
    VALIDATION_STARTED: 'validation:started',
    
    /** バリデーションが完了した時 */
    VALIDATION_COMPLETED: 'validation:completed'
} as const;

/**
 * イベント名の型定義
 */
export type ValidationEventName = typeof ValidationEvents[keyof typeof ValidationEvents];

/**
 * カスタムイベントデータの基底インターフェース
 */
export interface ValidationEventData {
    timestamp: number;
    source: 'FormManager';
}

/**
 * フィールドバリデーションイベントのデータ
 */
export interface FieldValidationEventData extends ValidationEventData {
    fieldId: string;
    field: HTMLElement;
    isValid: boolean;
    errors: string[];
    value: string;
}

/**
 * フォームバリデーションイベントのデータ
 */
export interface FormValidationEventData extends ValidationEventData {
    form: HTMLFormElement;
    isValid: boolean;
    validFieldCount: number;
    totalFieldCount: number;
    errors: Record<string, string[]>;
}

/**
 * カウント更新イベントのデータ
 */
export interface CountUpdateEventData extends ValidationEventData {
    valid: number;
    total: number;
    isComplete: boolean;
    percentage: number;
}

/**
 * 送信状態変更イベントのデータ
 */
export interface SubmitStateEventData extends ValidationEventData {
    canSubmit: boolean;
    form: HTMLFormElement;
    reason?: string;
}

/**
 * エラー関連イベントのデータ
 */
export interface ErrorEventData extends ValidationEventData {
    fieldId: string;
    field: HTMLElement;
    message: string;
    rule: string;
}
