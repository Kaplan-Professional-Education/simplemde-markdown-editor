"use strict";

require("./markdown-it-mode");
require("codemirror/addon/mode/overlay");
var CodeMirror = require("codemirror");

CodeMirror.defineMode("markdown-it-plugins", function(config, modeConfig) {

    var colorRE = /{color(?::(#?\w+))?}/;
    //var alignmentRE = /\[(<-|->|><|<>)\]/;

    // used for bare links. May have to be edited if more kinds of markup need to be added.
    var urlRE = /^((?:(?:aaas?|about|acap|adiumxtra|af[ps]|aim|apt|attachment|aw|beshare|bitcoin|bolo|callto|cap|chrome(?:-extension)?|cid|coap|com-eventbrite-attendee|content|crid|cvs|data|dav|dict|dlna-(?:playcontainer|playsingle)|dns|doi|dtn|dvb|ed2k|facetime|feed|file|finger|fish|ftp|geo|gg|git|gizmoproject|go|gopher|gtalk|h323|hcp|https?|iax|icap|icon|im|imap|info|ipn|ipp|irc[6s]?|iris(?:\.beep|\.lwz|\.xpc|\.xpcs)?|itms|jar|javascript|jms|keyparc|lastfm|ldaps?|magnet|mailto|maps|market|message|mid|mms|ms-help|msnim|msrps?|mtqp|mumble|mupdate|mvn|news|nfs|nih?|nntp|notes|oid|opaquelocktoken|palm|paparazzi|platform|pop|pres|proxy|psyc|query|res(?:ource)?|rmi|rsync|rtmp|rtsp|secondlife|service|session|sftp|sgn|shttp|sieve|sips?|skype|sm[bs]|snmp|soap\.beeps?|soldat|spotify|ssh|steam|svn|tag|teamspeak|tel(?:net)?|tftp|things|thismessage|tip|tn3270|tv|udp|unreal|urn|ut2004|vemmi|ventrilo|view-source|webcal|wss?|wtai|wyciwyg|xcon(?:-userid)?|xfire|xmlrpc\.beeps?|xmpp|xri|ymsgr|z39\.50[rs]?):(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/))/i;
    var uriRE = new RegExp("(?!"+colorRE.source+"|\\*[^\\s()<>]*\\*)[^\\s()<>]"); //do not match color or bold/italic delimiters
    uriRE = new RegExp("(?:"+uriRE.source+"|\\("+uriRE.source+"*\\))+");
    urlRE = new RegExp(urlRE.source+uriRE.source);

    function getActiveStyles(state) {
        var styles = [];

        if(state.color.length) {
            styles.push(state.color[state.color.length-1]);
        }
        if (state.alignment.length) {
            styles.push(state.alignment[state.alignment.length-1]);
        }

        return styles.length ? styles.join(" ") : null;
    }

    var overlay = {
        startState: function() {
            return {
                color: [],
                alignment: [],
            };
        },
        copyState: function(s) {
            return {
                color: s.color,
                alignment: s.alignment,
            };
        },
        blankLine: function(state) {
            state.color = [];
            state.alignment = [];
            return null;
        },
        token: function(stream, state) {
            state.combineTokens = null;

            var matches;
            if((matches = stream.match(colorRE))){
                if (matches[1]){
                    var style = "color--"+matches[1].replace(/{|}/g,"").replace(":","-").replace("#","hex-");
                    var color = matches[1].replace("{color:","").replace("}","");
                    modeConfig.eventListener && modeConfig.eventListener.trigger("updatedColors",["cm-"+style,color]);
                    state.color.push(style);
                    return getActiveStyles(state) + " formatting-color";
                } else {
                    var type = getActiveStyles(state);
                    state.color.pop();
                    return type + " formatting-color";
                }
            }
            if (modeConfig.linkify &&
          stream.match(urlRE) &&
          stream.string.slice(stream.start - 2, stream.start) != "](" &&
          (stream.start == 0 || /\W/.test(stream.string.charAt(stream.start - 1)))) {
                state.combineTokens = true;
                return "link";
            }

            stream.next();
            return getActiveStyles(state);
        },
    };

    var markdownConfig = {};
    for (var attr in modeConfig) {
        markdownConfig[attr] = modeConfig[attr];
    }
    markdownConfig.name = "markdown-it";
    return CodeMirror.overlayMode(CodeMirror.getMode(config, markdownConfig), overlay, true);

}, "markdown-it");

CodeMirror.defineMIME("text/x-markdown-it-plugins", "markdown-it-plugins");
