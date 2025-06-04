import { DOMHelper } from '../utils/DOMHelper';

interface ErrorDisplayOptions {
    showOnValidation: boolean;
    clearOnFocus: boolean;
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

        // 既存のエラー表示をクリア
        this.clearField(fieldId);

        // テンプレートのエラー要素を探す
        let errorElement = this.findTemplateErrorElement(fieldElement);
        
        if (errorElement) {
            // 既存のエラー要素を使用
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            // 既存のエラー要素がない場合は新規作成
            errorElement = this.createErrorElement(message);
            errorElement.id = `${fieldId}-error`;
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');

            // フィールドの後に挿入
            const parent = fieldElement.parentElement;
            if (parent) {
                parent.insertBefore(errorElement, fieldElement.nextSibling);
            }
        }

        // aria-describedbyを設定
        if (!errorElement.id) {
            errorElement.id = `${fieldId}-error`;
        }
        
        const describedBy = fieldElement.getAttribute('aria-describedby');
        if (describedBy) {
            fieldElement.setAttribute('aria-describedby', `${describedBy} ${errorElement.id}`);
        } else {
            fieldElement.setAttribute('aria-describedby', errorElement.id);
        }

        // エラー要素を記録
        this.errorElements.set(fieldId, errorElement);

        // フィールドにエラークラスを追加
        fieldElement.classList.add('error', 'invalid');
        fieldElement.setAttribute('aria-invalid', 'true');
    }

    /**
     * フィールドのエラーをクリア
     */
    clearField(fieldId: string): void {
        // 既存のエラー要素をチェック
        const errorElement = this.errorElements.get(fieldId);
        if (errorElement) {
            // テンプレートのエラー要素かチェック
            if (errorElement.hasAttribute('data-text') && errorElement.getAttribute('data-text') === 'error') {
                // テンプレートのエラー要素の場合はテキストをクリアして非表示
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            } else {
                // 動的に作成したエラー要素の場合は削除
                if (errorElement.parentElement) {
                    errorElement.parentElement.removeChild(errorElement);
                }
            }

            this.errorElements.delete(fieldId);
        }
        
        // 直接テンプレートのエラー要素を探してクリア（念のため）
        const fieldElement = document.querySelector(`[name="${fieldId}"], [id="${fieldId}"]`) as HTMLElement;
        if (fieldElement) {
            const templateErrorElement = this.findTemplateErrorElement(fieldElement);
            if (templateErrorElement && templateErrorElement !== errorElement) {
                templateErrorElement.textContent = '';
                templateErrorElement.style.display = 'none';
            }
            
            // フィールドからaria-describedbyを削除
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
     * テンプレートのエラー要素を探す
     */
    private findTemplateErrorElement(fieldElement: HTMLElement): HTMLElement | null {
        // フィールドの親要素からdata-text="error"を持つ要素を探す
        const parent = fieldElement.parentElement;
        if (parent) {
            const errorElement = parent.querySelector('[data-text="error"]') as HTMLElement;
            if (errorElement) {
                return errorElement;
            }
        }
        
        // グループバリデーションの場合、グループの次の兄弟要素を探す
        if (fieldElement.hasAttribute('data-check_validate') || 
            fieldElement.hasAttribute('data-radio_validate') || 
            fieldElement.hasAttribute('data-select_validate')) {
            
            let nextSibling = fieldElement.nextElementSibling;
            while (nextSibling) {
                if (nextSibling.hasAttribute('data-text') && nextSibling.getAttribute('data-text') === 'error') {
                    return nextSibling as HTMLElement;
                }
                nextSibling = nextSibling.nextElementSibling;
            }
        }
        
        return null;
    }
    private createErrorElement(message: string): HTMLElement {
        const element = document.createElement('div');
        element.className = 'error-message';
        element.textContent = message;
        return element;
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
