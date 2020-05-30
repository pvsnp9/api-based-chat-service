"use strict";
import url from 'url';
import { APP_ID, APP_SECRET_KEY } from './Credentials';
import httpBuildQuery from 'http-build-query';
import crypto from 'crypto';

class Utils {
    constructor(){}

    //sort object by key
    static whiskySort(unordered, stringify = false){
        let ordered = {};
        Object.keys(unordered).sort().forEach(function(key) {
            ordered[key] = unordered[key];
        });
        return (stringify) ? JSON.stringify(ordered) : ordered;
    }
    //encode given string using base64 and return
    static base64Encode = (_string) => { 
        let buff = new Buffer(_string);  
        return buff.toString('base64');
    }
    
    //decode given string and return
    static base64Decode = (_string) => {
        let buff = new Buffer(_string, 'base64');  
        return buff.toString('ascii');
    }
}
export default new Utils;