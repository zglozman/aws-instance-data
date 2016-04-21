/**
 * Created by zeevglozman on 4/9/16.
 */
var async = require('async');
var request = require('request');
var uuid = require('node-uuid');

var LocalIp = require('@zglozman/luckyutils').LocalIp;
var PublicIp = require('@zglozman/luckyutils').PublicIp;

var config = require('../config/InstanceDataConfig.json');
var awsEndpoint = config.AwsMetaDataEndpoint;



/**
 * Constructor
 * @returns {InstanceData}
 * @constructor
 */
var InstanceData = function () {
    return this;
};

InstanceData.prototype.getAmazonData = function (finalCallback) {
    var data = {};
console.log('call amazon meta on',awsEndpoint);
    async.parallel([

        function (callback) {
            request(awsEndpoint + 'ami-id', function (err, resp, body) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (resp.statusCode == 200) {
                    data.amiid = body;
                    callback(null, body);
                }
            });
        },

        function (callback) {
            request(awsEndpoint + 'hostname', function (err, resp, body) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (resp.statusCode == 200) {
                    data.hostname = body;
                    callback(null, body);
                }

            });
        },

        function (callback) {
            request(awsEndpoint + 'instance-id', function (err, resp, body) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (resp.statusCode == 200) {
                    data.instanceid = body;
                    callback(null, body);
                }
            });
        },

        function (callback) {
            request(awsEndpoint + 'local-hostname', function (err, resp, body) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (resp.statusCode == 200) {
                    data.localhostname = body;
                    callback(null, body);
                }
            });
        },

        function (callback) {
            request(awsEndpoint + 'placement/availability-zone', function (err, resp, body) {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (resp.statusCode == 200) {
                    data.avlZone = body;
                    callback(null, body);
                }
            });
        },

        function (callback) {
            request(awsEndpoint + 'local-ipv4', function (err, resp, body) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (resp.statusCode == 200) {
                    data.localipv4 = body;
                    callback(null, body);
                }
            });
        },

        function (callback) {
            request(awsEndpoint + 'public-hostname', function (err, resp, body) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (resp.statusCode == 200) {
                    data.publichostname = body;
                    callback(null, body);
                }
            });
        },

        function (callback) {
            request(awsEndpoint + 'public-ipv4', function (err, resp, body) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (resp.statusCode == 200) {
                    data.publicipv4 = body;
                    callback(null, body);
                }
            });
        }
    ], function (err, result) {
        if (err) {
            console.error('Error in getting instance data', err, result);
        }
        console.log("Instance Data ", data);
        finalCallback(err, data)
    });
};

InstanceData.prototype.getLocalData = function (finalCallback) {
    var data = {};

    data.amiid = 'local';
    data.instanceid = uuid.v4();
    data.hostname = 'localhost';
    data.avlZone = config.DefaultLocalAvailabilityZone;


    var localAddresses = LocalIp.getLocalIp();
    data.localipv4 = localAddresses[0];
    data.localhostname = data.localipv4;
    data.publichostname = data.localipv4;

    PublicIp.getLocalIp.v4(function (err, ip) {
        if (err) {
            return;
        }
        data.publicipv4 = ip;
        finalCallback && finalCallback(err, data)
    });
};

module.exports = new InstanceData();

