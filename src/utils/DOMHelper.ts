// ================================================================================================
// DOMHelper - DOM操作のヘルパークラス
// 安全で一貫性のあるDOM操作機能を提供
// ================================================================================================

/**
 * DOM操作のヘルパークラス
 * ブラウザ間の差異を吸収し、安全なDOM操作機能を提供
 */
export class DOMHelper {
    
    // ================================================================================================
    // 要素取得メソッド群
    // ================================================================================================
    
    /**
     * 要素を安全に取得
     * try-catchでエラーハンドリングを行い、不正なセレクターでもクラッシュしない
     * @param selector CSSセレクター
     * @param parent 親要素（省略時はdocument）
     * @returns 要素またはnull
     */
    static querySelector<T extends HTMLElement = HTMLElement>(
        selector: string, 
        parent: Element | Document = document
    ): T | null {
        try {
            // セレクターを使って要素を検索
            return parent.querySelector<T>(selector);
        } catch (error) {
            // 不正なセレクターの場合はエラーログを出力してnullを返す
            console.error(`Invalid selector: ${selector}`, error);
            return null;
        }
    }

    /**
     * 複数の要素を安全に取得
     * NodeListを配列に変換して扱いやすくする
     * @param selector CSSセレクター
     * @param parent 親要素（省略時はdocument）
     * @returns 要素の配列
     */
    static querySelectorAll<T extends HTMLElement = HTMLElement>(
        selector: string, 
        parent: Element | Document = document
    ): T[] {
        try {
            // NodeListを配列に変換して返す
            return Array.from(parent.querySelectorAll<T>(selector));
        } catch (error) {
            // 不正なセレクターの場合はエラーログを出力して空配列を返す
            console.error(`Invalid selector: ${selector}`, error);
            return [];
        }
    }

    // ================================================================================================
    // 値の取得・設定メソッド群
    // ================================================================================================

    /**
     * 要素の値を取得
     * 要素の種類に応じて適切な値を取得
     * @param element HTML要素
     * @returns 値
     */
    static getValue(element: HTMLElement): any {
        if (element instanceof HTMLInputElement) {
            // input要素の場合
            if (element.type === 'checkbox' || element.type === 'radio') {
                // チェックボックス・ラジオボタンの場合はチェック状態を返す
                return element.checked;
            }
            // その他のinput要素の場合は値を返す
            return element.value;
        } else if (element instanceof HTMLSelectElement) {
            // select要素の場合は選択値を返す
            return element.value;
        } else if (element instanceof HTMLTextAreaElement) {
            // textarea要素の場合は入力値を返す
            return element.value;
        }
        
        // その他の要素の場合はテキストコンテンツを返す
        return element.textContent || '';
    }

    /**
     * 要素に値を設定
     * 要素の種類に応じて適切な方法で値を設定
     * @param element HTML要素
     * @param value 設定する値
     */
    static setValue(element: HTMLElement, value: any): void {
        if (element instanceof HTMLInputElement) {
            // input要素の場合
            if (element.type === 'checkbox' || element.type === 'radio') {
                // チェックボックス・ラジオボタンの場合はチェック状態を設定
                element.checked = Boolean(value);
            } else {
                // その他のinput要素の場合は値を文字列として設定
                element.value = String(value);
            }
        } else if (element instanceof HTMLSelectElement) {
            // select要素の場合は選択値を設定
            element.value = String(value);
        } else if (element instanceof HTMLTextAreaElement) {
            // textarea要素の場合は入力値を設定
            element.value = String(value);
        } else {
            // その他の要素の場合はテキストコンテンツを設定
            element.textContent = String(value);
        }
    }

    // ================================================================================================
    // イベント管理メソッド群
    // ================================================================================================

    /**
     * イベントリスナーを安全に追加
     * 削除用の関数を返すことでメモリリークを防ぐ
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
        // イベントリスナーを追加
        element.addEventListener(event, handler, options);
        
        // リスナーを削除する関数を返す（クリーンアップ用）
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }

    /**
     * 複数のイベントリスナーを追加
     * 同一のハンドラーを複数のイベントに設定
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
        // 各イベントにリスナーを追加し、削除関数を保存
        const removers = events.map(event => 
            this.addEventListener(element, event, handler, options)
        );
        
        // 全てのリスナーを削除する関数を返す
        return () => {
            removers.forEach(remover => remover());
        };
    }

    // ================================================================================================
    // 要素状態チェックメソッド群
    // ================================================================================================

    /**
     * 要素が表示されているかチェック
     * CSSの表示状態を総合的に判定
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
        
        // サイズチェック（幅または高さが0の場合は非表示とみなす）
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        
        return true;
    }

    /**
     * 要素が無効化されているかチェック
     * disabled属性やaria-disabled属性を確認
     * @param element 要素
     * @returns 無効化されている場合true
     */
    static isDisabled(element: HTMLElement): boolean {
        // disabled属性を持つ要素の場合
        if ('disabled' in element) {
            return (element as HTMLInputElement).disabled;
        }
        
        // aria-disabled属性をチェック
        return element.getAttribute('aria-disabled') === 'true';
    }

