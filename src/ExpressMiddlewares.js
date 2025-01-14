var morgan = require("morgan");
var uuid = require("uuid");
var ns = require("continuation-local-storage");
var os = require("os");

var CUSTOMER_UUID = "customer-uuid";
var AUTH_INFO_USER_ID = "auth-info-user-id";

var ExpressMiddlewares = {}; //static

ExpressMiddlewares.accessLogMiddleware = function (serviceName, dockerMode) {

    serviceName = serviceName || "unknown";
    var hostName = os.hostname();
    var serviceColor = process.env.SERVICE_COLOR || "unknown";

    morgan.token("host_name", function getHostName(request, response){
        return hostName;
    });

    morgan.token("service_name", function getHostName(request, response){
        return serviceName;
    });

    morgan.token("uri", function getUri(request, response) {
        try {
            return request._parsedUrl.pathname;
        } catch(e) {
            return "error";
        }
    });

    morgan.token("query_string", function getQueryString(request) {
        try {
            return request._parsedUrl.query;
        } catch(e){
            return "error";
        }
    });

    morgan.token("protocol", function getProtocol(request, response){
        try {
            return request.secure ? "HTTPS" : "HTTP";
        } catch(e){
            return "error";
        }
    });

    morgan.token("server_name", function getServerName(request, response){
        try {
            return request.headers.host ? request.headers.host : "unknown";
        } catch(e){
            return "error";
        }
    });

    morgan.token("service_color", function getServiceColor(request, response){
        return serviceColor;
    });

    morgan.token("remote_client_id", function getRemoteClientId(request, response){

        var rcId = "";

        try {
            rcId = request.headers.customeruuid;

            if (request.headers[CUSTOMER_UUID]) {
                rcId = request.headers[CUSTOMER_UUID];
            }

            if (request.headers[AUTH_INFO_USER_ID]) {
                rcId = request.headers[AUTH_INFO_USER_ID];
            }

            if (!rcId) {
                rcId = "unknown";
            }

        } catch(e){
            rcId = "error";
        }

        return rcId;
    });

    morgan.token("bytes_received", function getBytesReceived(request, response){
        try {

            if(typeof request.body === "string"){
                return Buffer.byteLength(request.body, "utf-8").toString();
            }

            return "0";

        } catch(e){
            return "error";
        }
    });

    /*
    morgan.token("bytes_sent", function getBytesSent(request, response){
        return "0";
    });
    */

    /*
    return morgan(
        "{ \"@timestamp\": \":date[iso]\", \"host\": \":host_name\", \"loglevel\": \"INFO\"," +
        " \"correlation-id\": \":req[correlation-id]\", \"application_type\": \"service\", \"log_type\": \"access\"," +
        " \"service\": \":service_name\", \"remote_address\": \":remote-addr\", \"status\": \":status\"," +
        " \"request_method\": \":method\", \"uri\": \":uri\", \"query_string\": \":query_string\"," +
        " \"response_time\": \":response-time\", \"protocol\": \":protocol\", \"server_name\": \":server_name\"," +
        " \"current_color\": \":service_color\", \"remote_client_id\": \":remote_client_id\", " +
        " \"bytes_received\": \":bytes_received\", \"bytes_sent\": \":bytes_sent\" }",
        {});
    */

    return morgan(
        "{ \"@timestamp\": \":date[iso]\", \"host\": \":host_name\", \"loglevel\": \"INFO\"," +
        " \"correlation-id\": \":req[correlation-id]\", \"application_type\": \"service\", \"log_type\": \"access\"," +
        " \"service\": \":service_name\", \"remote_address\": \":remote-addr\", \"status\": \":status\"," +
        " \"request_method\": \":method\", \"uri\": \":uri\", \"query_string\": \":query_string\"," +
        " \"response_time\": \":response-time\", \"protocol\": \":protocol\", \"server_name\": \":server_name\"," +
        " \"current_color\": \":service_color\", \"remote_client_id\": \":remote_client_id\", " +
        " \"bytes_received\": \":bytes_received\" }",
        {});
};

ExpressMiddlewares.accessLogMiddlewareFile = function (filePath, dockerMode) {

    morgan.token("uri", function getUri(request, response) {
        return request._parsedUrl.pathname;
    });

    morgan.token("query_string", function getQueryString(request) {
        return request._parsedUrl.query;
    });

    var accessLogStream = fs.createWriteStream(filePath, {flags: 'a'});
    var hostName = os.hostname();

    return morgan(
        "{ \"@timestamp\": \":date[iso]\", \"host\": \"" + hostName + "\", \"loglevel\": \"INFO\", \"correlationId\": \":req[correlation-id]\", \"application_type\": \"service\", \"log_type\": \"access\", \"remote_address\": \":remote-addr\", \"status\": \":status\", \"request_method\": \":method\", \"uri\": \":uri\", \"query_string\": \":query_string\", \"response_time\": \":response-time\" }",
        {stream: accessLogStream});
};

module.exports = ExpressMiddlewares;
