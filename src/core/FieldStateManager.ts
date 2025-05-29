import { EventManager } from '../utils/EventManager';
import type { FieldState } from '../types';

/**
 * フィールドの状態を管理するクラス
 */
export class FieldStateManager {
    private fields: Map<string, FieldState> = new Map();
    private eventManager: EventManager;

    constructor(eventManager: EventManager) {
        this.eventManager = eventManager;
    }

    /**
     * フィールドを初期化
     */
    initializeField(fieldId: string, element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, initial?: Partial<FieldState>): void {
        // 必須判定
        const isRequired =
            element.hasAttribute('required') ||
            (element.dataset.validate && element.dataset.validate.split(',').map(v => v.trim()).includes('required'));

        // 初期値が空なら isValid: false
        const initialValue = element.value || '';
        const isValid = isRequired ? !!initialValue.trim() : true;

        const initialState: FieldState = {
            value: initialValue,
            isValid: isValid,
            errors: [],
            isDirty: false,
            isTouched: false,
            ...initial
        };
        this.fields.set(fieldId, initialState);
    }

    /**
     * フィールドの状態を更新
     */
    updateField(fieldId: string, updates: Partial<FieldState>): void {
        const currentState = this.fields.get(fieldId);
        if (currentState) {
            const newState = { ...currentState, ...updates };
            this.fields.set(fieldId, newState);
        }
    }

    /**
     * フィールドの状態を取得
     */
    getField(fieldId: string): FieldState | undefined {
        return this.fields.get(fieldId);
    }

    /**
     * 全フィールドの状態を取得
     */
    getAllStates(): Record<string, FieldState> {
        const states: Record<string, FieldState> = {};
        for (const [fieldId, state] of this.fields) {
            states[fieldId] = { ...state };
        }
        return states;
    }

    /**
     * 有効なフィールドの数を取得
     */
    getValidFieldCount(): number {
        let count = 0;
        for (const state of this.fields.values()) {
            if (state.isValid) {
                count++;
            }
        }
        return count;
    }

    /**
     * 総フィールド数を取得
     */
    getTotalFieldCount(): number {
        return this.fields.size;
    }

    /**
     * フォーム全体が有効かどうか
     */
    get isValid(): boolean {
        for (const state of this.fields.values()) {
            if (!state.isValid) {
                return false;
            }
        }
        return true;
    }

    /**
     * フォームが変更されたかどうか
     */
    get isDirty(): boolean {
        for (const state of this.fields.values()) {
            if (state.isDirty) {
                return true;
            }
        }
        return false;
    }

    /**
     * 全フィールドをリセット
     */
    reset(): void {
        for (const [fieldId, state] of this.fields) {
            this.fields.set(fieldId, {
                ...state,
                value: '',
                isValid: true,
                errors: [],
                isDirty: false,
                isTouched: false
            });
        }
    }

    /**
     * フィールドを削除
     */
    removeField(fieldId: string): void {
        this.fields.delete(fieldId);
    }

    /**
     * 全フィールドをクリア
     */
    clear(): void {
        this.fields.clear();
    }

    // 必須フィールドのIDリストを返す
    getRequiredFieldIds(): string[] {
        const required: string[] = [];
        for (const [fieldId, state] of this.fields) {
            const el = document.querySelector(`[name='${fieldId}'], [id='${fieldId}']`);
            if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
                if (
                    el.hasAttribute('required') ||
                    (el.dataset.validate && el.dataset.validate.split(',').map(v => v.trim()).includes('required'))
                ) {
                    required.push(fieldId);
                }
            }
        }
        return required;
    }

    // 必須フィールドのうちバリデーションOKな数
    getValidRequiredFieldCount(): number {
        let count = 0;
        for (const fieldId of this.getRequiredFieldIds()) {
            const state = this.fields.get(fieldId);
            if (state && state.isValid) {
                count++;
            }
        }
        return count;
    }

    // 必須フィールドの総数
    getTotalRequiredFieldCount(): number {
        return this.getRequiredFieldIds().length;
    }
}
