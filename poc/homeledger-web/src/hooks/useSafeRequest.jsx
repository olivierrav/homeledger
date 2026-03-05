
function isAsync(fn) {
    return fn && fn.constructor && fn.constructor.name === "AsyncFunction";
}

function isPromiseLike(obj) {
    return (
        !!obj &&
        (typeof obj === "object" || typeof obj === "function") &&
        typeof obj.then === "function"
    );
}

export const useSafeRequest = () => {

    const safeRequest = async (fn, onError, onSuccess, onFinally) => {


        if (Array.isArray(fn)) {
            try {
                const results = [];
                for (let i = 0; i < fn.length; i++) {
                    try {
                        const result = isPromiseLike(fn[i])
                            ? await fn[i]
                            : isAsync(fn[i])
                                ? await fn[i]()
                                : fn[i]();
                        results.push(result);
                    } catch (error) {

                        if (onError)
                            return isPromiseLike(onError)
                                ? await onError
                                : isAsync(onError)
                                    ? await onError(error)
                                    : onError(error);
                        else results.push(undefined);
                    }
                }
                if (onSuccess)
                    return isPromiseLike(onSuccess)
                        ? await onSuccess
                        : isAsync(onSuccess)
                            ? await onSuccess(results)
                            : onSuccess(results);
                else return results;
            } finally {
                if (onFinally)
                    isPromiseLike(onFinally)
                        ? await onFinally
                        : isAsync(onFinally)
                            ? await onFinally()
                            : onFinally();
            }
        } else
            try {
                const result = isPromiseLike(fn) ? await fn : isAsync(fn) ? await fn() : fn();
                if (onSuccess)
                    isPromiseLike(onSuccess)
                        ? await onSuccess
                        : isAsync(onSuccess)
                            ? await onSuccess(result)
                            : onSuccess(result);

                return result;
            } catch (error) {
                if (onError)
                    isPromiseLike(onError)
                        ? await onError
                        : isAsync(onError)
                            ? await onError(error)
                            : onError(error);
                else throw error;
            } finally {
                if (onFinally)
                    isPromiseLike(onFinally)
                        ? await onFinally
                        : isAsync(onFinally)
                            ? await onFinally()
                            : onFinally();
            }
    };

    return safeRequest;
};
