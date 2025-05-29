import { DOMHelper } from '../utils/DOMHelper';

interface ErrorDisplayOptions {
    showOnValidation: boolean;
    clearOnFocus: boolean;
    animationDuration: number;
}

/**
 * エラー表示を管理するクラス
 */
export class ErrorDisplayManager {
    private options: ErrorDisplayOptions;
    private errorElements: Map<string, HTMLElement> = new Map();

    constructor(options: ErrorDisplayOptions) {
        this.options = options;
    }

    /**
     * フィールドのエラーを表示
     */
    showFieldError(fieldId: string, message: string, fieldElement: HTMLElement): void {
        if (!this.options.showOnValidation) {
            return;
        }

        // 既存のエラー要素を削除
        this.clearField(fieldId);

        // エラー要素を作成
        const errorElement = this.createErrorElement(message);
        errorElement.id = `${fieldId}-error`;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');

        // フィールドの後に挿入
        const parent = fieldElement.parentElement;
        if (parent) {
            parent.insertBefore(errorElement, fieldElement.nextSibling);
        }

        // aria-describedbyを設定
        const describedBy = fieldElement.getAttribute('aria-describedby');
        if (describedBy) {
            fieldElement.setAttribute('aria-describedby', `${describedBy} ${errorElement.id}`);
        } else {
            fieldElement.setAttribute('aria-describedby', errorElement.id);
        }

        // エラー要素を記録
        this.errorElements.set(fieldId, errorElement);

        // アニメーション効果
        this.animateShow(errorElement);

        // フィールドにエラークラスを追加
        fieldElement.classList.add('error', 'invalid');
        fieldElement.setAttribute('aria-invalid', 'true');
    }

    /**
     * フィールドのエラーをクリア
     */
    clearField(fieldId: string): void {
        const errorElement = this.errorElements.get(fieldId);
        if (errorElement) {
            // アニメーション効果
            this.animateHide(errorElement, () => {
                // エラー要素を削除
                if (errorElement.parentElement) {
                    errorElement.parentElement.removeChild(errorElement);
                }
            });

            // フィールドからaria-describedbyを削除
            const fieldElement = document.querySelector(`[name="${fieldId}"], [id="${fieldId}"]`) as HTMLElement;
            if (fieldElement) {
                const describedBy = fieldElement.getAttribute('aria-describedby');
                if (describedBy) {
                    const newDescribedBy = describedBy
                        .split(' ')
                        .filter(id => id !== `${fieldId}-error`)
                        .join(' ');
                    
                    if (newDescribedBy) {
                        fieldElement.setAttribute('aria-describedby', newDescribedBy);
                    } else {
                        fieldElement.removeAttribute('aria-describedby');
                    }
                }

                // エラークラスを削除
                fieldElement.classList.remove('error', 'invalid');
                fieldElement.setAttribute('aria-invalid', 'false');
            }

            this.errorElements.delete(fieldId);
        }
    }

    /**
     * 全エラーをクリア
     */
    clearAll(): void {
        for (const fieldId of this.errorElements.keys()) {
            this.clearField(fieldId);
        }
    }

    /**
     * エラー要素を作成
     */
    private createErrorElement(message: string): HTMLElement {
        const element = document.createElement('div');
        element.className = 'error-message';
        element.textContent = message;
        element.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
        return element;
    }

    /**
     * 表示アニメーション
     */
    private animateShow(element: HTMLElement): void {
        if (this.options.animationDuration > 0) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(-10px)';
            element.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
            
            // 次のフレームで表示
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }
    }

    /**
     * 非表示アニメーション
     */
    private animateHide(element: HTMLElement, callback: () => void): void {
        if (this.options.animationDuration > 0) {
            element.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
            element.style.opacity = '0';
            element.style.transform = 'translateY(-10px)';
            
            setTimeout(callback, this.options.animationDuration);
        } else {
            callback();
        }
    }

    /**
     * エラーが表示されているかチェック
     */
    hasError(fieldId: string): boolean {
        return this.errorElements.has(fieldId);
    }

    /**
     * 表示中のエラー数を取得
     */
    getErrorCount(): number {
        return this.errorElements.size;
    }
}
