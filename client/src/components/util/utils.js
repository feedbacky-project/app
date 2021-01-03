import {Slide, toast} from "react-toastify";
import React from "react";
import {FaCheck, FaExclamation, FaExclamationTriangle} from "react-icons/fa";
import Spinner from "react-bootstrap/Spinner";
import {parseEmojis} from "components/util/emoji-filter";
import marked from "marked";
import Cookies from "js-cookie";
import {FaBan} from "react-icons/all";

export const getDefaultAvatar = (username) => {
    const avatar = process.env.REACT_APP_DEFAULT_USER_AVATAR;
    return avatar.replace("%nick%", username);
};

export const getCookieOrDefault = (name, defaultValue) => {
    const cookie = Cookies.get(name);
    if (cookie == null) {
        return defaultValue;
    }
    return cookie;
};

export const convertIdeaToSlug = (ideaData) => {
    let slug = ideaData.title.toLowerCase();
    /* replace non alphanumeric characters with dash, replace repeated dashes with one dash
    and replace dash if slug starts or ends with it */
    slug = slug.replace(/[\W_]/g, '-')
        .replace(/(\W)\1+/g, '-')
        .replace(/^(-)/, "")
        .replace(/(-)$/, "");
    return slug + "." + ideaData.id;
};

export const parseMarkdown = (html) => {
    return parseEmojis(marked(html, {breaks: true}));
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
            closeButton: false,
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

export const formatUsername = (userId, userName, moderators = [], suspended = []) => {
    const isSuspended = suspended.find(suspended => suspended.user.id === userId);
    if (isSuspended) {
        return <span className="board-role suspended"><FaBan className="fa-xs move-top-1px"/> {userName}</span>
    }
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

export const prepareFilterAndSortRequests = (preferences) => {
    let search = "";
    if (preferences.sort != null) {
        search += "&sort=" + preferences.sort;
    }
    if (preferences.filter != null) {
        search += "&filter=" + preferences.filter;
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