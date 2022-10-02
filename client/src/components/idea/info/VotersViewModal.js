import styled from "@emotion/styled";
import React, {useContext} from "react";
import {FaUserSecret} from "react-icons/fa";
import {UiPrettyUsername, UiThemeContext, UiTooltip} from "ui";
import {UiCancelButton} from "ui/button";
import {UiFormLabel} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiDismissibleModal} from "ui/modal";

const AnonymousIcon = styled(FaUserSecret)`
  margin-left: .25rem;
  cursor: pointer;
  transform: translateY(-2px);
  color: ${props => props.theme};
`;

const VotersViewModal = ({votersData, isOpen, onHide}) => {
    const {getTheme} = useContext(UiThemeContext);
    const anonymousVoters = votersData.filter(u => u.fake).length;

    const footer = <UiCancelButton className={"m-0 mr-1"} onClick={onHide}>Close</UiCancelButton>;
    return <UiDismissibleModal id={"votersView"} size={"md"} isOpen={isOpen} onHide={onHide} title={"Idea Voters"} applyButton={<React.Fragment/>} footer={footer}>
        <UiRow className={"mt-2 mb-1"}>
            <UiFormLabel className={"col-12"}>All Voters ({votersData.length - anonymousVoters} Registered, {anonymousVoters} Anonymous)</UiFormLabel>
            {votersData.map(voter => {
                return <UiCol key={voter.id} xs={6} className={"text-truncate"}>
                    <UiAvatar size={16} user={voter} roundedCircle className={"mr-1"}/>
                    <UiPrettyUsername user={voter} truncate={20}/>
                    {voter.fake && <UiTooltip id={voter.id + "_voter"} text={"Anonymous Voter"}>
                        <AnonymousIcon theme={getTheme().toString()}/>
                    </UiTooltip>}
                </UiCol>
            })}

        </UiRow>
    </UiDismissibleModal>
};

export default VotersViewModal;