    /**
     * 要素をフォーカス
     * 安全にフォーカスを設定（focus関数が存在しない場合の対応）
     * @param element 要素
     * @param options オプション
     */
    static focus(element: HTMLElement, options?: FocusOptions): void {
        // focus関数が存在する場合のみ実行
        if (element && typeof element.focus === 'function') {
            element.focus(options);
        }
    }

    // ================================================================================================
    // DOM操作メソッド群
    // ================================================================================================

    /**
     * 要素の最も近い親要素を取得
     * closest関数の安全なラッパー
     * @param element 要素
     * @param selector セレクター
     * @returns 親要素またはnull
     */
    static closest<T extends HTMLElement = HTMLElement>(
        element: Element,
        selector: string
    ): T | null {
        try {
            // closest関数を使って最も近い親要素を検索
            return element.closest<T>(selector);
        } catch (error) {
            // 不正なセレクターの場合はエラーログを出力してnullを返す
            console.error(`Invalid selector: ${selector}`, error);
            return null;
        }
    }

    /**
     * 要素が特定の要素の子孫かチェック
     * 親子関係の確認
     * @param parent 親要素
     * @param element 要素
     * @returns 子孫の場合true
     */
    static contains(parent: Element, element: Element): boolean {
        return parent.contains(element);
    }

    // ================================================================================================
    // 属性操作メソッド群
    // ================================================================================================

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
     * dataset APIを使用した安全なdata属性アクセス
     * @param element 要素
     * @param key キー（data-を除く）
     * @returns 値またはundefined
     */
    static getDataAttribute(element: HTMLElement, key: string): string | undefined {
        return element.dataset[key];
    }

    /**
     * data属性を設定
     * dataset APIを使用した安全なdata属性設定
     * @param element 要素
     * @param key キー（data-を除く）
     * @param value 値
     */
    static setDataAttribute(element: HTMLElement, key: string, value: string): void {
        element.dataset[key] = value;
    }

    // ================================================================================================
    // クラス操作メソッド群
    // ================================================================================================

    /**
     * クラスを安全に追加
     * 複数のクラス名を一度に追加可能
     * @param element 要素
     * @param className クラス名（複数可）
     */
    static addClass(element: Element, ...className: string[]): void {
        element.classList.add(...className);
    }

    /**
     * クラスを安全に削除
     * 複数のクラス名を一度に削除可能
     * @param element 要素
     * @param className クラス名（複数可）
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

    // ================================================================================================
    // 要素作成・操作メソッド群
    // ================================================================================================

    /**
     * 要素を作成
     * オプションで属性やコンテンツを一括設定
     * @param tagName タグ名
     * @param options オプション
     * @returns 作成された要素
     */
    static createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options?: {
            id?: string;                        // ID属性
            className?: string;                 // class属性
            attributes?: Record<string, string>; // その他の属性
            text?: string;                      // テキストコンテンツ
            html?: string;                      // HTMLコンテンツ
        }
    ): HTMLElementTagNameMap[K] {
        // 要素を作成
        const element = document.createElement(tagName);
        
        if (options) {
            // IDを設定
            if (options.id) element.id = options.id;
            // クラス名を設定
            if (options.className) element.className = options.className;
            // 属性を設定
            if (options.attributes) {
                Object.entries(options.attributes).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });
            }
            // テキストコンテンツを設定
            if (options.text) element.textContent = options.text;
            // HTMLコンテンツを設定
            if (options.html) element.innerHTML = options.html;
        }
        
        return element;
    }

    /**
     * 要素をスムーズにスクロール
     * 現代的なスクロール機能を提供
     * @param element 要素
     * @param options オプション
     */
    static scrollIntoView(element: Element, options?: ScrollIntoViewOptions): void {
        // デフォルトオプションでスムーズスクロール
        element.scrollIntoView(options ?? { behavior: 'smooth', block: 'center' });
    }

    // ================================================================================================
    // フォーム関連メソッド群
    // ================================================================================================

    /**
     * フォームの全てのフィールドを取得
     * フォーム内の入力可能な要素を配列で返す
     * @param form フォーム要素
     * @returns フィールドの配列
     */
    static getFormFields(form: HTMLFormElement): HTMLElement[] {
        const fields: HTMLElement[] = [];
        const elements = form.elements;
        
        // HTMLFormControlsCollectionを走査
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            // 入力要素のみを配列に追加
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
     * 選択されたチェックボックスの値を配列で返す
     * @param container コンテナ要素
     * @returns 選択された値の配列
     */
    static getCheckboxGroupValue(container: Element): string[] {
        // 選択されたチェックボックスを取得
        const checkboxes = this.querySelectorAll<HTMLInputElement>(
            'input[type="checkbox"]:checked',
            container
        );
        // 値の配列を返す
        return checkboxes.map(checkbox => checkbox.value);
    }

    /**
     * ラジオボタングループの値を取得
     * 選択されたラジオボタンの値を返す
     * @param container コンテナ要素
     * @returns 選択された値
     */
    static getRadioGroupValue(container: Element): string | null {
        // 選択されたラジオボタンを取得
        const radio = this.querySelector<HTMLInputElement>(
            'input[type="radio"]:checked',
            container
        );
        // 値を返す（選択されていない場合はnull）
        return radio ? radio.value : null;
    }
}
