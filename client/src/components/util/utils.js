import {Slide, toast} from "react-toastify";
import React from "react";
import {FaCheck, FaExclamation, FaExclamationTriangle} from "react-icons/fa";
import Spinner from "react-bootstrap/Spinner";
import {parseEmojis} from "components/util/emoji-filter";
import marked from "marked";

// base color, +15% lightness color
const themeColors = [
    ["#202428", "#3d444c"], //failed, 14.86 AAA | 9.38 AAA vs white
    ["#2d3436", "#495457"], //failed, 12.07 AAA | 7.43 AAA vs white
    ["#2c3e50", "#405a75"], //failed, 10.45 AAA | 6.8 AAA+ vs white
    ["#d35400" /* 3.54 AA+ upvote,  2.39 fail 70% opacity*/, "#fe6600" /* 4.99 AAA+ upvote, 3.04 AA+ 70% opacity */], //3.97 AA+ | 2.81 Fail vs white
    ["#e74c3c" /* 2.47 AA+ upvote, 2.47 Fail 70% opacity */, "#ea6659" /* 4.59 AAA+ upvote, 2.86 Fail 70% opacity */], //3.64 AA+ | 3.05 AA+ vs white
    //suggestion ^ #eb6f63 (+ 20%) 4.9 AAA+ upvote, 3.12 AA+ 70% opacity | 3.01 AA+ vs white
    ["#e67e22" /* 5.18 AAA+ upvote, 3.17 AA+ 70% opacity */, "#e99143" /* 6.03 AAA+ upvote, 3.6 AA+ 70% opacity */], //2.71 Fail | 2.32 Fail vs white
    ["#8e44ad" /* 2.51 Fail upvote, 1.79 Fail 70% opacity */, "#a15abe" /* 3.31 AA+ upvote, 2.31 Fail 70% opacity */], //5.58 AAA+ | 4.23 AA+ vs white
    //suggestion ^ #bc8bd1 (+ 40%) 5.44 AAA+ upvote, 3.45 AA+ 70% opacity | 2.55 Fail vs white
    ["#2980b9" /* 3.43 AA+ upvote, 2.31 Fail 70% opacity */, "#3996d3" /* 4.55 AAA+ upvote, 2.86 Fail 70% opacity */], //4.09 AA+ | 3.09 AA+ vs white
    //suggestion ^ #459cd5 (+ 20%) 4.89 AAA+ upvote, 3.16 AA+ 70% opacity
    ["#3498db" /* 4.68 AAA+ upvote, 2.94 Fail 70% opacity */, "#52a7e0" /* 5.59 AAA+ upvote, 3.39 AA+ 70% opacity */], //3 AA+ | 2.51 Fail vs white
    //suggestion ^ #3c9cdc 4.9 AAA+ upvote, 3.15 AA+ 70% opacity | 3.01 AA+ vs white
    ["#f39c12" /* 6.72 AAA+ upvote, 4.08 AA+ 70% opacity */, "#f4aa35" /* 7.48 AAA upvote, 4.43 AA+ 70% opacity */], //2.09 Fail | 1.88 Fail vs white
    ["#f1c40f" /* 8.88 AAA upvote, 5.15 AAA+ 70% opacity */, "#f3cc32" /* 8.17 AAA upvote, 5.44 AAA+ 70% opacity */], //1.58 Fail | 1.48 Fail vs white
    ["#27ae60" /* 5.13 AAA+ upvote, 3.24 AA+ 70% opacity */, "#30d074" /* 7.3 AAA upvote, 4.33 AA+ 70% opacity */], //2.73 Fail | 1.92 Fail vs white
    ["#2ecc71" /* 7.01 AAA upvote, 4.17 AA+ 70% opacity */, "#4ad685" /* 7.9 AAA upvote,  4.63 AAA+ 70% opacity */], //2 Fail | 1.78 Fail vs white
    ["#16a085" /* 4.49 AA+ upvote, 2.9 Fail 70% opacity */, "#1bcba8" /* 7.13 AAA upvote, 4.21 AA+ 70% opacity */], //3.12 AA+ | 1.97 Fail vs white
    ["#1abc9c" /* 6.12 AAA+ upvote, 3.74 AA+ 70% opacity */, "#21e0ba" /* 6.46 AAA+ upvote, 5.02 AAA+ 70% opacity */], //2.29 Fail | 1.61 Fail vs white
    ["#95a5a6" /* 5.76 AAA+ upvote, 3.62 AA+ 70% opacity */, "#a4b2b3" /* 6.74 AAA+ upvote, 4.11 AA+ 70% opacity */] //2.56 Fail | 2.19 Fail vs white
];

