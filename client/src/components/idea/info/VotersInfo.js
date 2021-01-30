import AppContext from "context/AppContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext} from "react";
import {FaFrown} from "react-icons/all";
import styled from "@emotion/styled";
import {UiLoadingSpinner, UiTooltip} from "ui";
import {UiAvatar} from "ui/image";

const MoreVotersText = styled.span`
  letter-spacing: -.3pt;
  margin-left: 10px;
  font-size: 13px;
  display: inline;
`;

const LoadingVoter = styled(UiLoadingSpinner)`
  margin: 0 -12px 0 0;
  transition: .2s ease-in-out;
  vertical-align: text-bottom;
`;

const Voter = styled(UiAvatar)`
  margin: 0 -12px 0 0;
  border: 2px solid hsl(210, 17%, 98%);
  transition: .2s ease-in-out;
  .dark & {
    border: 2px solid var(--dark-background);
  }
  &:hover {
    margin: 0 -5px 0 0;
  }
`;

const VotersInfo = ({data}) => {
    const {getTheme} = useContext(AppContext);
    const {votersAmount} = useContext(IdeaContext).ideaData;
    const renderVoters = () => {
        if (!data.loaded) {
            const voters = votersAmount > 5 ? 5 : votersAmount;
            let spinners = [];
            for (let i = 0; i < voters; i++) {
                spinners.push(<LoadingVoter key={i} customSize={23} color={getTheme()} style={{color: getTheme()}}/>);
            }
            if (votersAmount <= 5) {
                return <React.Fragment>{spinners}</React.Fragment>
            }
            return <React.Fragment>
                {spinners}
                {renderAndMore(votersAmount)}
            </React.Fragment>
        }
        if (data.error) {
            return <div className={"text-danger"}><FaFrown className={"move-top-2px"}/> Failed to load</div>
        }
        if (data.data.length === 0) {
            return <div style={{height: 25}}><FaFrown className={"move-top-2px"}/> None</div>
        }
        return <div>
            {data.data.slice(0, 5).map(dataUser => {
                return <UiTooltip key={dataUser.id} id={"voter" + dataUser.id} text={dataUser.username}>
                    <span><Voter roundedCircle user={dataUser} size={25}/></span>
                </UiTooltip>
            })}
            {renderAndMore(data.data.length)}
        </div>
    };

    const renderAndMore = (amount) => {
        if (amount <= 5) {
            return;
        }
        return <MoreVotersText> + {amount - 5} more</MoreVotersText>
    };
    return <React.Fragment>
        <div className={"mt-4 text-black-75"}>Voters ({votersAmount} votes)</div>
        {renderVoters()}
    </React.Fragment>
};

export default VotersInfo;