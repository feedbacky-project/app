import React from "react";
import Image from "react-bootstrap/Image";

export const PageAvatar = (props) => {
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
    return <Image roundedCircle={props.circle} rounded={props.rounded} alt="Avatar" className={props.className} style={props.style}
                  src={getSizedAvatarByUrl(props.url, getNearestAvatarSize(props.size))} width={props.size} height={props.size}
                  onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR} {...props}/>
};