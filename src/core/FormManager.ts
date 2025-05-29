import { ValidationEvents } from '../events/ValidationEvents';
import { FieldStateManager } from './FieldStateManager';
import { ErrorDisplayManager } from './ErrorDisplayManager';
import { ValidationEngine } from './ValidationEngine';
import { AccessibilityManager } from './AccessibilityManager';
import { DOMHelper } from '../utils/DOMHelper';
import { Debouncer } from '../utils/Debounce';
import { EventManager } from '../utils/EventManager';
import type { FormManagerOptions, FieldState } from '../types';

/**
 * フォーム管理のメインクラス
 * バリデーション、エラー表示、イベント管理を統合的に行う
 */
export class FormManager {
    private form: HTMLFormElement;
    private options: FormManagerOptions;
    private fieldStates: FieldStateManager;
    private errorDisplay: ErrorDisplayManager;
    private validationEngine: ValidationEngine;
    private accessibility: AccessibilityManager;
    private eventManager: EventManager;
    private debouncer: Debouncer;
    private submitButton?: HTMLButtonElement;
    private fieldCleanups: Map<string, () => void> = new Map();
    private elementToIdMap: WeakMap<HTMLElement, string> = new WeakMap();
    private isInitialized: boolean = false;
    private debug: boolean = false;

    constructor(form: HTMLFormElement, options: Partial<FormManagerOptions> = {}) {
        this.form = form;
        this.options = this.mergeOptions(options);
        this.debug = !!(options as any).debug;
        
        // 依存関係を初期化
        this.eventManager = new EventManager();
        this.fieldStates = new FieldStateManager(this.eventManager);
        this.errorDisplay = new ErrorDisplayManager(this.options.errorDisplay);
        this.validationEngine = new ValidationEngine(this.options.validation);
        this.accessibility = new AccessibilityManager();
        this.debouncer = new Debouncer();
        
        this.log('FormManager constructor called');
        this.initialize();
    }

    private log(message: string, ...args: any[]): void {
        if (this.debug) {
            console.log(`[FormManager] ${message}`, ...args);
        }
    }

    /**
     * オプションをマージ
     */
    private mergeOptions(options: Partial<FormManagerOptions>): FormManagerOptions {
        const merged = {
            validation: {
                validateOnInput: true,
                validateOnBlur: true,
                debounceDelay: 300,
                ...options.validation
            },
            errorDisplay: {
                showOnValidation: true,
                clearOnFocus: true,
                animationDuration: 200,
                ...options.errorDisplay
            },
            customMessages: options.customMessages || {},
            onFieldValidated: options.onFieldValidated,
            onFormValidated: options.onFormValidated,
            onCountUpdated: options.onCountUpdated,
            onSubmitStateChanged: options.onSubmitStateChanged
        };
        
        this.log('Options merged:', merged);
        return merged;
    }

    /**
     * 初期化処理
     */
    private initialize(): void {
        if (this.isInitialized) {
            this.log('Already initialized, skipping');
            return;
        }

        this.log('Starting initialization');

        // 送信ボタンを取得
        this.submitButton = this.form.querySelector('button[type=\"submit\"]') || undefined;
        this.log('Submit button found:', !!this.submitButton);

        // フォームフィールドを設定
        this.setupFormFields();
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // カスタムバリデーターを登録
        this.registerCustomValidators();
        
        // コールバックを設定
        this.setupCallbacks();
        
        // アクセシビリティを初期化
        this.accessibility.initialize(this.form);
        
        this.isInitialized = true;
        this.log('Initialization completed');
    }

    /**
     * フォームフィールドを設定
     */
    private setupFormFields(): void {
        const fields = this.form.querySelectorAll('input, select, textarea');
        this.log(`Found ${fields.length} form fields`);
        
        fields.forEach((field: Element, index) => {
            if (field instanceof HTMLInputElement || 
                field instanceof HTMLSelectElement || 
                field instanceof HTMLTextAreaElement) {
                
                const fieldId = field.name || field.id;
                if (!fieldId) {
                    this.log(`Field ${index} has no name or id, skipping`, field);
                    return;
                }
                
                this.log(`Setting up field: ${fieldId}`, field);
                
                // 要素とIDのマッピングを保存
                this.elementToIdMap.set(field, fieldId);
                
                // フィールド状態を初期化
                this.fieldStates.initializeField(fieldId, field);
                
                // バリデーションイベントを設定
                this.setupFieldValidation(field, fieldId);
            }
        });
    }

