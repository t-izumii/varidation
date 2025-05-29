/**
 * デバウンス処理を管理するクラス
 */
export class Debouncer {
    private timeouts: Map<string, NodeJS.Timeout> = new Map();
    private defaultDelay: number;

    /**
     * コンストラクタ
     * @param defaultDelay デフォルトの遅延時間（ミリ秒）
     */
    constructor(defaultDelay: number = 300) {
        this.defaultDelay = defaultDelay;
    }

    /**
     * デバウンス処理を実行
     * @param key 識別キー
     * @param fn 実行する関数
     * @param delay 遅延時間（ミリ秒）
     */
    debounce(key: string, fn: Function, delay?: number): void {
        // 既存のタイマーをキャンセル
        this.cancel(key);

        // 新しいタイマーを設定
        const timeout = setTimeout(() => {
            fn();
            this.timeouts.delete(key);
        }, delay ?? this.defaultDelay);

        this.timeouts.set(key, timeout);
    }

    /**
     * デバウンス処理をPromiseで実行
     * @param key 識別キー
     * @param fn 実行する関数
     * @param delay 遅延時間（ミリ秒）
     * @returns Promise
     */
    async debounceAsync<T>(key: string, fn: () => T | Promise<T>, delay?: number): Promise<T> {
        return new Promise((resolve, reject) => {
            this.debounce(key, async () => {
                try {
                    const result = await fn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    }

    /**
     * 特定のデバウンス処理をキャンセル
     * @param key 識別キー
     */
    cancel(key: string): void {
        const timeout = this.timeouts.get(key);
        if (timeout) {
            clearTimeout(timeout);
            this.timeouts.delete(key);
        }
    }

    /**
     * 全てのデバウンス処理をキャンセル
     */
    cancelAll(): void {
        for (const timeout of this.timeouts.values()) {
            clearTimeout(timeout);
        }
        this.timeouts.clear();
    }

    /**
     * 実行中のデバウンス処理があるかチェック
     * @param key 識別キー
     * @returns 実行中の場合true
     */
    isPending(key: string): boolean {
        return this.timeouts.has(key);
    }

    /**
     * 実行中のデバウンス処理の数を取得
     * @returns 実行中の処理数
     */
    getPendingCount(): number {
        return this.timeouts.size;
    }
}

/**
 * 関数にデバウンスを適用するデコレーター
 * @param delay 遅延時間（ミリ秒）
 */
export function debounce(delay: number = 300) {
    const debouncer = new Debouncer(delay);
    
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
            const key = `${target.constructor.name}.${propertyKey}`;
            return debouncer.debounceAsync(key, () => originalMethod.apply(this, args), delay);
        };
        
        return descriptor;
    };
}
