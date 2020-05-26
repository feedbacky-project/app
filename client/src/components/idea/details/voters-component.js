import React, {useContext} from "react";
import Spinner from "react-bootstrap/Spinner";
import Image from "react-bootstrap/Image";
import {getSizedAvatarByUrl} from "components/util/utils";
import {FaFrown} from "react-icons/all";
import AppContext from "context/app-context";

const VotersComponent = ({votersAmount, data}) => {
    const context = useContext(AppContext);
    const renderVoters = () => {
        if (!data.loaded) {
            const voters = votersAmount > 5 ? 5 : votersAmount;
            let spinners = [];
            for (let i = 0; i < voters; i++) {
                spinners.push(<Spinner key={i} animation="grow" variant="" className="merged" style={{
                    verticalAlign: "text-bottom", margin: "0 -10px 0 0", width: 23, height: 23, color: context.getTheme()
                }}/>);
            }
            if (votersAmount <= 5) {
                return <React.Fragment>{spinners}</React.Fragment>
            }
            return <React.Fragment>
                {spinners}
                <span className="d-inline-block text-tight" style={{
                    marginLeft: 10, fontSize: 13, transform: "translateY(-4px)"
                }}> + {votersAmount - 5} more</span>
            </React.Fragment>
        }
        if (data.error) {
            return <div className="text-danger"><FaFrown className="move-top-2px"/> Failed to load</div>
        }
        return <div>
            {data.data.slice(0, 5).map(data => {
                return <Image roundedCircle key={data.id} alt="avatar" className="merged"
                              src={getSizedAvatarByUrl(data.avatar, 32)} width={25} height={25}
                              onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}/>
            })}
            {renderAndMore()}
        </div>
    };

    const renderAndMore = () => {
        if (data.data.length <= 5) {
            return;
        }
        return <span className="d-inline text-tight" style={{
            marginLeft: 10,
            fontSize: 13
        }}> + {data.data.length - 5} more</span>
    };
    return <React.Fragment>
        <div className="mt-4 text-black-75">Voters ({votersAmount} votes)</div>
        {renderVoters()}
    </React.Fragment>
};

export default VotersComponent;