    /**
     * フィールドバリデーションを設定
     */
    private setupFieldValidation(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, fieldId: string): void {
        const cleanups: (() => void)[] = [];
        
        this.log(`Setting up validation for field: ${fieldId}`);

        if (this.options.validation.validateOnInput) {
            this.log(`Adding input listener for field: ${fieldId}`);
            const inputCleanup = DOMHelper.addEventListener(field, 'input', (event) => {
                this.log(`Input event triggered for field: ${fieldId}`, event);
                this.debouncer.debounce(`validate-${fieldId}`, () => {
                    this.log(`Debounced validation triggered for field: ${fieldId}`);
                    this.validateField(field, fieldId);
                }, this.options.validation.debounceDelay);
            });
            cleanups.push(inputCleanup);
        }

        if (this.options.validation.validateOnBlur) {
            this.log(`Adding blur listener for field: ${fieldId}`);
            const blurCleanup = DOMHelper.addEventListener(field, 'blur', (event) => {
                this.log(`Blur event triggered for field: ${fieldId}`, event);
                this.validateField(field, fieldId);
            });
            cleanups.push(blurCleanup);
        }

        if (this.options.errorDisplay.clearOnFocus) {
            this.log(`Adding focus listener for field: ${fieldId}`);
            const focusCleanup = DOMHelper.addEventListener(field, 'focus', (event) => {
                this.log(`Focus event triggered for field: ${fieldId}`, event);
                this.errorDisplay.clearField(fieldId);
            });
            cleanups.push(focusCleanup);
        }

        // クリーンアップ関数を保存
        this.fieldCleanups.set(fieldId, () => {
            cleanups.forEach(cleanup => cleanup());
        });
        
        this.log(`Validation setup completed for field: ${fieldId}`);
    }

    /**
     * フィールドを検証
     */
    private async validateField(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, fieldId: string): Promise<void> {
        const value = field.value;
        this.log(`Validating field: ${fieldId} with value:`, value);
        
        try {
            const result = await this.validationEngine.validateField(field, value, this.options.customMessages);
            this.log(`Validation result for ${fieldId}:`, result);
            
            // フィールド状態を更新
            this.fieldStates.updateField(fieldId, {
                value,
                isValid: result.isValid,
                errors: result.errors,
                isDirty: true
            });

            // エラー表示を更新
            if (this.options.errorDisplay.showOnValidation) {
                if (result.isValid) {
                    this.log(`Clearing error for field: ${fieldId}`);
                    this.errorDisplay.clearField(fieldId);
                } else {
                    this.log(`Showing error for field: ${fieldId}`, result.errors[0].message);
                    this.errorDisplay.showFieldError(fieldId, result.errors[0].message, field);
                }
            }

            // イベントを発火
            this.eventManager.emit(ValidationEvents.FIELD_VALIDATED, {
                fieldId,
                field,
                isValid: result.isValid,
                errors: result.errors.map(e => e.message)
            });

            // カウントを更新
            this.updateCount();
        } catch (error) {
            this.log(`Error during validation for field ${fieldId}:`, error);
        }
    }

    /**
     * カウントを更新
     */
    private updateCount(): void {
        const validCount = this.fieldStates.getValidFieldCount();
        const totalCount = this.fieldStates.getTotalFieldCount();
        
        this.log(`Count updated - valid: ${validCount}, total: ${totalCount}`);
        
        this.eventManager.emit(ValidationEvents.COUNT_UPDATED, {
            valid: validCount,
            total: totalCount,
            isComplete: validCount === totalCount
        });
    }

    /**
     * イベントリスナーを設定
     */
    private setupEventListeners(): void {
        this.log('Setting up form event listeners');
        
        // フォーム送信
        DOMHelper.addEventListener(this.form, 'submit', (event) => {
            this.log('Form submit event triggered, isValid:', this.isValid);
            if (!this.isValid) {
                event.preventDefault();
                this.log('Form submission prevented, validating all fields');
                this.validateAllFields();
            }
        });

        // フォームリセット
        DOMHelper.addEventListener(this.form, 'reset', () => {
            this.log('Form reset event triggered');
            this.reset();
        });
    }

