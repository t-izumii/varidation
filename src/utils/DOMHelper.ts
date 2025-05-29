/**
 * DOM操作のヘルパークラス
 */
export class DOMHelper {
    /**
     * 要素を安全に取得
     * @param selector セレクター
     * @param parent 親要素（省略時はdocument）
     * @returns 要素またはnull
     */
    static querySelector<T extends HTMLElement = HTMLElement>(
        selector: string, 
        parent: Element | Document = document
    ): T | null {
        try {
            return parent.querySelector<T>(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return null;
        }
    }

    /**
     * 複数の要素を安全に取得
     * @param selector セレクター
     * @param parent 親要素（省略時はdocument）
     * @returns 要素の配列
     */
    static querySelectorAll<T extends HTMLElement = HTMLElement>(
        selector: string, 
        parent: Element | Document = document
    ): T[] {
        try {
            return Array.from(parent.querySelectorAll<T>(selector));
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return [];
        }
    }

    /**
     * 要素の値を取得
     * @param element 要素
     * @returns 値
     */
    static getValue(element: HTMLElement): any {
        if (element instanceof HTMLInputElement) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                return element.checked;
            }
            return element.value;
        } else if (element instanceof HTMLSelectElement) {
            return element.value;
        } else if (element instanceof HTMLTextAreaElement) {
            return element.value;
        }
        
