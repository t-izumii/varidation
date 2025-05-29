/**
 * イベント管理クラス
 * Observer パターンを実装し、イベントの登録・発火・削除を管理
 */
export class EventManager {
    private events: Map<string, Set<Function>> = new Map();

    /**
     * イベントリスナーを登録
     * @param event イベント名
     * @param handler イベントハンドラー
     */
    on(event: string, handler: Function): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(handler);
    }

    /**
     * イベントリスナーを削除
     * @param event イベント名
     * @param handler イベントハンドラー
     */
    off(event: string, handler: Function): void {
        if (this.events.has(event)) {
            this.events.get(event)!.delete(handler);
            
            // ハンドラーがなくなったらイベント自体を削除
            if (this.events.get(event)!.size === 0) {
                this.events.delete(event);
            }
        }
    }

    /**
     * イベントを一度だけ実行するリスナーを登録
     * @param event イベント名
     * @param handler イベントハンドラー
     */
    once(event: string, handler: Function): void {
        const onceHandler = (data?: any) => {
            handler(data);
            this.off(event, onceHandler);
        };
        this.on(event, onceHandler);
    }

    /**
     * イベントを発火
     * @param event イベント名
     * @param data イベントデータ
     */
    emit(event: string, data?: any): void {
        if (this.events.has(event)) {
            const handlers = this.events.get(event)!;
            for (const handler of handlers) {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for "${event}":`, error);
                }
            }
        }
    }

    /**
     * 特定のイベントの全てのリスナーを削除
     * @param event イベント名
     */
    removeAllListeners(event?: string): void {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    /**
     * 登録されているリスナーの数を取得
     * @param event イベント名
     * @returns リスナーの数
     */
    listenerCount(event: string): number {
        return this.events.has(event) ? this.events.get(event)!.size : 0;
    }

    /**
     * イベントが登録されているかチェック
     * @param event イベント名
     * @returns 登録されている場合true
     */
    hasListeners(event: string): boolean {
        return this.events.has(event) && this.events.get(event)!.size > 0;
    }
}

/**
 * バリデーション関連のイベント定義
 */
export enum ValidationEvents {
    // フィールド関連イベント
    FIELD_VALIDATED = 'field:validated',
    FIELD_CHANGED = 'field:changed',
    FIELD_FOCUSED = 'field:focused',
    FIELD_BLURRED = 'field:blurred',
    FIELD_ERROR = 'field:error',
    FIELD_SUCCESS = 'field:success',
    
    // フォーム関連イベント
    FORM_VALIDATED = 'form:validated',
    FORM_SUBMITTED = 'form:submitted',
    FORM_RESET = 'form:reset',
    FORM_ERROR = 'form:error',
    FORM_SUCCESS = 'form:success',
    
    // バリデーション関連イベント
    VALIDATION_START = 'validation:start',
    VALIDATION_END = 'validation:end',
    VALIDATION_ERROR = 'validation:error',
    
    // その他のイベント
    COUNT_UPDATED = 'count:updated',
    SUBMIT_STATE_CHANGED = 'submit:stateChanged'
}

/**
 * イベントデータの型定義
 */
export interface FieldValidatedEvent {
    field: HTMLElement;
    fieldName: string;
    value: any;
    isValid: boolean;
    errors: Array<{ rule: string; message: string }>;
}

export interface FormValidatedEvent {
    form: HTMLFormElement;
    isValid: boolean;
    fields: Map<string, {
        isValid: boolean;
        errors: Array<{ rule: string; message: string }>;
    }>;
}

export interface CountUpdatedEvent {
    total: number;
    completed: number;
    remaining: number;
    details: {
        input: number;
        select: number;
        checkbox: number;
        radio: number;
    };
}

export interface SubmitStateChangedEvent {
    enabled: boolean;
    reason?: string;
}