    /**
     * 全フィールドを検証
     */
    private async validateAllFields(): Promise<void> {
        this.log('Validating all fields');
        const fields = this.form.querySelectorAll('input, select, textarea');
        const promises: Promise<void>[] = [];

        fields.forEach((field: Element) => {
            if (field instanceof HTMLInputElement || 
                field instanceof HTMLSelectElement || 
                field instanceof HTMLTextAreaElement) {
                
                const fieldId = this.elementToIdMap.get(field);
                if (fieldId) {
                    promises.push(this.validateField(field, fieldId));
                }
            }
        });

        await Promise.all(promises);

        // フォーム全体のバリデーション結果を発火
        this.eventManager.emit(ValidationEvents.FORM_VALIDATED, {
            form: this.form,
            isValid: this.isValid,
            fieldStates: this.fieldStates.getAllStates()
        });
        
        this.log('All fields validation completed, isValid:', this.isValid);
    }

    /**
     * カスタムバリデーターを登録
     */
    private registerCustomValidators(): void {
        this.log('Registering custom validators');
        // カスタムメッセージ用のバリデーターを登録
        Object.entries(this.options.customMessages).forEach(([key, message]) => {
            if (key.startsWith('emesse')) {
                // emesse用のカスタムバリデーターは登録不要（メッセージのみ使用）
            }
        });
    }

    /**
     * コールバックを設定
     */
    private setupCallbacks(): void {
        this.log('Setting up callbacks');
        if (this.options.onFieldValidated) {
            this.eventManager.on(ValidationEvents.FIELD_VALIDATED, this.options.onFieldValidated);
        }
        
        if (this.options.onFormValidated) {
            this.eventManager.on(ValidationEvents.FORM_VALIDATED, this.options.onFormValidated);
        }
        
        if (this.options.onCountUpdated) {
            this.eventManager.on(ValidationEvents.COUNT_UPDATED, this.options.onCountUpdated);
        }
        
        if (this.options.onSubmitStateChanged) {
            this.eventManager.on(ValidationEvents.SUBMIT_STATE_CHANGED, this.options.onSubmitStateChanged);
        }
    }

    /**
     * フォームをリセット
     */
    reset(): void {
        this.log('Resetting form');
        // フィールド状態をリセット
        this.fieldStates.reset();
        
        // エラー表示をクリア
        this.errorDisplay.clearAll();
        
        // カウントを更新
        this.updateCount();
        
        // 送信ボタンを有効化
        if (this.submitButton) {
            this.submitButton.disabled = false;
        }
        
        // イベントを発火
        this.eventManager.emit(ValidationEvents.FORM_RESET, { form: this.form });
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.log('Destroying FormManager');
        // イベントリスナーを削除
        this.fieldCleanups.forEach(cleanup => cleanup());
        this.fieldCleanups.clear();
        
        // デバウンサーをクリア
        this.debouncer.cancelAll();
        
        // イベントマネージャーをクリア
        this.eventManager.removeAllListeners();
        
        // アクセシビリティをクリーンアップ
        this.accessibility.cleanup();
        
        // マップをクリア
        this.elementToIdMap = new WeakMap();
        
        this.isInitialized = false;
    }

    /**
     * 公開API: イベントリスナーを追加
     */
    on(event: string, handler: Function): void {
        this.eventManager.on(event, handler);
    }

    /**
     * 公開API: イベントリスナーを削除
     */
    off(event: string, handler: Function): void {
        this.eventManager.off(event, handler);
    }

    /**
     * 公開API: フィールドの状態を取得
     */
    getFieldState(fieldName: string): FieldState | undefined {
        return this.fieldStates.getField(fieldName);
    }

    /**
     * 公開API: 要素からフィールドIDを取得
     */
    getFieldIdFromElement(element: HTMLElement): string | undefined {
        return this.elementToIdMap.get(element);
    }

    /**
     * 公開API: フォームが有効かどうか
     */
    get isValid(): boolean {
        return this.fieldStates.isValid;
    }

    /**
     * 公開API: フォームが変更されたかどうか
     */
    get isDirty(): boolean {
        return this.fieldStates.isDirty;
    }

    /**
     * 公開API: デバッグ情報を出力
     */
    getDebugInfo(): object {
        return {
            isInitialized: this.isInitialized,
            fieldCount: this.fieldCleanups.size,
            isValid: this.isValid,
            isDirty: this.isDirty,
            options: this.options,
            fieldStates: this.fieldStates.getAllStates()
        };
    }

    /**
     * 公開API: 手動でバリデーションを実行
     */
    async validate(): Promise<void> {
        this.log('Manual validation triggered');
        await this.validateAllFields();
    }
}
