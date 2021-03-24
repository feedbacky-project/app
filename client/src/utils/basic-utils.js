import Cookies from "js-cookie";
import Snackbar from "node-snackbar";
import tinycolor from "tinycolor2";
import {getEnvVar} from "utils/env-vars";

export const getDefaultAvatar = (username) => {
    const avatar = getEnvVar("REACT_APP_DEFAULT_USER_AVATAR");
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

export const popupRevertableNotification = (content, color, onUndo) => {
    popup(content, color, {showAction: true, actionText: "Undo", onActionClick: onUndo, actionTextColor: "#fff"});
};

export const hideNotifications = () => {
    popup("", tinycolor("#d35400"), {duration: 1});
};

export const popupNotification = (content, color) => {
    popup(content, color, {showAction: false});
};

export const popupWarning = (content = "Something unexpected happened") => {
    popup(content, tinycolor("#d35400"), {showAction: false, duration: 6000});
};

export const popupError = (content = "Something unexpected happened") => {
    popup(content, tinycolor("#e43e3e"), {showAction: false, duration: 8000});
};

const popup = (content, theme, data) => {
    Snackbar.show({
        text: content,
        backgroundColor: theme.toString(),
        pos: "bottom-center",
        ...data
    });
};

export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + "...";
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
        popupWarning("Only JPEG and PNG files are allowed");
        input.value = "";
        return false;
    }

    if (file.size > (size / 1000) * 1024 * 1024) {
        popupWarning("Maximum file size is " + size + " kb");
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