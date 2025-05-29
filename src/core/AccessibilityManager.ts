/**
 * アクセシビリティ管理クラス
 * フォームのアクセシビリティを向上させる機能を提供
 */
export class AccessibilityManager {
    private form?: HTMLFormElement;
    private ariaLiveRegion?: HTMLElement;

    /**
     * 初期化
     */
    initialize(form: HTMLFormElement): void {
        this.form = form;
        this.setupAriaLiveRegion();
        this.enhanceFormAccessibility();
    }

    /**
     * aria-live領域を設定
     */
    private setupAriaLiveRegion(): void {
        if (!this.form) return;

        // 既存のaria-live領域をチェック
        let liveRegion = this.form.querySelector('[aria-live]') as HTMLElement;
        
        if (!liveRegion) {
            // aria-live領域を作成
            liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            
            this.form.appendChild(liveRegion);
        }
        
        this.ariaLiveRegion = liveRegion;
    }

    /**
     * フォームのアクセシビリティを向上
     */
    private enhanceFormAccessibility(): void {
        if (!this.form) return;

        // フォームにrole属性を設定
        if (!this.form.hasAttribute('role')) {
            this.form.setAttribute('role', 'form');
        }

        // 必須フィールドにaria-required属性を設定
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.hasAttribute('aria-required')) {
                field.setAttribute('aria-required', 'true');
            }
        });

        // ラベルとフィールドの関連付けを確認・修正
        this.enhanceLabeling();

        // フィールドセットとレジェンドの確認
        this.enhanceFieldsets();
    }

    /**
     * ラベリングを向上
     */
    private enhanceLabeling(): void {
        if (!this.form) return;

        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            if (field instanceof HTMLElement) {
                const fieldId = field.id;
                const fieldName = (field as any).name;
                
                // IDが無い場合は生成
                if (!fieldId && fieldName) {
                    field.id = `field-${fieldName}`;
                }
                
                // 関連するラベルを検索
                let label = this.form!.querySelector(`label[for="${field.id}"]`) as HTMLLabelElement;
                
                if (!label && fieldName) {
                    // for属性でnameを指定している場合
                    label = this.form!.querySelector(`label[for="${fieldName}"]`) as HTMLLabelElement;
                    if (label) {
                        label.setAttribute('for', field.id);
                    }
                }
                
                if (!label) {
                    // 親要素がlabelの場合
                    const parentLabel = field.closest('label') as HTMLLabelElement;
                    if (parentLabel) {
                        label = parentLabel;
                    }
                }
                
                // aria-labelledby属性を設定
                if (label && !field.hasAttribute('aria-labelledby')) {
                    if (!label.id) {
                        label.id = `label-${field.id}`;
                    }
                    field.setAttribute('aria-labelledby', label.id);
                }
            }
        });
    }

    /**
     * フィールドセットを向上
     */
    private enhanceFieldsets(): void {
        if (!this.form) return;

        const fieldsets = this.form.querySelectorAll('fieldset');
        
        fieldsets.forEach(fieldset => {
            const legend = fieldset.querySelector('legend');
            
            if (legend && !fieldset.hasAttribute('aria-labelledby')) {
                if (!legend.id) {
                    legend.id = `legend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }
                fieldset.setAttribute('aria-labelledby', legend.id);
            }
        });
    }

    /**
     * ステータスメッセージをアナウンス
     */
    announceStatus(message: string): void {
        if (this.ariaLiveRegion) {
            this.ariaLiveRegion.textContent = message;
            
            // メッセージをクリア（重複アナウンスを防ぐため）
            setTimeout(() => {
                if (this.ariaLiveRegion) {
                    this.ariaLiveRegion.textContent = '';
                }
            }, 1000);
        }
    }

    /**
     * エラーメッセージをアナウンス
     */
    announceError(message: string): void {
        this.announceStatus(`エラー: ${message}`);
    }

    /**
     * 成功メッセージをアナウンス
     */
    announceSuccess(message: string): void {
        this.announceStatus(`成功: ${message}`);
    }

    /**
     * フィールドにフォーカスを設定
     */
    focusField(fieldId: string): void {
        if (!this.form) return;

        const field = this.form.querySelector(`#${fieldId}, [name="${fieldId}"]`) as HTMLElement;
        if (field && typeof field.focus === 'function') {
            field.focus();
        }
    }

    /**
     * 最初のエラーフィールドにフォーカスを設定
     */
    focusFirstError(): void {
        if (!this.form) return;

        const errorField = this.form.querySelector('[aria-invalid="true"], .error') as HTMLElement;
        if (errorField && typeof errorField.focus === 'function') {
            errorField.focus();
        }
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        if (this.ariaLiveRegion && this.ariaLiveRegion.parentElement) {
            this.ariaLiveRegion.parentElement.removeChild(this.ariaLiveRegion);
        }
        this.ariaLiveRegion = undefined;
        this.form = undefined;
    }

    /**
     * キーボードナビゲーションを向上
     */
    enhanceKeyboardNavigation(): void {
        if (!this.form) return;

        // Tab順序を確認・調整
        const focusableElements = this.form.querySelectorAll(
            'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach((element, index) => {
            if (element instanceof HTMLElement && !element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
    }

    /**
     * コントラストの確認と改善
     */
    enhanceVisualAccessibility(): void {
        if (!this.form) return;

        // エラー状態の要素に追加のスタイルクラスを適用
        const errorElements = this.form.querySelectorAll('[aria-invalid="true"], .error');
        
        errorElements.forEach(element => {
            if (element instanceof HTMLElement) {
                element.classList.add('accessibility-error');
            }
        });
    }
}
