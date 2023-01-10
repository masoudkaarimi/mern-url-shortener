module.exports = {
    const: {
        regex           : {
            username: /^[a-z0-9_-]{3,15}$/gm,
            mobile  : /(\+98|0|98|0098)?([ ]|-|[()]){0,2}9[0-9]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}/gm,
            // mobile: /^([0-9]{11})$/gm
            email: /^[\w_.]+@([\w_]+\.)+[\w_]{2,4}$/gm,
            url  : /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gm,
            slug : /^[a-z0-9]+(?:-[a-z0-9]+)*$/gm,
            ip   : /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/gm,
            port : /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/gm
        },
        short_url_length: 4
        // error: {
        //     code: {
        //         DUPLICATE_EMAIL    : -1,
        //         DUPLICATE_PHONE    : -2,
        //         NOT_EXISTS_USERNAME: -3,
        //         INVALID_TOKEN      : -4,
        //         INVALID_DATA       : -5
        //     }
        // }
    }
};