        return element.textContent || '';
    }

    /**
     * 要素に値を設定
     * @param element 要素
     * @param value 値
     */
    static setValue(element: HTMLElement, value: any): void {
        if (element instanceof HTMLInputElement) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = Boolean(value);
            } else {
                element.value = String(value);
            }
        } else if (element instanceof HTMLSelectElement) {
            element.value = String(value);
        } else if (element instanceof HTMLTextAreaElement) {
            element.value = String(value);
        } else {
            element.textContent = String(value);
        }
    }

    /**
     * イベントリスナーを安全に追加
     * @param element 要素
     * @param event イベント名
     * @param handler ハンドラー
     * @param options オプション
     * @returns 削除用の関数
     */
    static addEventListener(
        element: Element | Window | Document,
        event: string,
        handler: EventListener,
        options?: AddEventListenerOptions
    ): () => void {
        element.addEventListener(event, handler, options);
        
        // リスナーを削除する関数を返す
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }

    /**
     * 複数のイベントリスナーを追加
     * @param element 要素
     * @param events イベント名の配列
     * @param handler ハンドラー
     * @param options オプション
     * @returns 削除用の関数
     */
    static addEventListeners(
        element: Element | Window | Document,
        events: string[],
        handler: EventListener,
        options?: AddEventListenerOptions
    ): () => void {
        const removers = events.map(event => 
            this.addEventListener(element, event, handler, options)
        );
        
        // 全てのリスナーを削除する関数を返す
        return () => {
            removers.forEach(remover => remover());
        };
    }

    /**
     * 要素が表示されているかチェック
     * @param element 要素
     * @returns 表示されている場合true
     */
    static isVisible(element: HTMLElement): boolean {
        if (!element) return false;
        
        // display: none チェック
        if (getComputedStyle(element).display === 'none') return false;
        
        // visibility: hidden チェック
        if (getComputedStyle(element).visibility === 'hidden') return false;
        
        // opacity: 0 チェック
        if (getComputedStyle(element).opacity === '0') return false;
        
        // サイズチェック
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        
        return true;
    }

    /**
     * 要素が無効化されているかチェック
     * @param element 要素
     * @returns 無効化されている場合true
     */
    static isDisabled(element: HTMLElement): boolean {
        if ('disabled' in element) {
            return (element as HTMLInputElement).disabled;
        }
        
        return element.getAttribute('aria-disabled') === 'true';
    }

    /**
     * 要素をフォーカス
     * @param element 要素
     * @param options オプション
     */
    static focus(element: HTMLElement, options?: FocusOptions): void {
        if (element && typeof element.focus === 'function') {
            element.focus(options);
        }
    }

    /**
     * 要素の最も近い親要素を取得
     * @param element 要素
     * @param selector セレクター
     * @returns 親要素またはnull
     */
    static closest<T extends HTMLElement = HTMLElement>(
        element: Element,
        selector: string
    ): T | null {
        try {
            return element.closest<T>(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return null;
        }
    }

    /**
     * 要素が特定の要素の子孫かチェック
     * @param element 要素
     * @param parent 親要素
     * @returns 子孫の場合true
     */
    static contains(parent: Element, element: Element): boolean {
        return parent.contains(element);
    }

    /**
     * 要素の属性を安全に取得
     * @param element 要素
     * @param attribute 属性名
     * @returns 属性値またはnull
     */
    static getAttribute(element: Element, attribute: string): string | null {
        return element.getAttribute(attribute);
    }

    /**
     * 要素の属性を安全に設定
     * @param element 要素
     * @param attribute 属性名
     * @param value 値
     */
    static setAttribute(element: Element, attribute: string, value: string): void {
        element.setAttribute(attribute, value);
    }

    /**
     * 要素の属性を安全に削除
     * @param element 要素
     * @param attribute 属性名
     */
    static removeAttribute(element: Element, attribute: string): void {
        element.removeAttribute(attribute);
    }

    /**
     * data属性を取得
     * @param element 要素
     * @param key キー（data-を除く）
     * @returns 値またはundefined
     */
    static getDataAttribute(element: HTMLElement, key: string): string | undefined {
        return element.dataset[key];
    }

    /**
     * data属性を設定
     * @param element 要素
     * @param key キー（data-を除く）
     * @param value 値
     */
    static setDataAttribute(element: HTMLElement, key: string, value: string): void {
        element.dataset[key] = value;
    }

    /**
     * クラスを安全に追加
     * @param element 要素
     * @param className クラス名
     */
    static addClass(element: Element, ...className: string[]): void {
        element.classList.add(...className);
    }

    /**
     * クラスを安全に削除
     * @param element 要素
     * @param className クラス名
     */
    static removeClass(element: Element, ...className: string[]): void {
        element.classList.remove(...className);
    }

    /**
     * クラスの有無をチェック
     * @param element 要素
     * @param className クラス名
     * @returns クラスがある場合true
     */
    static hasClass(element: Element, className: string): boolean {
        return element.classList.contains(className);
    }

    /**
     * クラスをトグル
     * @param element 要素
     * @param className クラス名
     * @param force 強制的に追加/削除
     * @returns 追加された場合true
     */
    static toggleClass(element: Element, className: string, force?: boolean): boolean {
        return element.classList.toggle(className, force);
    }

    /**
     * 要素を作成
     * @param tagName タグ名
     * @param options オプション
     * @returns 作成された要素
     */
    static createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options?: {
            id?: string;
            className?: string;
            attributes?: Record<string, string>;
            text?: string;
            html?: string;
        }
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tagName);
        
        if (options) {
            if (options.id) element.id = options.id;
            if (options.className) element.className = options.className;
            if (options.attributes) {
                Object.entries(options.attributes).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });
            }
            if (options.text) element.textContent = options.text;
            if (options.html) element.innerHTML = options.html;
        }
        
        return element;
    }

    /**
     * 要素をスムーズにスクロール
     * @param element 要素
     * @param options オプション
     */
    static scrollIntoView(element: Element, options?: ScrollIntoViewOptions): void {
        element.scrollIntoView(options ?? { behavior: 'smooth', block: 'center' });
    }

    /**
     * フォームの全てのフィールドを取得
     * @param form フォーム要素
     * @returns フィールドの配列
     */
    static getFormFields(form: HTMLFormElement): HTMLElement[] {
        const fields: HTMLElement[] = [];
        const elements = form.elements;
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element instanceof HTMLInputElement ||
                element instanceof HTMLSelectElement ||
                element instanceof HTMLTextAreaElement) {
                fields.push(element);
            }
        }
        
        return fields;
    }

    /**
     * チェックボックスグループの値を取得
     * @param container コンテナ要素
     * @returns 選択された値の配列
     */
    static getCheckboxGroupValue(container: Element): string[] {
        const checkboxes = this.querySelectorAll<HTMLInputElement>(
            'input[type="checkbox"]:checked',
            container
        );
        return checkboxes.map(checkbox => checkbox.value);
    }

    /**
     * ラジオボタングループの値を取得
     * @param container コンテナ要素
     * @returns 選択された値
     */
    static getRadioGroupValue(container: Element): string | null {
        const radio = this.querySelector<HTMLInputElement>(
            'input[type="radio"]:checked',
            container
        );
        return radio ? radio.value : null;
    }
}
