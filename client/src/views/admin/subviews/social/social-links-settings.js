import React, {useContext, useEffect, useState} from 'react';
import AdminSidebar from "components/sidebar/admin-sidebar";
import {Button, Col, OverlayTrigger, Tooltip} from "react-bootstrap";
import axios from "axios";
import {toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import {Link} from "react-router-dom";
import {popupSwal} from "components/util/sweetalert-utils";
import DeleteButton from "components/util/delete-button";
import ViewBox from "components/viewbox/view-box";
import SafeAnchor from "components/app/safe-anchor";
import ComponentLoader from "components/app/component-loader";
import BoardContext from "context/board-context";
import {FaExclamation} from "react-icons/all";
import {SvgNotice} from "components/app/svg-notice";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";

const SocialLinksSettings = ({reRouteTo}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const [socialLinks, setSocialLinks] = useState({data: [], loaded: false, error: false});
    const getQuota = () => 4 - socialLinks.data.length;
    useEffect(() => {
        axios.get("/boards/" + boardData.discriminator + "/socialLinks").then(res => {
            if (res.status !== 200) {
                setSocialLinks({...socialLinks, error: true});
                return;
            }
            setSocialLinks({...socialLinks, data: res.data, loaded: true});
        }).catch(() => setSocialLinks({...socialLinks, error: true}));
        // eslint-disable-next-line
    }, []);

    const renderSocialLinks = () => {
        if (socialLinks.data.length === 0) {
            return <SvgNotice Component={UndrawNoData} title="No social links yet." description="How about creating one?"/>
        }
        return socialLinks.data.map((link) => {
            return <div className="d-inline-flex justify-content-center mr-2" key={link.id}>
                <div className="text-center" id="socialPreviewContainer">
                    <img className="bg-dark rounded p-2" alt="Logo" src={link.logoUrl} height={40} width={40}/>
                    <DeleteButton tooltipName="Delete" onClick={() => onSocialLinkDelete(link.id)}
                                  id={"social-" + link.id + "-del"}/>
                    <br/>
                    <SafeAnchor url={link.url}>{extractHostname(link.url)}</SafeAnchor>
                </div>
            </div>
        })
    };
    const renderContent = () => {
        if (socialLinks.error) {
            return <span className="text-danger">Failed to obtain social links data</span>
        }
        return <ComponentLoader loaded={socialLinks.loaded} component={
            <Col xs={12}>
                <div className="text-black-60 mb-1">Current Social Links ({getQuota()} left)</div>
                {renderSocialLinks()}
                <div>
                    {renderAddButton()}
                </div>
            </Col>
        }/>
    };
    const renderAddButton = () => {
        if (getQuota() <= 0) {
            return <OverlayTrigger overlay={<Tooltip id="quota-tooltip">Quota Limit Reached</Tooltip>}>
                <Button className="m-0 mt-3 float-right" variant="" style={{backgroundColor: context.getTheme()}}><FaExclamation/> Add New</Button>
            </OverlayTrigger>
        }
        return <Button className="m-0 mt-3 float-right" variant=""
                       style={{backgroundColor: context.getTheme()}}
                       as={Link} to={"/ba/" + boardData.discriminator + "/social/create"}>Add New</Button>
    };
    const extractHostname = (url) => {
        let hostname;
        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        } else {
            hostname = url.split('/')[0];
        }
        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        return hostname.replace("www.", "");
    };
    const onSocialLinkDelete = (id) => {
        popupSwal("question", "Are you sure?", "Social link will be deleted.",
            "Delete", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/socialLinks/" + id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = socialLinks.data.filter(item => item.id !== id);
                    setSocialLinks({...socialLinks, data});
                    toastSuccess("Social link deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    return <React.Fragment>
        <AdminSidebar currentNode="social" reRouteTo={reRouteTo} data={boardData}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme()} title="Social Links" description="Edit links visible at your board page here.">
                {renderContent()}
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default SocialLinksSettings;