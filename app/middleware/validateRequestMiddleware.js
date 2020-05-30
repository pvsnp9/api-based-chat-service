import { IPs } from '../config/ipWhitelist';
import _ from 'lodash';

module.exports = function validateRequest(req, res, next) {
    let reqIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    IPs.includes(reqIp) ? next() : res.status(404).json({status:'fail', message:'Invalid Request'});
}