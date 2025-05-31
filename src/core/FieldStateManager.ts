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
    initializeField(fieldId: string, element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, initial?: Partial<FieldState>, isFieldInHiddenAreaCallback?: (element: HTMLElement) => boolean): void {
        // 除外エリア内のフィールドかチェック
        const isInHiddenArea = isFieldInHiddenAreaCallback ? 
                              isFieldInHiddenAreaCallback(element) :
                              this.checkFieldInHiddenArea(fieldId);
        
        // 必須判定（除外エリア内の場合はrequiredを無視）
        const isRequired = !isInHiddenArea && (
            element.hasAttribute('required') ||
            (element.dataset.validate && element.dataset.validate.split(',').map(v => v.trim()).includes('required'))
        );

        // 初期値が空なら isValid: false（ただし除外エリア内は常にtrue）
        const initialValue = element.value || '';
        const isValid = isInHiddenArea || !isRequired || !!initialValue.trim();

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
     * フォーム全体が有効かどうか（除外エリアのフィールドは除く）
     */
    get isValid(): boolean {
        for (const [fieldId, state] of this.fields) {
            // 除外エリア内のフィールドはスキップ
            if (this.checkFieldInHiddenArea(fieldId)) {
                continue;
            }
            
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

    /**
     * 除外エリア内のフィールドかどうかをチェック（公開API）
     */
    isFieldInHiddenArea(fieldId: string): boolean {
        return this.checkFieldInHiddenArea(fieldId);
    }

    /**
     * 除外エリア内のフィールドかどうかをチェック（内部メソッド）
     */
    private checkFieldInHiddenArea(fieldId: string): boolean {
        const element = document.querySelector(`[name='${fieldId}'], [id='${fieldId}']`);
        if (!element) return false;
        
        // 要素自身に data-validate-hidden があるかチェック
        if (element.hasAttribute('data-validate-hidden')) {
            return true;
        }
        
        // 親要素を逆方向に探索して data-validate-hidden を持つ要素を探す
        let parent = element.parentElement;
        while (parent) {
            if (parent.hasAttribute('data-validate-hidden')) {
                return true;
            }
            parent = parent.parentElement;
        }
        
        return false;
    }

    /**
     * 除外エリアの状態が変更された時にフィールドの必須状態を再評価
     */
    reevaluateFieldRequiredState(fieldId: string, isFieldInHiddenAreaCallback?: (fieldId: string) => boolean): void {
        const element = document.querySelector(`[name='${fieldId}'], [id='${fieldId}']`);
        if (!element || !(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) {
            return;
        }
        
        const currentState = this.fields.get(fieldId);
        if (!currentState) {
            return;
        }
        
        // 除外エリア内かチェック（コールバックがある場合はそれを使用）
        const isInHiddenArea = isFieldInHiddenAreaCallback ? 
                              isFieldInHiddenAreaCallback(fieldId) : 
                              this.checkFieldInHiddenArea(fieldId);
        
        // 必須判定（除外エリア内の場合はrequiredを無視）
        const isRequired = !isInHiddenArea && (
            element.hasAttribute('required') ||
            (element.dataset.validate && element.dataset.validate.split(',').map(v => v.trim()).includes('required'))
        );
        
        // 除外エリア内の場合は常に有効、そうでなければ値をチェック
        let isValid: boolean;
        if (isInHiddenArea) {
            isValid = true;
        } else if (!isRequired) {
            isValid = true;
        } else {
            // 必須フィールドの場合、値があるかチェック
            const value = element.value || '';
            isValid = !!value.trim();
        }
        
        // 状態を更新
        this.fields.set(fieldId, {
            ...currentState,
            isValid: isValid,
            errors: isValid ? [] : currentState.errors
        });
        
        if (typeof console !== 'undefined' && console.log) {
            console.log(`[FieldStateManager] Reevaluated field ${fieldId}: isInHiddenArea=${isInHiddenArea}, isRequired=${isRequired}, isValid=${isValid}`);
        }
    }

    /**
     * 全フィールドの必須状態を再評価
     */
    reevaluateAllFieldsRequiredState(isFieldInHiddenAreaCallback?: (fieldId: string) => boolean): void {
        for (const fieldId of this.fields.keys()) {
            this.reevaluateFieldRequiredState(fieldId, isFieldInHiddenAreaCallback);
        }
    }

    // 必須フィールドのIDリストを返す（グループバリデーションも含む、除外エリアは除く）
    getRequiredFieldIds(isFieldInHiddenAreaCallback?: (fieldId: string) => boolean): string[] {
        const required: string[] = [];
        const excluded: string[] = [];
        
        for (const [fieldId, state] of this.fields) {
            // 除外エリア内のフィールドかチェック
            const isInHiddenArea = isFieldInHiddenAreaCallback ? 
                                  isFieldInHiddenAreaCallback(fieldId) :
                                  this.checkFieldInHiddenArea(fieldId);
            
            if (isInHiddenArea) {
                excluded.push(fieldId);
                continue;
            }
            
            const el = document.querySelector(`[name='${fieldId}'], [id='${fieldId}']`);
            if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
                // 通常の必須判定
                if (
                    el.hasAttribute('required') ||
                    (el.dataset.validate && el.dataset.validate.split(',').map(v => v.trim()).includes('required'))
                ) {
                    required.push(fieldId);
                    continue;
                }
            }
            // グループバリデーション（チェックボックス・ラジオ・セレクト）
            if (el instanceof HTMLElement) {
                if (
                    el.hasAttribute('data-check_validate') ||
                    el.hasAttribute('data-radio_validate') ||
                    el.hasAttribute('data-select_validate')
                ) {
                    required.push(fieldId);
                    continue;
                }
            }
        }
        
        // デバッグログを追加
        if (typeof console !== 'undefined' && console.log) {
            console.log('[FieldStateManager] Required fields:', required);
            console.log('[FieldStateManager] Excluded fields:', excluded);
        }
        
        return required;
    }

    // 必須フィールドのうちバリデーションOKな数
    getValidRequiredFieldCount(isFieldInHiddenAreaCallback?: (fieldId: string) => boolean): number {
        let count = 0;
        for (const fieldId of this.getRequiredFieldIds(isFieldInHiddenAreaCallback)) {
            const state = this.fields.get(fieldId);
            if (state && state.isValid) {
                count++;
            }
        }
        return count;
    }

    // 必須フィールドの総数
    getTotalRequiredFieldCount(isFieldInHiddenAreaCallback?: (fieldId: string) => boolean): number {
        return this.getRequiredFieldIds(isFieldInHiddenAreaCallback).length;
    }
}
