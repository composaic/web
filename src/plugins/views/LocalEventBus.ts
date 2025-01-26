import mitt, { Emitter, EventType, Handler } from 'mitt';

export class LocalEventBus {
    private emitter: Emitter<any>;

    constructor() {
        this.emitter = mitt();
    }

    on<T = any>(type: EventType, handler: Handler<T>) {
        this.emitter.on(type, handler);
    }

    off<T = any>(type: EventType, handler: Handler<T>) {
        this.emitter.off(type, handler);
    }

    emit<T = any>(type: EventType, event?: T) {
        this.emitter.emit(type, event);
    }
}
