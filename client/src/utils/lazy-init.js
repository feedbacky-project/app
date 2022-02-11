import {popupError} from "utils/basic-utils";

export const retry = (fn, retriesLeft = 5, interval = 500) => {
    return new Promise((resolve, reject) => {
        fn()
            .then(resolve)
            .catch((error) => {
                setTimeout(() => {
                    if (retriesLeft === 1) {
                        reject(error);
                        popupError("Network error occurred, couldn't load data!");
                        return;
                    }

                    retry(fn, retriesLeft - 1, interval).then(resolve, reject);
                }, interval);
            })
    })
};