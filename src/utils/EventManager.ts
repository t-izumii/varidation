/**
 * イベント管理クラス
 * カスタムイベントの登録、削除、発火を管理
 */
export class EventManager {
    private listeners: Map<string, Function[]> = new Map();

    /**
     * イベントリスナーを登録
     */
    on(event: string, handler: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(handler);
    }

    /**
     * イベントリスナーを削除
     */
    off(event: string, handler: Function): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
            if (handlers.length === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * イベントを発火
     */
    emit(event: string, data?: any): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * 特定のイベントのリスナーをすべて削除
     */
    removeAllListeners(event?: string): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * イベントにリスナーが登録されているかチェック
     */
    hasListeners(event: string): boolean {
        const handlers = this.listeners.get(event);
        return handlers ? handlers.length > 0 : false;
    }

    /**
     * 登録されているイベント名の一覧を取得
     */
    getEventNames(): string[] {
        return Array.from(this.listeners.keys());
    }
}
