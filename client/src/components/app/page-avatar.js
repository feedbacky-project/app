import React from "react";
import Image from "react-bootstrap/Image";
import {getDefaultAvatar} from "components/util/utils";

const PageAvatar = ({user, roundedCircle, rounded, className, style, size}) => {
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
    return <Image alt="Avatar" roundedCircle={roundedCircle} rounded={rounded} className={className} style={style}
                  src={src} width={size} height={size}
                  onError={(e) => e.target.src = getDefaultAvatar(user.username)}/>
};

export default PageAvatar;