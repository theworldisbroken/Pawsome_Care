import React, { useEffect } from 'react';
import { bindActionCreators } from "redux";
import { connect } from 'react-redux'
import { Link, useParams } from "react-router-dom";

import * as authenticationService from "./state/AuthenticationService";
// https://www.iconfinder.com/icons/1930264/check_complete_done_green_success_valid_icon
import success_pic from '../../../layout/images/verification_Success.png'
// https://www.freepik.com/icon/failed_4436559
import failed_pic from '../../../layout/images/verification_Failed.png'

import "../../../layout/style/verification.css"


const VerificationLink = (props) => {

    const { verifyLink, verification_Success, error } = props;
    const { linkEnding } = useParams()

    useEffect(() => {
        const timeout = setTimeout(() => {
            verifyLink(linkEnding);
        }, 0);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className='verification-body'>
            <div className='verification-wrapper'>
                {verification_Success && <img className='verifcation_success_img' alt='Verifcation Succcess' src={success_pic} />}
                {verification_Success && <p>Ihre E-Mail wurde erfolgreich bestätigt!</p>}
                {error && <img className='verifcation_error_img' alt='Verifcation Error' src={failed_pic} />}
                {error && <p>Der Link is Ungültig!</p>}
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        verification_Success: state.authenticationReducer.verification_Success,
        error: state.authenticationReducer.error
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    verifyLink: authenticationService.verifyLink
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(VerificationLink);