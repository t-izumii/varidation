import { ValidationResult, ValidationError } from '../types';

/**
 * フィールドの状態を管理するクラス
 */
export class FieldState {
    private _value: any;
    private _initialValue: any;
    private _isValid: boolean = true;
    private _isDirty: boolean = false;
    private _isTouched: boolean = false;
    private _isPristine: boolean = true;
    private _errors: ValidationError[] = [];
    private _isValidating: boolean = false;
    private _element: HTMLElement | null = null;

    /**
     * コンストラクタ
     * @param element 対象のHTML要素
     * @param initialValue 初期値
     */
    constructor(element?: HTMLElement, initialValue?: any) {
        this._element = element || null;
        this._initialValue = initialValue !== undefined ? initialValue : this.getElementValue();
        this._value = this._initialValue;
    }

    /**
     * 要素から値を取得
     */
    private getElementValue(): any {
        if (!this._element) return '';

        if (this._element instanceof HTMLInputElement) {
            if (this._element.type === 'checkbox') {
                return this._element.checked;
            } else if (this._element.type === 'radio') {
                return this._element.checked ? this._element.value : '';
            } else {
                return this._element.value;
            }
        } else if (this._element instanceof HTMLSelectElement) {
            return this._element.value;
        } else if (this._element instanceof HTMLTextAreaElement) {
            return this._element.value;
        }

        return '';
    }

    /**
     * 現在の値を取得
     */
    get value(): any {
        return this._value;
    }

    /**
     * 値を設定
     */
    set value(newValue: any) {
        const oldValue = this._value;
        this._value = newValue;
        
        // 初期値と異なる場合はdirtyフラグを立てる
        this._isDirty = newValue !== this._initialValue;
        this._isPristine = false;
    }

    /**
     * 初期値を取得
     */
    get initialValue(): any {
        return this._initialValue;
    }

    /**
     * バリデーション結果を更新
     */
    updateValidation(result: ValidationResult): void {
        this._isValid = result.isValid;
        this._errors = result.errors;
        this._isValidating = false;
    }

    /**
     * バリデーション中かどうか
     */
    get isValidating(): boolean {
        return this._isValidating;
    }

    /**
     * バリデーション開始
     */
    startValidation(): void {
        this._isValidating = true;
    }

    /**
     * 有効かどうか
     */
    get isValid(): boolean {
        return this._isValid;
    }

    /**
     * 変更されたかどうか
     */
    get isDirty(): boolean {
        return this._isDirty;
    }

    /**
     * タッチされたかどうか
     */
    get isTouched(): boolean {
        return this._isTouched;
    }

    /**
     * タッチ状態を設定
     */
    touch(): void {
        this._isTouched = true;
    }

    /**
     * 一度も変更されていないかどうか
     */
    get isPristine(): boolean {
        return this._isPristine;
    }

    /**
     * エラーを取得
     */
    get errors(): ValidationError[] {
        return [...this._errors];
    }

    /**
     * 特定のルールのエラーを取得
     */
    getError(rule: string): ValidationError | undefined {
        return this._errors.find(error => error.rule === rule);
    }

    /**
     * エラーがあるかどうか
     */
    hasError(): boolean {
        return this._errors.length > 0;
    }

    /**
     * 状態をリセット
     */
    reset(): void {
        this._value = this._initialValue;
        this._isValid = true;
        this._isDirty = false;
        this._isTouched = false;
        this._isPristine = true;
        this._errors = [];
        this._isValidating = false;
    }

    /**
     * 初期値を更新してリセット
     */
    resetWithValue(newInitialValue: any): void {
        this._initialValue = newInitialValue;
        this.reset();
    }

    /**
     * 状態をJSON形式で取得
     */
    toJSON(): object {
        return {
            value: this._value,
            initialValue: this._initialValue,
            isValid: this._isValid,
            isDirty: this._isDirty,
            isTouched: this._isTouched,
            isPristine: this._isPristine,
            errors: this._errors,
            isValidating: this._isValidating
        };
    }

    /**
     * 関連するHTML要素を取得
     */
    get element(): HTMLElement | null {
        return this._element;
    }

    /**
     * 関連するHTML要素を設定
     */
    set element(element: HTMLElement | null) {
        this._element = element;
    }
}

/**
 * フィールドのグループ状態を管理
 */
export class FieldGroupState {
    private fields: Map<string, FieldState> = new Map();

    /**
     * フィールドを追加
     */
    addField(name: string, state: FieldState): void {
        this.fields.set(name, state);
    }

    /**
     * フィールドを削除
     */
    removeField(name: string): void {
        this.fields.delete(name);
    }

    /**
     * フィールドを取得
     */
    getField(name: string): FieldState | undefined {
        return this.fields.get(name);
    }

    /**
     * 全てのフィールドが有効かどうか
     */
    get isValid(): boolean {
        for (const field of this.fields.values()) {
            if (!field.isValid) return false;
        }
        return true;
    }

    /**
     * いずれかのフィールドが変更されたかどうか
     */
    get isDirty(): boolean {
        for (const field of this.fields.values()) {
            if (field.isDirty) return true;
        }
        return false;
    }

    /**
     * 全てのフィールドをリセット
     */
    reset(): void {
        for (const field of this.fields.values()) {
            field.reset();
        }
    }

    /**
     * エラーがあるフィールドの数を取得
     */
    get errorCount(): number {
        let count = 0;
        for (const field of this.fields.values()) {
            if (field.hasError()) count++;
        }
        return count;
    }

    /**
     * 全てのエラーを取得
     */
    getAllErrors(): Map<string, ValidationError[]> {
        const errors = new Map<string, ValidationError[]>();
        for (const [name, field] of this.fields) {
            if (field.hasError()) {
                errors.set(name, field.errors);
            }
        }
        return errors;
    }
}