export const parseMarkdown = (html) => {
    return parseEmojis(marked(html, {breaks: true}));
};

export const getSizedAvatarByUrl = (url, sizing) => {
    if (url.includes("googleusercontent")) {
        return url + "=h" + sizing;
    } else /* for discord and github */ {
        return url + "?size=" + sizing;
    }
};

export const popupToast = (content, type, toastId) => {
    if (toastId == null) {
        return toast(content, {
            type: type,
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            pauseOnFocusLoss: false,
            draggable: true,
            transition: Slide,
            className: "toast-style " + type,
        });
    } else {
        toast.update(toastId, {
            render: content,
            type: type,
            className: "toast-style " + type,
        })
    }
};

export const toastError = (message = "Failed to connect to the server!", toastId) => {
    const Error = () => (
        <div>
            <FaExclamationTriangle className="mx-2" style={{color: "#e43e3e"}}/> {message}
        </div>
    );
    return popupToast(<Error/>, "error", toastId);
};

export const toastWarning = (message = "Well, that was unexpected...", toastId) => {
    const Warning = () => (
        <div>
            <FaExclamation className="mx-2" style={{color: "#ffe008"}}/> {message}
        </div>
    );
    return popupToast(<Warning/>, "warning", toastId);
};

export const toastSuccess = (message = "Action sucessfully executed!", toastId) => {
    const Success = () => (
        <div>
            <FaCheck className="mx-2" style={{color: "#3ec569"}}/> {message}
        </div>
    );
    return popupToast(<Success/>, "success", toastId);
};

export const toastAwait = (message = "Awaiting action...", toastId) => {
    const Await = () => (
        <div>
            <Spinner animation="border" size="sm" variant="" className="mx-2" style={{color: "#0994f6"}}/> {message}
        </div>
    );
    return popupToast(<Await/>, "await", toastId);
};

export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + "...";
};

export const formatUsername = (userId, userName, moderators = []) => {
    const user = moderators.find(mod => mod.userId === userId);
    if (user == null) {
        return userName;
    }
    switch (user.role.toLowerCase()) {
        case "owner":
        case "admin":
            return <span className="board-role admin">{userName}</span>;
        case "moderator":
            return <span className="board-role moderator">{userName}</span>;
        case "user":
        default:
            return userName;
    }
};

export const prepareFilterAndSortRequests = (searchPreferences) => {
    let search = "";
    if (searchPreferences.sort != null) {
        search += "&sort=" + searchPreferences.sort;
    }
    if (searchPreferences.filter != null) {
        search += "&filter=" + searchPreferences.filter;
    }
    return search;
};

export const getBase64FromFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

export const validateImageWithWarning = (e, elementInputId, size) => {
    const input = document.getElementById(elementInputId);
    let file = e.target.files[0];
    let mimeTypes = ['image/jpeg', 'image/png'];

    if (mimeTypes.indexOf(file.type) === -1) {
        toastWarning("Only JPEG and PNG files are allowed.");
        input.value = "";
        return false;
    }

    if (file.size > (size / 1000) * 1024 * 1024) {
        toastWarning("Maximum file size is " + size + " kb.");
        input.value = "";
        return false;
    }
    return true;
};

export const formatRemainingCharacters = (remainingId, textareaId, limit) => {
    const element = document.getElementById(remainingId);
    const textarea = document.getElementById(textareaId);
    element.innerText = limit - textarea.value.length + " Remaining";
};

export const prettifyEnum = (text) => {
    let newText = "";
    let splitted = text.toLowerCase().split("_");
    for (let i = 0; i < splitted.length; i++) {
        let char = splitted[i].charAt(0);
        newText += char.toUpperCase() + splitted[i].slice(1) + " ";
    }
    return newText;
};

export const htmlDecode = (input) => {
    return input.replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
};

export const isServiceAdmin = (context) => {
    let isAdmin = false;
    context.serviceData.serviceAdmins.forEach(admin => {
        if (admin.id === context.user.data.id) {
            isAdmin = true;
        }
    });
    return isAdmin;
};