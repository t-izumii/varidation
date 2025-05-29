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
    initializeField(fieldId: string, element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): void {
        const initialState: FieldState = {
            value: element.value || '',
            isValid: true,
            errors: [],
            isDirty: false,
            isTouched: false
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
}
