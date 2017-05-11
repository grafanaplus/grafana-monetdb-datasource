export class QueryEditorError extends Error {
    name = 'QueryEditorError';
    message = 'Default message';
    stack = (new Error()).stack;
    constructor(msg?) {
        super();
        if (msg) {
            this.message = msg;
        }
    }
}
