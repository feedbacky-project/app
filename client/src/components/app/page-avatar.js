import React from "react";
import Image from "react-bootstrap/Image";

export const PageAvatar = ({rounded = false, circle = false, className = "", url, size, style = {}}) => {
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
    return <Image roundedCircle={circle} rounded={rounded} alt="Avatar" className={className} style={style}
                  src={getSizedAvatarByUrl(url, getNearestAvatarSize(size))} width={size} height={size}
                  onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}/>
};