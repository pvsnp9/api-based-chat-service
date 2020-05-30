"use strict";
import crypto from 'crypto';
import url from 'url';
import { APP_ID, APP_SECRET_KEY } from '../config/apiCredentials';
import Utils from './Utils';

class AppSignatureGenerator {
    constructor(){}

    generateSignature(_url, _params){
        let path = url.parse(_url).pathname;
        let params = Utils.whiskySort(_params);
        let queryString = path + '/?'+ httpBuildQuery(params);
        return crypto.createHmac('sha256', APP_SECRET_KEY).update(queryString).digest('hex');
    }

}

export default new AppSignatureGenerator;