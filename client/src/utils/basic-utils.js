import Cookies from "js-cookie";
import tinycolor from "tinycolor2";
import {getEnvVar} from "utils/env-vars";
import Snackbar from "utils/snackbar";

export const scrollIntoView = (id, pop = true) => {
    //kudos to https://stackoverflow.com/a/22480938/10156191
    const element = document.getElementById(id);
    let rect = element.getBoundingClientRect();

    // Only completely visible elements return true:
    let isVisible = (rect.top >= 0) && (rect.bottom <= window.innerHeight);

    if (!isVisible) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
    return new Promise(resolve => setTimeout(function () {
        if(pop) {
            element.classList.add("upvote-animation");
        }
        resolve();
    }, 200));
}

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
    let color;
    if(document.body.classList.contains("dark")) {
        color = tinycolor("hsl(48, 100%, 50%)");
    } else {
        color = tinycolor("hsl(20, 99%, 40%)");
    }
    popup(content, color, {showAction: false, duration: 6000});
};

export const popupError = (content = "Something unexpected happened") => {
    let color;
    if(document.body.classList.contains("dark")) {
        color = tinycolor("hsl(2, 95%, 66%)");
    } else {
        color = tinycolor("hsl(355, 67%, 48%)");
    }
    popup(content, color, {showAction: false, duration: 8000});
};

const popup = (content, theme, data) => {
    Snackbar.show({
        text: content,
        textColor: theme.toString(),
        backgroundColor: "var(--secondary)",
        pos: "bottom-center",
        customStyle: {border: "1px dashed " + theme.setAlpha(.2).toRgbString()},
        ...data
    });
};

export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + "...";
};

export const prepareFilterAndSortRequests = (preferences, query) => {
    let search = "";
    if (preferences.sort != null) {
        search += "&sort=" + preferences.sort;
    }
    if (preferences.filter != null) {
        if(preferences.filter === "advanced" && preferences.advanced) {
            const advanced = preferences.advanced;
            search += "&filter=";
            advanced.text && (search += "text:" + advanced.text + ";");
            if(advanced.tags && advanced.tags.length > 0) {
                search += "tags:" + advanced.tags.map(t => t + ",");
                //remove trailing , character
                search = search.replace(/,\s*$/, "");
                search += ";";
            }
            advanced.status && (search += "status:" + advanced.status + ";");
            advanced.voters && (search += "voters:" + Object.keys(advanced.voters)[0].toUpperCase() + "," + Object.values(advanced.voters)[0]);

            //remove trailing ; character
            search = search.replace(/;\s*$/, "");
        } else {
            search += "&filter=" + preferences.filter;
        }
    }
    if(query && query !== "") {
        //advanced filters override query search
        if(preferences.filter != null && preferences.filter !== "advanced") {
            search += ";text:" + query;
        } else {
            search += "&filter=text:" + query;
        }
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

export const prettifyTrigger = (category, trigger) => {
    //remove unnecessary 'Integration' word
    let placeholder = trigger.replace("INTEGRATION_", "");
    //truncate 'Board' word for moderator and suspension only related triggers
    if(category === "moderator" || category === "suspendedUser") {
        placeholder = placeholder.replace("BOARD_", "");
    }
    return prettifyEnum(placeholder);
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

export const htmlDecodeEntities = (input) => {
    let element = document.createElement('div');
    // strip script/html tags
    input = input.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
    input = input.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
    element.innerHTML = input;
    input = element.textContent;
    element.textContent = '';
    return input;
}

export const isServiceAdmin = (context) => {
    let isAdmin = false;
    context.serviceData.serviceAdmins.forEach(admin => {
        if (admin.id === context.user.data.id) {
            isAdmin = true;
        }
    });
    return isAdmin;
};

export const hideMail = (mail) => {
    let data = mail.split("@");
    if(data.length === 0) {
        return mail;
    }
    let mailUsername = data[0];
    let first = mailUsername.charAt(0);
    let last = mailUsername.charAt(mailUsername.length - 1);
    return first + "*****" + last + "@" + data[1];
}