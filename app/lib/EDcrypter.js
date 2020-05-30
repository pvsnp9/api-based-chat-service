"use strict";
import crypto from 'crypto';

class EDcrypter { 
    constructor (){}

    static encrypt(_string){
        let cipher = crypto.createCipher('aes-256-cbc','whiskyone');
        let crypted = cipher.update(_string,'utf8', 'hex');
        crypted += cipher.final('hex');
        this.encrypted = crypted;
        return crypted;
    }

    static decrypt(_string) {
        let decipher = crypto.createDecipher('aes-256-cbc','whiskyone')
        let dec = decipher.update(_string,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }   
}
export default EDcrypter;