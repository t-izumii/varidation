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

    // 1. デフォルトオプションを定義
    private static readonly DEFAULT_OPTIONS = {
        validation: {
            validateOnInput: false,
            validateOnBlur: true,
            debounceDelay: 300
        },
        errorDisplay: {
            showOnValidation: true,
            clearOnFocus: true,
            animationDuration: 200
        },
        onCountUpdated: function(data: { total: number; valid: number }) {
            var el = document.querySelector('[data-count_validate]');
            if (el) {
                el.textContent = (data.total - data.valid).toString();
            }
        }
    };

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
            ...FormManager.DEFAULT_OPTIONS,
            ...options,
            customMessages: options.customMessages || {},
            onFieldValidated: options.onFieldValidated,
            onFormValidated: options.onFormValidated,
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

        // 初期カウントを遅延実行で反映
        setTimeout(() => this.updateCount(), 0);
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
                this.fieldStates.initializeField(fieldId, field, undefined, (element: HTMLElement) => {
                    return this.isFieldInHiddenAreaInternal(element);
                });
                
                // バリデーションイベントを設定
                this.setupFieldValidation(field, fieldId);
            }
        });

        // --- グループバリデーションのセットアップ ---
        const groupValidators = [
            { attr: 'data-check_validate', type: 'checkbox' },
            { attr: 'data-radio_validate', type: 'radio' },
            { attr: 'data-select_validate', type: 'select' }
        ];
        groupValidators.forEach(({ attr, type }) => {
            const groupNodes = this.form.querySelectorAll(`[${attr}]`);
            groupNodes.forEach((groupNode, idx) => {
                const groupId = groupNode.getAttribute('name') || groupNode.getAttribute('id') || `${type}_group_${idx}`;
                // グループの子要素を取得
                let fields: NodeListOf<Element>;
                if (type === 'select') {
                    fields = groupNode.querySelectorAll('select');
                } else {
                    fields = groupNode.querySelectorAll(`input[type=${type}]`);
                }
                // グループバリデーションのセットアップ
                this.setupGroupValidation(groupNode as HTMLElement, fields, groupId, attr);
            });
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
        
        // 除外エリア内のフィールドはバリデーションをスキップ
        if (this.isFieldInHiddenAreaInternal(field)) {
            this.log(`Skipping validation for field in hidden area: ${fieldId}`);
            
            // 除外エリア内のフィールドは常に有効として扱う
            this.fieldStates.updateField(fieldId, {
                value,
                isValid: true,
                errors: [],
                isDirty: true
            });
            
            // エラー表示をクリア
            this.errorDisplay.clearField(fieldId);
            
            // カウントを更新
            this.updateCount();
            return;
        }
        
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
        const isFieldInHiddenAreaCallback = (fieldId: string) => {
            const element = document.querySelector(`[name='${fieldId}'], [id='${fieldId}']`);
            return element ? this.isFieldInHiddenAreaInternal(element as HTMLElement) : false;
        };
        
        const validCount = this.fieldStates.getValidRequiredFieldCount(isFieldInHiddenAreaCallback);
        const totalCount = this.fieldStates.getTotalRequiredFieldCount(isFieldInHiddenAreaCallback);
        
        this.log(`Count updated - valid: ${validCount}, total: ${totalCount}`);
        this.log(`Required field IDs:`, this.fieldStates.getRequiredFieldIds(isFieldInHiddenAreaCallback));
        
        this.eventManager.emit(ValidationEvents.COUNT_UPDATED, {
            valid: validCount,
            total: totalCount,
            isComplete: validCount === totalCount
        });
        // 追加: ボタンの活性/非活性制御
        if (this.submitButton && this.options.disableSubmitUntilValid) {
            // 必須項目がすべて有効かつ全フィールドにエラーがない場合のみ有効化
            const isFormValid = validCount === totalCount && this.fieldStates.isValid;
            this.submitButton.disabled = !isFormValid;
            this.log(`Submit button disabled: ${this.submitButton.disabled}, formValid: ${isFormValid}`);
        }
    }

    /**
     * イベントリスナーを設定
     */
    private setupEventListeners(): void {
        this.log('Setting up form event listeners');
        
        // フォーム送信
        const submitCleanup = DOMHelper.addEventListener(this.form, 'submit', (event) => {
            this.log('Form submit event triggered, isValid:', this.isValid);
            if (!this.isValid) {
                event.preventDefault();
                this.log('Form submission prevented, validating all fields');
                this.validateAllFieldsInternal();
            }
        });

        // フォームリセット
        const resetCleanup = DOMHelper.addEventListener(this.form, 'reset', () => {
            this.log('Form reset event triggered');
            this.reset();
        });
    }

    /**
     * 全フィールドを検証（内部用、シンプル版）
     */
    private async validateAllFieldsInternal(): Promise<void> {
        this.log('Validating all fields (internal)');
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
        // 送信ボタンの状態もupdateCountで制御するため、ここでの個別有効化は不要
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
     * 公開API: 手動でバリデーションを実行（簡易版）
     */
    async validate(): Promise<void> {
        this.log('Manual validation triggered');
        await this.validateAllFieldsInternal();
    }

    /**
     * 公開API: 全フィールドを検証（必須項目以外でも入力があるフィールドもバリデーション実行）
     */
    async validateAllFields(): Promise<void> {
        this.log('Validating all fields (comprehensive)');
        const fields = this.form.querySelectorAll('input, select, textarea');
        const promises: Promise<void>[] = [];

        fields.forEach((field: Element) => {
            if (field instanceof HTMLInputElement || 
                field instanceof HTMLSelectElement || 
                field instanceof HTMLTextAreaElement) {
                
                const fieldId = this.elementToIdMap.get(field);
                if (fieldId) {
                    // 必須項目か、あるいは値が入力されているフィールドのみバリデーション実行
                    const isRequired = field.hasAttribute('required') || 
                                     (field.dataset.validate && field.dataset.validate.includes('required'));
                    const hasValue = field.value && field.value.trim();
                    
                    if (isRequired || hasValue) {
                        promises.push(this.validateField(field, fieldId));
                    }
                }
            }
        });

        await Promise.all(promises);

        // グループバリデーションも再実行（エラー表示を強制的に行う）
        this.validateAllGroupFields();

        // フォーム全体のバリデーション結果を発火
        this.eventManager.emit(ValidationEvents.FORM_VALIDATED, {
            form: this.form,
            isValid: this.isValid,
            fieldStates: this.fieldStates.getAllStates()
        });
        
        this.log('All fields validation completed, isValid:', this.isValid);
    }

    /**
     * 公開API: カウントを手動で更新（除外エリアの切り替え時などに使用）
     */
    updateValidationCount(): void {
        this.log('Manual count update triggered');
        
        // 除外エリアの状態変更に対応するため、全フィールドの必須状態を再評価
        this.fieldStates.reevaluateAllFieldsRequiredState((fieldId: string) => {
            const element = document.querySelector(`[name='${fieldId}'], [id='${fieldId}']`);
            return element ? this.isFieldInHiddenAreaInternal(element as HTMLElement) : false;
        });
        
        // 除外エリア内のフィールドのエラーをクリア
        this.clearHiddenAreaErrors();
        
        // グループバリデーションの状態も再評価
        this.reevaluateGroupValidations();
        
        this.updateCount();
    }

    /**
     * ヘルパー関数: フィールドが除外エリア内かどうかをチェック（公開API）
     */
    isFieldInHiddenArea(element: HTMLElement): boolean {
        // 要素自身に除外属性があるかチェック
        if (element.hasAttribute('data-validate-hidden')) {
            return true;
        }
        
        // 親要素を遡って除外属性を持つ要素を探す
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            if (parent.hasAttribute('data-validate-hidden')) {
                return true;
            }
            parent = parent.parentElement;
        }
        
        return false;
    }

    /**
     * ヘルパー関数: フィールドが除外エリア内かどうかをチェック（内部用）
     */
    private isFieldInHiddenAreaInternal(element: HTMLElement): boolean {
        return this.isFieldInHiddenArea(element);
    }

    /**
     * 除外エリア内のフィールドのエラーをクリア
     */
    private clearHiddenAreaErrors(): void {
        const allStates = this.fieldStates.getAllStates();
        
        for (const fieldId in allStates) {
            const element = document.querySelector(`[name='${fieldId}'], [id='${fieldId}']`);
            if (element && this.isFieldInHiddenAreaInternal(element as HTMLElement)) {
                // 除外エリア内のフィールドの状態を有効に更新
                this.fieldStates.updateField(fieldId, {
                    isValid: true,
                    errors: []
                });
                
                // エラー表示をクリア
                this.errorDisplay.clearField(fieldId);
                
                this.log(`Cleared error for hidden field: ${fieldId}`);
            }
        }
    }

    /**
     * 全グループフィールドをバリデーション（エラー表示を強制的に行う）
     */
    private validateAllGroupFields(): void {
        const groupValidators = [
            { attr: 'data-check_validate', type: 'checkbox' },
            { attr: 'data-radio_validate', type: 'radio' },
            { attr: 'data-select_validate', type: 'select' }
        ];
        
        groupValidators.forEach(({ attr, type }) => {
            const groupNodes = this.form.querySelectorAll(`[${attr}]`);
            groupNodes.forEach((groupNode, idx) => {
                const groupId = groupNode.getAttribute('name') || groupNode.getAttribute('id') || `${type}_group_${idx}`;
                
                // グループの子要素を取得
                let fields: NodeListOf<Element>;
                if (type === 'select') {
                    fields = groupNode.querySelectorAll('select');
                } else {
                    fields = groupNode.querySelectorAll(`input[type=${type}]`);
                }
                
                // グループバリデーションを実行（isTouchedをtrueに設定してエラー表示を強制）
                this.validateGroupField(groupNode as HTMLElement, fields, groupId, attr, true);
            });
        });
    }

    /**
     * グループバリデーションの状態を再評価（エラー表示はしない）
     */
    private reevaluateGroupValidations(): void {
        const groupValidators = [
            { attr: 'data-check_validate', type: 'checkbox' },
            { attr: 'data-radio_validate', type: 'radio' },
            { attr: 'data-select_validate', type: 'select' }
        ];
        
        groupValidators.forEach(({ attr, type }) => {
            const groupNodes = this.form.querySelectorAll(`[${attr}]`);
            groupNodes.forEach((groupNode, idx) => {
                const groupId = groupNode.getAttribute('name') || groupNode.getAttribute('id') || `${type}_group_${idx}`;
                
                // グループの子要素を取得
                let fields: NodeListOf<Element>;
                if (type === 'select') {
                    fields = groupNode.querySelectorAll('select');
                } else {
                    fields = groupNode.querySelectorAll(`input[type=${type}]`);
                }
                
                // グループバリデーションを再実行
                this.validateGroupField(groupNode as HTMLElement, fields, groupId, attr, false);
            });
        });
    }

    // グループバリデーションのセットアップ
    private setupGroupValidation(
        groupNode: HTMLElement,
        fields: NodeListOf<Element>,
        groupId: string,
        attr: string
    ) {
        // nameもidも無い場合はid属性を付与
        if (!groupNode.getAttribute('name') && !groupNode.getAttribute('id')) {
            groupNode.setAttribute('id', groupId);
        }
        
        // 除外エリア内のグループかチェック
        const isInHiddenArea = this.isFieldInHiddenAreaInternal(groupNode);
        
        // requiredが明示的に指定されているかチェック
        const validateRules = groupNode.getAttribute(attr);
        const isRequired = validateRules && validateRules.includes('required');
        
        this.log(`Setting up group validation for ${groupId}, isInHiddenArea: ${isInHiddenArea}, isRequired: ${isRequired}`);
        
        // 初期化（除外エリア内の場合や非必須の場合は有効な状態で初期化）
        this.fieldStates.initializeField(groupId, groupNode as any, { 
            isTouched: false,
            isValid: isInHiddenArea || !isRequired,  // 除外エリア内または非必須の場合は最初から有効
            errors: []
        }, (element: HTMLElement) => {
            return this.isFieldInHiddenAreaInternal(element);
        });

        // 各子要素にイベントリスナー
        fields.forEach(field => {
            field.addEventListener('change', () => {
                this.validateGroupField(groupNode, fields, groupId, attr, true);
            });
        });

        // 初回バリデーション（isUserAction: false）
        this.validateGroupField(groupNode, fields, groupId, attr, false);
    }

    // グループバリデーションの実行
    private validateGroupField(
        groupNode: HTMLElement,
        fields: NodeListOf<Element>,
        groupId: string,
        attr: string,
        isUserAction: boolean = false
    ) {
        // 除外エリア内のグループはバリデーションをスキップ
        if (this.isFieldInHiddenAreaInternal(groupNode)) {
            this.log(`Skipping group validation for hidden area: ${groupId}`);
            
            // 除外エリア内のグループは常に有効として扱う
            this.fieldStates.updateField(groupId, {
                isValid: true,
                errors: [],
                isTouched: isUserAction
            });
            
            // エラー表示をクリア
            this.errorDisplay.clearField(groupId);
            
            // カウント更新
            this.updateCount();
            return;
        }
        
        const validateRules = groupNode.getAttribute(attr);
        let isValid = true;  // デフォルトは有効
        let errorMsg = '';
        let isRequired = false;  // 必須かどうかのフラグを追加
        
        // requiredが明示的に指定されているかチェック
        if (validateRules && validateRules.includes('required')) {
            isRequired = true;
        }

        // RequiredValidatorのデフォルトメッセージ仕様
        const defaultMessages = {
            'data-check_validate': {
                agree: '個人情報保護方針の同意にチェックを入れてください。',
                checkbox: 'チェックボックスを選択してください。',
                default: '1つ以上選択してください'
            },
            'data-radio_validate': {
                radiobox: 'ラジオボタンを選択してください。',
                default: '1つ以上選択してください'
            },
            'data-select_validate': {
                select: '選択してください。',
                default: '選択してください'
            }
        };

        // 必須の場合のみバリデーションを実行
        if (isRequired) {
            if (attr === 'data-check_validate' || attr === 'data-radio_validate') {
                isValid = Array.from(fields).some((field: any) => field.checked);
                if (!isValid) {
                    // ルールに応じたメッセージ
                    let msg = '';
                    if (validateRules && validateRules.includes('agree')) {
                        msg = defaultMessages['data-check_validate'].agree;
                    } else if (attr === 'data-check_validate') {
                        msg = defaultMessages['data-check_validate'].checkbox;
                    } else if (attr === 'data-radio_validate') {
                        msg = defaultMessages['data-radio_validate'].radiobox;
                    }
                    errorMsg = msg || defaultMessages[attr].default;
                }
            } else if (attr === 'data-select_validate') {
                isValid = Array.from(fields).some((field: any) => field.value);
                if (!isValid) {
                    errorMsg = defaultMessages['data-select_validate'].select;
                }
            }
        }

        // isTouched管理
        const state = this.fieldStates.getField(groupId);
        let isTouched = state?.isTouched ?? false;
        if (isUserAction) isTouched = true;

        this.fieldStates.updateField(groupId, {
            isValid,
            errors: (isValid || !isRequired) ? [] : [{ rule: 'required', message: errorMsg, value: undefined }],
            isTouched
        });

        // エラー表示（必須の場合のみ）
        if (!isValid && isTouched && isRequired) {
            this.errorDisplay.showFieldError(groupId, errorMsg, groupNode);
        } else {
            this.errorDisplay.clearField(groupId);
        }

        // カウント更新
        this.updateCount();
    }
}
