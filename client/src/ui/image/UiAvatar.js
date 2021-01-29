import React from "react";
import UiImage from "ui/image/UiImage";
import {getDefaultAvatar} from "utils/basic-utils";

const UiAvatar = ({user, roundedCircle, rounded, className, style, size}) => {
    const getSizedAvatarByUrl = (url, sizing) => {
        if (url.includes("googleusercontent")) {
            return url + "=h" + sizing;
        } else /* for discord and github */ {
            return url + "?size=" + sizing;
        }
    };
    const getNearestAvatarSize = (size) => {
        const sizes = [16, 32, 64, 128, 256];
        for (let i = size; i < 256; i++) {
            if (sizes.includes(i)) {
                return i;
            }
        }
        return 32;
    };
    let src;
    if (user == null) {
        src = getDefaultAvatar("Anonymous");
    } else {
        src = getSizedAvatarByUrl(user.avatar, getNearestAvatarSize(size));
    }
    return <UiImage alt={"Avatar"} className={className} style={style} rounded={rounded} roundedCircle={roundedCircle}
                    src={src} width={size} height={size}
                    onError={e => e.target.src = getDefaultAvatar(user.username)}/>
};

export default UiAvatar;