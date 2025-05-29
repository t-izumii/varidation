import { ValidationError } from '../types';

/**
 * エラー表示の設定
 */
export interface ErrorDisplayOptions {
    position: 'inline' | 'tooltip' | 'summary';
    animation: boolean;
    showIcon: boolean;
    errorClass: string;
    errorTextClass: string;
    successClass?: string;
    ariaLive: 'polite' | 'assertive';
}

/**
 * エラー表示管理クラス
 */
export class ErrorDisplay {
    private options: ErrorDisplayOptions;
    private errorElements: Map<HTMLElement, HTMLElement> = new Map();

    constructor(options?: Partial<ErrorDisplayOptions>) {
        this.options = {
            position: 'inline',
            animation: true,
            showIcon: false,
            errorClass: 'error',
            errorTextClass: 'error-text',
            successClass: 'success',
            ariaLive: 'polite',
            ...options
        };
    }

    /**
     * フィールドのエラーを表示
     */
    showError(field: HTMLElement, errors: ValidationError[]): void {
        // フィールドにエラークラスを追加
        field.classList.add(this.options.errorClass);
        
        if (this.options.successClass) {
            field.classList.remove(this.options.successClass);
        }

        // エラーメッセージ要素を取得または作成
        const errorElement = this.getOrCreateErrorElement(field);
        
        if (errorElement) {
            // エラーメッセージを設定
            const messages = errors.map(error => error.message);
            errorElement.textContent = messages.join(', ');
            
            // アクセシビリティ対応
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', this.options.ariaLive);
            
            // アニメーション
            if (this.options.animation) {
                this.animateError(errorElement);
            }
            
            // フィールドとエラーメッセージを関連付け
            const fieldId = field.id || this.generateId(field);
            const errorId = errorElement.id || this.generateId(errorElement);
            
            field.setAttribute('aria-describedby', errorId);
            field.setAttribute('aria-invalid', 'true');
        }
    }

    /**
     * フィールドのエラーを非表示
     */
    hideError(field: HTMLElement): void {
        // エラークラスを削除
        field.classList.remove(this.options.errorClass);
        
        if (this.options.successClass) {
            field.classList.add(this.options.successClass);
        }

        // エラーメッセージ要素を取得
        const errorElement = this.getErrorElement(field);
        
        if (errorElement) {
            errorElement.textContent = '';
            
            // アクセシビリティ属性を削除
            field.removeAttribute('aria-describedby');
            field.setAttribute('aria-invalid', 'false');
        }
    }

    /**
     * エラーサマリーを表示
     */
    showSummary(errors: Array<{ field: string; errors: ValidationError[] }>): void {
        const summaryElement = document.querySelector('[data-validation-summary]');
        if (!summaryElement) return;

        // サマリーをクリア
        summaryElement.innerHTML = '';

        if (errors.length === 0) {
            summaryElement.classList.add('hidden');
            return;
        }

        // サマリーを表示
        summaryElement.classList.remove('hidden');
        
        // エラーリストを作成
        const list = document.createElement('ul');
        list.className = 'validation-summary-list';

        for (const fieldError of errors) {
            for (const error of fieldError.errors) {
                const item = document.createElement('li');
                item.textContent = error.message;
                
                // フィールドへのリンクを作成
                const link = document.createElement('a');
                link.href = `#${fieldError.field}`;
                link.textContent = error.message;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const field = document.getElementById(fieldError.field);
                    if (field) {
                        field.focus();
                        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
                
                item.innerHTML = '';
                item.appendChild(link);
                list.appendChild(item);
            }
        }

        summaryElement.appendChild(list);
        
        // アクセシビリティ対応
        summaryElement.setAttribute('role', 'alert');
        summaryElement.setAttribute('aria-live', 'assertive');
    }

    /**
     * エラーサマリーを非表示
     */
    hideSummary(): void {
        const summaryElement = document.querySelector('[data-validation-summary]');
        if (summaryElement) {
            summaryElement.innerHTML = '';
            summaryElement.classList.add('hidden');
        }
    }

    /**
     * エラー要素を取得または作成
     */
    private getOrCreateErrorElement(field: HTMLElement): HTMLElement | null {
        // 既存のエラー要素を探す
        let errorElement = this.getErrorElement(field);
        
        if (!errorElement) {
            // インライン表示の場合
            if (this.options.position === 'inline') {
                // data-text="error"要素を探す
                const parent = field.parentElement;
                if (parent) {
                    errorElement = parent.querySelector('[data-text="error"]') as HTMLElement;
                }
                
                // 見つからない場合は作成
                if (!errorElement && parent) {
                    errorElement = document.createElement('p');
                    errorElement.className = this.options.errorTextClass;
                    errorElement.setAttribute('data-text', 'error');
                    parent.appendChild(errorElement);
                }
            }
            // TODO: tooltip, summary の実装
        }

        if (errorElement) {
            this.errorElements.set(field, errorElement);
        }

        return errorElement;
    }

    /**
     * エラー要素を取得
     */
    private getErrorElement(field: HTMLElement): HTMLElement | null {
        // キャッシュから取得
        if (this.errorElements.has(field)) {
            return this.errorElements.get(field)!;
        }

        // data-text="error"要素を探す
        const parent = field.parentElement;
        if (parent) {
            const errorElement = parent.querySelector('[data-text="error"]') as HTMLElement;
            if (errorElement) {
                this.errorElements.set(field, errorElement);
                return errorElement;
            }
        }

        return null;
    }

    /**
     * IDを生成
     */
    private generateId(element: HTMLElement): string {
        const id = `validation-${Math.random().toString(36).substr(2, 9)}`;
        element.id = id;
        return id;
    }

    /**
     * エラーアニメーション
     */
    private animateError(element: HTMLElement): void {
        // 既存のアニメーションクラスを削除
        element.classList.remove('error-animation');
        
        // リフローを強制
        void element.offsetWidth;
        
        // アニメーションクラスを追加
        element.classList.add('error-animation');
    }

    /**
     * 全てのエラーをクリア
     */
    clearAll(): void {
        for (const [field, errorElement] of this.errorElements) {
            this.hideError(field);
        }
        this.errorElements.clear();
        this.hideSummary();
    }

    /**
     * エラー要素のキャッシュをクリア
     */
    clearCache(): void {
        this.errorElements.clear();
    }
}
