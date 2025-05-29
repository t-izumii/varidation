/**
 * アクセシビリティ管理クラス
 * WAI-ARIA対応とスクリーンリーダー対応を提供
 */
export class Accessibility {
    private liveRegion: HTMLElement | null = null;
    private announceTimeout: NodeJS.Timeout | null = null;

    /**
     * コンストラクタ
     */
    constructor() {
        this.createLiveRegion();
    }

    /**
     * ライブリージョンを作成
     */
    private createLiveRegion(): void {
        // 既存のライブリージョンを探す
        this.liveRegion = document.querySelector('[data-validation-announce]');
        
        if (!this.liveRegion) {
            // なければ作成
            this.liveRegion = document.createElement('div');
            this.liveRegion.setAttribute('data-validation-announce', '');
            this.liveRegion.setAttribute('role', 'status');
            this.liveRegion.setAttribute('aria-live', 'polite');
            this.liveRegion.setAttribute('aria-atomic', 'true');
            
            // スクリーンリーダー以外では非表示
            this.liveRegion.style.position = 'absolute';
            this.liveRegion.style.left = '-10000px';
            this.liveRegion.style.width = '1px';
            this.liveRegion.style.height = '1px';
            this.liveRegion.style.overflow = 'hidden';
            
            document.body.appendChild(this.liveRegion);
        }
    }

    /**
     * メッセージをアナウンス
     * @param message メッセージ
     * @param priority 優先度（'polite' または 'assertive'）
     */
    announceMessage(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
        if (!this.liveRegion) return;

        // 既存のタイマーをクリア
        if (this.announceTimeout) {
            clearTimeout(this.announceTimeout);
        }

        // 優先度を設定
        this.liveRegion.setAttribute('aria-live', priority);

        // メッセージを設定
        this.liveRegion.textContent = message;

        // 一定時間後にクリア
        this.announceTimeout = setTimeout(() => {
            if (this.liveRegion) {
                this.liveRegion.textContent = '';
            }
        }, 5000);
    }

    /**
     * エラーをアナウンス
     * @param message エラーメッセージ
     */
    announceError(message: string): void {
        this.announceMessage(message, 'assertive');
    }

    /**
     * 成功をアナウンス
     * @param message 成功メッセージ
     */
    announceSuccess(message: string): void {
        this.announceMessage(message, 'polite');
    }

    /**
     * フィールドの妥当性を設定
     * @param field フィールド要素
     * @param isValid 妥当かどうか
     */
    setFieldValidity(field: HTMLElement, isValid: boolean): void {
        field.setAttribute('aria-invalid', (!isValid).toString());
    }

    /**
     * フィールドの説明を設定
     * @param field フィールド要素
     * @param description 説明
     */
    setFieldDescription(field: HTMLElement, description: string): void {
        // 既存の説明要素を探す
        let descId = field.getAttribute('aria-describedby');
        let descElement: HTMLElement | null = null;

        if (descId) {
            descElement = document.getElementById(descId);
        }

        // なければ作成
        if (!descElement) {
            descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
            descElement = document.createElement('span');
            descElement.id = descId;
            descElement.className = 'sr-only'; // スクリーンリーダー専用クラス
            
            // フィールドの後に挿入
            if (field.parentNode) {
                field.parentNode.insertBefore(descElement, field.nextSibling);
            }
            
            field.setAttribute('aria-describedby', descId);
        }

        descElement.textContent = description;
    }

    /**
     * フィールドの必須状態を設定
     * @param field フィールド要素
     * @param isRequired 必須かどうか
     */
    setFieldRequired(field: HTMLElement, isRequired: boolean): void {
        field.setAttribute('aria-required', isRequired.toString());
        
        if (field instanceof HTMLInputElement || 
            field instanceof HTMLSelectElement || 
            field instanceof HTMLTextAreaElement) {
            field.required = isRequired;
        }
    }

    /**
     * フィールドのラベルを設定
     * @param field フィールド要素
     * @param label ラベルテキスト
     */
    setFieldLabel(field: HTMLElement, label: string): void {
        // 既存のラベルを探す
        const fieldId = field.id || `field-${Math.random().toString(36).substr(2, 9)}`;
        field.id = fieldId;
        
        let labelElement = document.querySelector(`label[for="${fieldId}"]`) as HTMLLabelElement;
        
        if (!labelElement) {
            // aria-labelledbyを確認
            const labelledBy = field.getAttribute('aria-labelledby');
            if (labelledBy) {
                labelElement = document.getElementById(labelledBy) as HTMLLabelElement;
            }
        }

        if (labelElement) {
            labelElement.textContent = label;
        } else {
            // aria-labelを設定
            field.setAttribute('aria-label', label);
        }
    }

    /**
     * フォーカス管理
     * @param field フィールド要素
     * @param options フォーカスオプション
     */
    manageFocus(field: HTMLElement, options?: FocusOptions): void {
        // タブインデックスを確認
        if (!field.hasAttribute('tabindex') && !this.isNaturallyFocusable(field)) {
            field.setAttribute('tabindex', '0');
        }

        // フォーカス
        field.focus(options);
    }

    /**
     * 要素が自然にフォーカス可能かチェック
     * @param element 要素
     * @returns フォーカス可能な場合true
     */
    private isNaturallyFocusable(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement ||
               element instanceof HTMLSelectElement ||
               element instanceof HTMLTextAreaElement ||
               element instanceof HTMLButtonElement ||
               element instanceof HTMLAnchorElement;
    }

    /**
     * エラーサマリーのアクセシビリティ設定
     * @param summary サマリー要素
     * @param errorCount エラー数
     */
    setupErrorSummary(summary: HTMLElement, errorCount: number): void {
        summary.setAttribute('role', 'alert');
        summary.setAttribute('aria-live', 'assertive');
        summary.setAttribute('aria-atomic', 'true');
        
        // ラベルを設定
        const label = errorCount === 1 
            ? '1件のエラーがあります' 
            : `${errorCount}件のエラーがあります`;
        summary.setAttribute('aria-label', label);
    }

    /**
     * フォームのアクセシビリティ設定
     * @param form フォーム要素
     */
    setupForm(form: HTMLFormElement): void {
        // フォームのラベル
        if (!form.getAttribute('aria-label') && !form.getAttribute('aria-labelledby')) {
            const heading = form.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading && heading.id) {
                form.setAttribute('aria-labelledby', heading.id);
            }
        }
    }

    /**
     * プログレス表示のアクセシビリティ設定
     * @param element 要素
     * @param isLoading ローディング中かどうか
     */
    setLoadingState(element: HTMLElement, isLoading: boolean): void {
        element.setAttribute('aria-busy', isLoading.toString());
        
        if (isLoading) {
            this.announceMessage('検証中です...', 'polite');
        }
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        if (this.announceTimeout) {
            clearTimeout(this.announceTimeout);
        }
        
        if (this.liveRegion && this.liveRegion.parentNode) {
            this.liveRegion.parentNode.removeChild(this.liveRegion);
        }
    }
}
