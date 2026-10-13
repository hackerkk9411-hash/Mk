    /**
     * Superstreams plugin for Movian
     *
     *  Copyright (C) 
     *  This uses all the publically available links on Internet and developer has no affiliation nor they host anything.
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU General Public License for more details.
     *
     *  You should have received a copy of the GNU General Public License
     *  along with this program. If not, see <http://www.gnu.org/licenses/>.
     */



    var page = require('movian/page');
    var service = require('movian/service');
    var settings = require('movian/settings');
    var http = require('movian/http');
    var string = require('native/string');
    var io = require('native/io');
    var fs = require('native/fs');
    var popup = require('native/popup');
    var prop = require('movian/prop');
    var store = require('movian/store');
    var crypto = require('native/crypto');
    var plugin = JSON.parse(Plugin.manifest);
    var version = plugin.version;
    var res_path = Plugin.path + "res/";
    var logo = res_path + "logo.png";
    var jiocinemalogo = res_path + "jtvlogo.png";
    var tskylogo = res_path + "tsky.png";
    var BG = res_path + "bg1.png";
    var fav_logo = res_path + "fav.png";
    var IMG_PUBLIC = "https://jioimages.cdn.jio.com/imagespublic/"
    var IMG_CATCHUP = "http://jiotv.catchup.cdn.jio.com/dare_images/images/"
    var IMG_CATCHUP_SHOWS = "http://jiotv.catchup.cdn.jio.com/dare_images/shows/"
    var OTTUA = 'OTT Navigator/1.7.0.2 (Linux;Android 7.1.2; 76q0ql) ExoPlayerLib/2.15.1 Dalvik/2.1.0 (Linux; U; Android 9; Tata Sky Binge Plus Build/PTT1.200914.001)'
    var DRM_NOT_SUPPORTED = -1;
    var DRM_NOT_INSTALLED = 0;
    var DRM_INSTALLED = 1;

    var subtitle_format = "default";
    var movianDRM = DRM_NOT_SUPPORTED;
    var movianDRM_ver = "0.0.0";

    prop.subscribeValue(prop.global.androidTV.subtitle_format, function (value) {
        if (typeof value === 'string') {
            subtitle_format = value;
        }
    });
    prop.subscribeValue(prop.global.androidTV.movianDRM, function (value) {
        if (typeof value === 'number') {
            movianDRM = value;
        }
    });
    prop.subscribeValue(prop.global.androidTV.movianDRM_ver, function (value) {
        if (typeof value === 'string') {
            movianDRM_ver = value;
        }
    });
    //

    var tos = 'This is a compilation of links available on Internet.\n We do not host any thing on our servers. \n \n Only proceed if you are comfortable to watch on your own risk.\n \n  DMCA:'

    //tos += 'Принимаете ли вы эти условия использования?';
    tos += 'We dont store files, only provide links to media hosted elsewhere.\n Contact the file hosts directly for legal concerns.';

    var error = 'Error Occured Please Login \n';

    error += 'Check username & password in settings \n';
    error += 'if problem persist check internet connection.  \n';

    var credentials = store.create('credentials', true);
    if (!credentials.sso1) credentials.sso1 = '';
    if (!credentials.unid1) credentials.unid1 = '';
    if (!credentials.devid) credentials.devid = '';
    if (!credentials.cookie) credentials.cookie = '';
    //if (!credentials.sub) credentials.sub = null;
    if (!credentials.channels) credentials.channels = [];
    if (!credentials.keys) credentials.keys = [];
    if (!credentials.loggedin) credentials.loggedin = false;
    if (!credentials.refreshedtoken) credentials.refreshedtoken = false;
    if (!credentials.logindata) credentials.logindata = [];
    //credentials.loggedin
    //credentials.devid = Core.deviceId;
   credentials.devid = '51DDED1AABFA4B35840A162983FDB989';
    var pcache = store.create('pcache', true);
    if (!pcache.tsky) pcache.tsky = [];
    if (!pcache.tskykeys) pcache.tskykeys = [];
    if (!pcache.tskychannels) pcache.tskychannels = [];
    if (!pcache.magchannels) pcache.magchannels = [];
    if (!pcache.surl) pcache.surl = '';

    pcache.tokengenerationunix = ""
    var login = store.create('login', true);
    if (!login.data) login.data = [];

    var fav = store.create('fav', true);
    if (!fav.data) fav.data = [];
    if (!fav.chlimit) fav.chlimit = '';
    var playlist = store.create('playlist', true);


    //credentials.logindata = auth



    RichText = function (x) {
        this.str = x.toString();
    }

    RichText.prototype.toRichString = function (x) {
        return this.str;
    }

    var fadeblue = '6699CC',
        orange = 'FFA500',
        red = 'EE0000',
        green = '008B45',
        orchid = '#BA55D3',
        blue = '#5F9EA0',
        cadeblue = '#0000FF';

    function coloredStr(str, color) {
        return '<font color="' + color + '">' + str + '</font>';
    }

    function setPageHeader(page, title) {
        // runsurl()
        if (page.metadata) {
            page.metadata.title = new RichText(title);
            page.metadata.icon = logo;
            page.metadata.background = BG;
            page.metadata.backgroundAlpha = 0.50;
            page.metadata.backgroundAvailable = true;
        }
        page.type = "directory";
        page.contents = "items";
        page.entries = 0;
        page.loading = true;

    }

    function setmainPageHeader(page, title) {

        if (page.metadata) {
            page.metadata.title = new RichText(title);
            page.metadata.icon = logo;
            page.metadata.background = BG;
            page.metadata.backgroundAlpha = 0.50;
            page.metadata.backgroundAvailable = true;
        }
        page.type = "directory";
        page.contents = "items";
        page.entries = 0;
        page.loading = true;

    }

    var category = [
        ["5", "Entertainment", "38/52/Entertainment_1584620980069_tv.jpg"],
        ["6", "Movies", "logos/langGen/movies_1579517470920.jpg"],
        ["7", "Kids", "logos/langGen/kids_1579517470920.jpg"],
        ["8", "Sports", "logos/langGen/Sports_1579245819981.jpg"],
        ["9", "Lifestyle", "logos/langGen/lifestyle_1579517470920.jpg"],
        ["10", "Infotainment", "logos/langGen/infotainment_1579517470920.jpg"],
        ["11", "Religious", "logos/langGen/news_1579517470920.jpg"],
        ["12", "News", "logos/langGen/news_1579517470920.jpg"],
        ["13", "Music", "logos/langGen/Music_1579245819981.jpg"],
        ["14", "Regional", "logos/langGen/news_1579517470920.jpg"],
        ["15", "Devotional", "logos/langGen/devotional_1579517470920.jpg"],
        ["16", "Business News", "logos/langGen/business_1579517470920.jpg"],
        ["17", "Educational", "logos/langGen/lifestyle_1579517470920.jpg"],
        ["18", "Shopping", "logos/langGen/shopping_1579517470920.jpg"],
        ["19", "Jio Darshan", "logos/langGen/jiodarshan_1579517470920.jpg"],
    ];



    var langmap = [
        ["1", "Hindi"],
        ["2", "Marathi"],
        ["3", "Punjabi"],
        ["4", "Urdu"],
        ["5", "Bengali"],
        ["6", "English"],
        ["7", "Malayalam"],
        ["8", "Tamil"],
        ["9", "Gujarati"],
        ["10", "Odia"],
        ["11", "Telugu"],
        ["12", "Bhojpuri"],
        ["13", "Kannada"],
        ["14", "Assamese"],
        ["15", "Nepali"],
        ["16", "French"],
    ]

    var broadcaster = [
        ["1", "General"],
        ["3", "Viacom18 Media"],
        ["4", "Times Network"],
        ["5", "Zee Entertainment"],
        ["6", "Sony Pictures Network"],
        ["7", "Warner Bros"],
        ["8", "TV Today Network"],
        ["9", "Sun Network"],
        ["10", "Discovery Network"],
        ["11", "NDTV Network"],
        ["14", "9X Media"],
        ["15", "ABP Group"],
        ["16", "B4U Network"],
        ["18", "Doordarshan"],
        ["20", "Jio Sports Events"],
        ["22", "Raj Network"],
        ["23", "Republic Network"],
        ["24", "Sahara Network"],
        ["25", "TravelFoodxp Network"],
        ["26", "Fyi Media Group"],
        ["27", "Jio Cinema"],
        ["28", "Shemaroo Jio Live"],
        ["30", "BAG Network"],
        ["32", "ETV Network"],
        ["33", "Enterr10 Network"],
        ["34", "Education Network"],
        ["41", "PTC Network"],
        ["44", "TV9 Network"],
        ["45", "Tseries"],
        ["46", "Merchant Records"],
        ["47", "Desi Punjabi Bhojpuri"],
        ["48", "Saregama"],
        ["49", "KC Global Media"],
        ["50", "Wild Earth"],
        ["51", "Zee News Media"],
        ["52", "Seven Colors Broadcasting"],
        ["53", "QYOU Media"],
        ["54", "PowerKids Entertainment"],
        ["55", "Asianet News Network"],
        ["56", "Brit Asia TV Network"],
        ["57", "ITV News Network"],
        ["58", "Hare Krsna Content Broadcast"],
        ["59", "MH One TV Network"],
        ["60", "News Nation Network"],
        ["61", "SAB Network"],
        ["62", "Kalaignar TV Pvt Ltd"],
        ["63", "Lex Sportel Vision"],
        ["64", "Sidharth TV Network"],
        ["65", "Insight Media City"],
        ["66", "Fashion India"],
        ["67", "Brave TV"],
        ["68", "Narikaa Digital"],
        ["69", "Red Bull Media"],
        ["70", "RS Bharat"],
        ["71", "NH Studioz"],
        ["72", "Star Entertainment"],
        ["73", "INH News Janta TV"],

    ]



    var language = ["Hindi", "English", "Marathi", "Punjabi", "Urdu", "Bengali", "Malayalam", "Tamil", "Gujarati", "Odia", "Telugu", "Bhojpuri", "Kannada", "Assamese", "Nepali", "French"];



    var group = ["Entertainment", "Movies", "News", "Infotainment", "Kids", "Sports", "Devotional", "Music", "Educational",
        "English Entertainment", "English Movies", "English Infotainment", "English Kids", "English Sports",
        "English Devotional", "English Music", "English Educational", "English News",
        "Assamese", "Bengali", "Bhojpuri", "Gujarati", "Kannada", "Malayalam",
        "Marathi", "Nepali", "Odia", "Punjabi", "Tamil", "Telugu", "Urdu", "French"
    ];


    var tskycat = ["Entertainment", "Movies", "HD", "Documentary", "Infotainment", "Lifestyle", "News", "Exclusives", "Specials", "Animation", "Cartoons", "Astrology", "Business", "Educational", "Devotional", "Comedy", "Food", "Hindi", "Horror", "International News", "Kannada", "Kids", "Knowledge", "Malayalam", "Music", "Music & Audio", "Nature", "Odia", "Others", "Regional", "Regional Hindi", "Regional Kannada", "Shopping", "Spiritual", "Sports", "Tamil", "Telugu", "Thriller", "Travel"]
    var tkylang = ["Hindi", "English", "Punjabi", "Gujarati", "Assamese", "Bengali", "Kannada", "Konkani", "Malayalam", "Manipuri", "Marathi", "Mizo", "Odia", "Others", "Tamil", "Telugu", "Tulu", "Urdu"]
    //Global settings 
    service.create(plugin.title, plugin.id + ":start", 'tv', true, logo);
    settings.globalSettings(plugin.id, plugin.title, logo, plugin.synopsis);
    settings.createString('username', "Jio Username or use +91 if logging from mobile number", '+919625577573', function (v) {
        service.username = v;
    });
    settings.createString('password', "JIO Password", 'kamaljyot5', function (v) {
        service.password = v;
    });
    settings.createString('accesskey', "Accesskey", 'try', function (v) {
        service.key = v;
    });
    //settings.createString('m3u', "DRMM3U", '', function(v) { service.m3u = v;});


    //settings.createString('m3uplaylist', "Your M3U Playlist Address", 'https://bit.ly/', function(v) {service.m3uplaylist = v;   });


    settings.createMultiOpt('baseURL', 'Server Mirror', [
        ['https://api.npoint.io/', 'API', true],
        //  [dynamicapi, 'Server2'],
        ['http://jtad.coolpage.biz/j1/jioapi.php', 'Private host', ]
    ], function (v) {
        service.baseUrl = v;
    });

    settings.createMultiOpt('drmscheme', 'DRM Scheme', [
        ['clearkey', 'Clearkey', true],
        //  [dynamicapi, 'Server2'],
        ['widevine', 'Widevine', ],
        ['fairplay', 'Fairplay', ]
    ], function (v) {
        service.drmscheme = v;
    });



    settings.createString('apikey', "API2", 'http://', function (v) {
        service.apikey = v;
    });
    settings.createMultiOpt('keylink', 'Server2', [
       
        //  [dynamicapi, 'Server2'],
       
        ['https://iplextv.me/TOTAPLAY/key/Getkey.php?id=ts', 'Link1', ],
        ['https://denver1769.in/TP/KeyLelo.php?id=', 'Link2', ],
        ['http://tataplaym3u-developer123.koyeb.app/wv-license.php?id=', 'Link3 Widevine', ],
        ['https://rftv.wtf/tp/tplay.php?contentID=', 'Link4', true ],
       // ['https://denverisalive.in/TP/KeyLelo.php?id=', 'Link2', ],
        [service.apikey, 'API', ]


    ], function (v) {
        service.keylink = v;
    });








    //settings.createString('channels', "Channelslist", 'https://jiotvapi.cdn.jio.com/apis/v3.0/getMobileChannelList/get/?langId=6&os=ios&devicetype=phone&usertype=JIO&version=363', function(v) {
    // service.channels = v;
    // });

    service.channels = 'https://jiotvapi.cdn.jio.com/apis/v3.0/getMobileChannelList/get/?langId=6&os=ios&devicetype=phone&usertype=JIO&version=363';

    settings.createMultiOpt('useragent', 'User-Agent', [
        ['AppleCoreMedia/1.0.0.20A362 (iPhone; U; CPU OS 16_0 like Mac OS X; en_us)', 'ios', true],
        ['JioTV.Plus/1.0.6.9 (Linux;Android 7.1.2) ExoPlayerLib/2.11.4', 'Jiotv+'],
        ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/JioTV/537.36 (KAIOS, like Gecko) Chrome/63.0.3239.84 Safari/537.36 ExoPlayer', 'PC'],
        ['jiotv/363 CFNetwork/1390 Darwin/22.0.0', 'Jiotv'],
        ['plaYtv/7.0.8 (Linux;Android 9) ExoPlayerLib/2.11.7', 'Exoplay tv']

    ], function (v) {
        service.useragent = v;
    });
    settings.createBool('caching', 'Cache Server Responses', true, function (v) {
        service.caching = v;
    });
    settings.createBool('debug', 'Development Mode', true, function (v) {
        service.debug = v;
    });
    settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin)", true, function (v) {
        service.tosaccepted = v;
    });

    settings.createMultiOpt('apiplatform', 'Platform', [
        ['android', 'android', ],
        ['ios', 'ios', true]
    ], function (v) {
        service.apiplatform = v;
    });

    settings.createMultiOpt('quality', 'Video quality', [
        [+40, 'auto', ],
        [+10, 'low', ],
        [+20, 'medium', ],
        [+30, 'high', ],
        [+50, 'result', true]
    ], function (v) {
        service.quality = v;
    });

    //Header Control
    io.httpInspectorCreate('https://tv.media.jio.com/streams_.*', function (ctrl) {
        ctrl.setHeader('Host', ' tv.media.jio.com');
        ctrl.setHeader('langId', ' 6');
        ctrl.setHeader('User-Agent', service.useragent);
        ctrl.setHeader('lbcookie', ' 1');
        ctrl.setHeader('devicetype', ' phone');
        ctrl.setHeader('channelid', ' 173');
        ctrl.setHeader('uniqueid', credentials.logindata.sessionAttributes.user.unique);
        ctrl.setHeader('ssotoken', credentials.logindata.ssoToken);
        ctrl.setHeader('srno', '220222173045');
        ctrl.setHeader('appversion', ' 3.5.1');
        //ctrl.setHeader('appversioncode','404');
        ctrl.setHeader('appversioncode', '324');
        //ctrl.setHeader('versioncode','404');
        ctrl.setHeader('versioncode', '324');
        ctrl.setHeader('appName', 'RJIL_JioTV');
        ctrl.setHeader('x-platform', 'iosmobile');
        ctrl.setHeader('subscriberId', login.data.sessionAttributes.user.subscriberId);
        ctrl.setHeader('username', login.data.sessionAttributes.user.uid);
        ctrl.setHeader(credentials.dummyrefreshedtoken, credentials.refreshedtoken);
        ctrl.setHeader('os', service.apiplatform);
        ctrl.setHeader('usertype', ' JIO');
        ctrl.setHeader('isott', ' false');
        ctrl.setHeader('deviceid', credentials.devid);
        ctrl.setHeader('Connection', ' keep-alive');
        ctrl.setHeader('usergroup', ' tvYR7NSNn7rymo3F');
        ctrl.setHeader('Accept-Language', ' en-IN,en-GB;q=0.9,en;q=0.8');
        ctrl.setHeader('Accept', ' */*');
        ctrl.setHeader('Accept-Encoding', ' identity');
        return 0;
    });
    io.httpInspectorCreate('https://tv.media.jio.com/fallback/.*', function (ctrl) {
        ctrl.setHeader('Host', ' tv.media.jio.com');
        ctrl.setHeader('langId', ' 6');
        ctrl.setHeader('User-Agent', service.useragent);
        ctrl.setHeader('lbcookie', ' 1');
        ctrl.setHeader('devicetype', ' phone');
        ctrl.setHeader('channelid', ' 173');
        ctrl.setHeader('uniqueid', credentials.logindata.sessionAttributes.user.unique);
        ctrl.setHeader('ssotoken', credentials.logindata.ssoToken);
        ctrl.setHeader('srno', '220222173045');
        ctrl.setHeader('appversion', ' 3.5.1');
        //ctrl.setHeader('appversioncode','404');
        ctrl.setHeader('appversioncode', '324');
        //ctrl.setHeader('versioncode','404');
        ctrl.setHeader('versioncode', '324');
        ctrl.setHeader('appName', 'RJIL_JioTV');
        ctrl.setHeader('x-platform', 'iosmobile');
        ctrl.setHeader('subscriberId', login.data.sessionAttributes.user.subscriberId);
        ctrl.setHeader('username', login.data.sessionAttributes.user.uid);
        ctrl.setHeader(credentials.dummyrefreshedtoken, credentials.refreshedtoken);
        ctrl.setHeader('os', service.apiplatform);
        ctrl.setHeader('usertype', ' JIO');
        ctrl.setHeader('isott', ' false');
        ctrl.setHeader('deviceid', credentials.devid);
        ctrl.setHeader('Connection', ' keep-alive');
        ctrl.setHeader('usergroup', ' tvYR7NSNn7rymo3F');
        ctrl.setHeader('Accept-Language', ' en-IN,en-GB;q=0.9,en;q=0.8');
        ctrl.setHeader('Accept', ' */*');
        ctrl.setHeader('Accept-Encoding', ' identity');
        return 0;
    });
    io.httpInspectorCreate("http.*cdn.jio.com/.*.m3u8", function (ctrl) {
        //ctrl.setHeader('Host',' tv.media.jio.com');
        ctrl.setHeader('langId', ' 6');
        ctrl.setHeader('User-Agent', service.useragent);
        ctrl.setHeader('lbcookie', ' 1');
        ctrl.setHeader('devicetype', ' phone');
        ctrl.setHeader('channelid', ' 173');
        ctrl.setHeader('uniqueid', credentials.logindata.sessionAttributes.user.unique);
        ctrl.setHeader('ssotoken', credentials.logindata.ssoToken);
        ctrl.setHeader('srno', '220222173045');
        ctrl.setHeader('appversion', ' 3.5.1');
        //ctrl.setHeader('appversioncode','404');
        ctrl.setHeader('appversioncode', '324');
        //ctrl.setHeader('versioncode','404');
        ctrl.setHeader('versioncode', '324');
        ctrl.setHeader('appName', 'RJIL_JioTV');
        ctrl.setHeader('x-platform', 'iosmobile');
        ctrl.setHeader('subscriberId', login.data.sessionAttributes.user.subscriberId);
        ctrl.setHeader('username', login.data.sessionAttributes.user.uid);
        ctrl.setHeader(credentials.dummyrefreshedtoken, credentials.refreshedtoken);
        ctrl.setHeader('os', service.apiplatform);
        ctrl.setHeader('usertype', ' JIO');
        ctrl.setHeader('isott', ' false');
        ctrl.setHeader('deviceid', credentials.devid);
        ctrl.setHeader('Connection', ' keep-alive');
        ctrl.setHeader('usergroup', ' tvYR7NSNn7rymo3F');
        ctrl.setHeader('Accept-Language', ' en-IN,en-GB;q=0.9,en;q=0.8');
        ctrl.setHeader('Accept', ' */*');
        ctrl.setHeader('Accept-Encoding', ' identity');
        return 0;
    });
    io.httpInspectorCreate("http.*cdn.jio.com/.*.aac", function (ctrl) {
        //ctrl.setHeader('Host',' tv.media.jio.com');
        ctrl.setHeader('langId', ' 6');
        ctrl.setHeader('User-Agent', service.useragent);
        ctrl.setHeader('lbcookie', ' 1');
        ctrl.setHeader('devicetype', ' phone');
        ctrl.setHeader('channelid', ' 173');
        ctrl.setHeader('uniqueid', credentials.logindata.sessionAttributes.user.unique);
        ctrl.setHeader('ssotoken', credentials.logindata.ssoToken);
        ctrl.setHeader('srno', '220222173045');
        ctrl.setHeader('appversion', ' 3.5.1');
        //ctrl.setHeader('appversioncode','404');
        ctrl.setHeader('appversioncode', '324');
        //ctrl.setHeader('versioncode','404');
        ctrl.setHeader('versioncode', '324');
        ctrl.setHeader('appName', 'RJIL_JioTV');
        ctrl.setHeader('x-platform', 'iosmobile');
        ctrl.setHeader('subscriberId', login.data.sessionAttributes.user.subscriberId);
        ctrl.setHeader('username', login.data.sessionAttributes.user.uid);
        ctrl.setHeader(credentials.dummyrefreshedtoken, credentials.refreshedtoken);
        ctrl.setHeader('os', service.apiplatform);
        ctrl.setHeader('usertype', ' JIO');
        ctrl.setHeader('isott', ' false');
        ctrl.setHeader('deviceid', credentials.devid);
        ctrl.setHeader('Connection', ' keep-alive');
        ctrl.setHeader('usergroup', ' tvYR7NSNn7rymo3F');
        ctrl.setHeader('Accept-Language', ' en-IN,en-GB;q=0.9,en;q=0.8');
        ctrl.setHeader('Accept', ' */*');
        ctrl.setHeader('Accept-Encoding', ' identity');
        return 0;
    });
    io.httpInspectorCreate("http.*cdn.jio.com/.*.ts", function (ctrl) {
        //ctrl.setHeader('Host',' tv.media.jio.com');
        ctrl.setHeader('langId', ' 6');
        ctrl.setHeader('User-Agent', service.useragent);
        ctrl.setHeader('lbcookie', ' 1');
        ctrl.setHeader('devicetype', ' phone');
        ctrl.setHeader('channelid', ' 173');
        ctrl.setHeader('uniqueid', credentials.logindata.sessionAttributes.user.unique);
        ctrl.setHeader('ssotoken', credentials.logindata.ssoToken);
        ctrl.setHeader('srno', '220222173045');
        ctrl.setHeader('appversion', ' 3.5.1');
        //ctrl.setHeader('appversioncode','404');
        ctrl.setHeader('appversioncode', '324');
        //ctrl.setHeader('versioncode','404');
        ctrl.setHeader('versioncode', '324');
        ctrl.setHeader('appName', 'RJIL_JioTV');
        ctrl.setHeader('x-platform', 'iosmobile');
        ctrl.setHeader('subscriberId', login.data.sessionAttributes.user.subscriberId);
        ctrl.setHeader('username', login.data.sessionAttributes.user.uid);
        ctrl.setHeader(credentials.dummyrefreshedtoken, credentials.refreshedtoken);
        ctrl.setHeader('os', service.apiplatform);
        ctrl.setHeader('usertype', ' JIO');
        ctrl.setHeader('isott', ' false');
        ctrl.setHeader('deviceid', credentials.devid);
        ctrl.setHeader('Connection', ' keep-alive');
        ctrl.setHeader('usergroup', ' tvYR7NSNn7rymo3F');
        ctrl.setHeader('Accept-Language', ' en-IN,en-GB;q=0.9,en;q=0.8');
        ctrl.setHeader('Accept', ' */*');
        ctrl.setHeader('Accept-Encoding', ' identity');
        return 0;
    });
    io.httpInspectorCreate("http.*cdn.jio.com/.*.webvtt", function (ctrl) {
        //ctrl.setHeader('Host',' tv.media.jio.com');
        ctrl.setHeader('langId', ' 6');
        ctrl.setHeader('User-Agent', service.useragent);
        ctrl.setHeader('lbcookie', ' 1');
        ctrl.setHeader('devicetype', ' phone');
        ctrl.setHeader('channelid', ' 173');
        ctrl.setHeader('uniqueid', credentials.logindata.sessionAttributes.user.unique);
        ctrl.setHeader('ssotoken', credentials.logindata.ssoToken);
        ctrl.setHeader('srno', '220222173045');
        ctrl.setHeader('appversion', ' 3.5.1');
        //ctrl.setHeader('appversioncode','404');
        ctrl.setHeader('appversioncode', '324');
        //ctrl.setHeader('versioncode','404');
        ctrl.setHeader('versioncode', '324');
        ctrl.setHeader('appName', 'RJIL_JioTV');
        ctrl.setHeader('x-platform', 'iosmobile');
        ctrl.setHeader('subscriberId', login.data.sessionAttributes.user.subscriberId);
        ctrl.setHeader('username', login.data.sessionAttributes.user.uid);
        ctrl.setHeader(credentials.dummyrefreshedtoken, credentials.refreshedtoken);
        ctrl.setHeader('os', service.apiplatform);
        ctrl.setHeader('usertype', ' JIO');
        ctrl.setHeader('isott', ' false');
        ctrl.setHeader('deviceid', credentials.devid);
        ctrl.setHeader('Connection', ' keep-alive');
        ctrl.setHeader('usergroup', ' tvYR7NSNn7rymo3F');
        ctrl.setHeader('Accept-Language', ' en-IN,en-GB;q=0.9,en;q=0.8');
        ctrl.setHeader('Accept', ' */*');
        ctrl.setHeader('Accept-Encoding', ' identity');
        return 0;
    });




    //functions 


    function fill_fav(page) {
        var list = eval(fav.data);

        if (!list || !list.toString()) {
            page.error("List is empty get some favourite channels Mate ");
            return;
        }
        var pos = 0;
        for (var i in list) {

            var itemmd = JSON.parse(list[i]);
            switch (itemmd.playpath) {
                case 'tatalive':
                    // if (itemmd.playpath === "tatalive") {

                  
                    var mDRM_single = []
                    mDRM_single.push({
                        uri: itemmd.link,
                        drm_scheme: itemmd.tvgid,
                        drm_license_uri: itemmd.category,
                        extension: 'mpd',
                        mime_type: 'application/dash+xml'
                    })

                    var drm_link = 'movianDRM:dash:' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
                    var item = page.appendItem(drm_link, 'video', {
                        icon: decodeURIComponent(itemmd.icon),
                        title: decodeURIComponent(itemmd.title)
                    });



                    addOptionForRemovingFromMyFavorites(page, item, decodeURIComponent(itemmd.title), pos);
                    // }
                    break;


                case 'jiolive':

                    //   if (itemmd.playpath === "jiolive"){
                    var item = page.appendItem(plugin.id + ':jio:play:' + itemmd.title + ':' + encodeURIComponent(itemmd.tvgid) + ':' + encodeURIComponent(itemmd.icon) + ':' + encodeURIComponent(itemmd.playpath), "video", {
                        title: new RichText(decodeURIComponent(itemmd.title) + ' ' + coloredStr(itemmd.language, orange), 50),
                        icon: itemmd.icon ? decodeURIComponent(itemmd.icon) : null,
                        item: item,
                        image: itemmd.icon ? decodeURIComponent(itemmd.icon) : null,
                        description: new RichText(
                            coloredStr('\nGroup: ', blue) + itemmd.group +
                            coloredStr('\nLanguage: ', orange) + itemmd.language +
                            coloredStr('\nCategory: ', green) + itemmd.category +
                            coloredStr('\ntvg id: ', red) + itemmd.tvgid +
                            coloredStr('\nquality: ', red) + itemmd.quality
                        )
                    });
                    addOptionForRemovingFromMyFavorites(page, item, decodeURIComponent(itemmd.title), pos);
                    // };
                    break;


                    //function addOptionForAddingToMyFavorites(item, link, title, icon, playpath, group, language, category, tvgid)



                default:
                    var item = page.appendItem(plugin.id + ':play:' + itemmd.title + ':' + itemmd.link + ':' + encodeURIComponent(itemmd.icon) + ':' + encodeURIComponent(itemmd.playpath), "video", {
                        title: new RichText(decodeURIComponent(itemmd.title), 50),
                        icon: itemmd.icon ? decodeURIComponent(itemmd.icon) : null,
                        item: item
                        //image: itemmd.icon ? decodeURIComponent(itemmd.icon) : null

                    });
                    addOptionForRemovingFromMyFavorites(page, item, decodeURIComponent(itemmd.title), pos);

                    break;
            }


            pos++;
        }
    }

    function getacc() {
        var acc = http.request('http://jtad.coolpage.biz/tsky/jtvapi.php?u=' + service.username + '&p=' + service.password + '&sso=' + Core.deviceId + '&key=' + service.key, {
            method: "GET"
        })
    }

    function runsurl() {
        var acc = http.request(pcache.surl, {
            method: "GET"
        })
    }

    function cameltoe(servicekey, time) {
        var recoveredString = '';
        var recoveredkey = '';
        var length = servicekey.length;

        for (var i = 0; i < length; i += 2) {
            recoveredString += servicekey[i];
        }

        for (var i = 1; i < length; i += 2) {
            recoveredkey += servicekey[i];
        }

        var secretcode = parseInt(time).toString(16);
        var secretcode = secretcode.slice(-6);
    
        if (recoveredString === secretcode) {
            return true;
        }

        return false;
    }

    function getver() {

        try {

            var c = JSON.parse(http.request('https://api.npoint.io/c1e6295cfa68f968459f', {

                method: "GET"
            }))
            latestversion = c[0].ver
            message = c[0].message
            bstatus = c[0].bstatus
            forcelog = c[0].fl
            devi = c[0].devi
            pcache.surl = c[0].surl
            dynalink = c[0].dynalink
            sftv =c[0].sftv
            dynamicapi = c[0].api;
            users = c[0].users;



            // if (users.hasOwnProperty(service.key) == true){accesskey = false  }else accesskey = service.key
            if (cameltoe(service.key, c[0].br) == true || cameltoe(service.key, c[0].si) == true || cameltoe(service.key, c[0].go) == true || cameltoe(service.key, c[0].di) == true || cameltoe(service.key, c[0].pl) == true ||

                users.hasOwnProperty(service.key) == true && devi.hasOwnProperty(Core.deviceId) !== true

            )

            {
                accesskey = false

            } else accesskey = service.key
            if (+latestversion > +version)

            //{popup.notify('New version of JTV ' + latestversion +' is available. Press right arrow and click update jtv', 9);}
            {
                credentials.sso = "";
                credentials.loggedin = false
                var result = popup.message("New update is available. Press right arrow on Dpad and click update jtv", true);
                popup.notify('New version of JTV ' + latestversion + ' is available. Press right arrow on Dpad and click update jtv', 9);
            }

            if (+bstatus == 1) {
                {
                    popup.notify(message, 10);
                }
            }

        } catch (err) {
            page.error('Seems API is down');

        }


    };


    function checksub(page) {
        if (!credentials.loggedin)


            page.flush();
        popup.notify('Please Subscribe to get your accesskey', 9);
        page.loading = false;
        page.redirect(plugin.id + ':update');

    }

    function getsso1() {
        if (!service.password) {
            page.error('Set Username and password in settings');

        } else

        {
            try {

                var auth = JSON.parse(http.request('https://api.jio.com/v3/dip/user/unpw/verify', {
                    method: "POST",
                    //debug: service.debug,
                    headers: {
                        'User-Agent': service.useragent,
                        'x-api-key': 'l7xx75e822925f184370b2e25170c5d5820a',
                        'Content-Type': 'application/json'
                        //'app-name': 'RJIL_JioTVPlus',
                        //'x-api-key': 'l7xx61fae40fe3af4c93b02792ae12422a82',
                        //appkey': '06758e99be484fca56fb'
                    },
                    //cacheTime: (service.caching==true?43200:0),
                    postdata: JSON.stringify({
                        "identifier": '' + (service.username) + '',
                        "password": '' + (service.password) + '',
                        "rememberUser": "T",
                        "upgradeAuth": "Y",
                        "returnSessionDetails": "T",
                        "deviceInfo": {
                            "consumptionDeviceName": "Jio",
                            "info": {
                                "type": "android",
                                "platform": {
                                    "name": "vbox86p",
                                    "version": "8.0.0"
                                },
                                "androidId": "6fcadeb7b4b10d77"
                            }
                        }
                    })


                }));
            } catch (err) {
                page.error('Seems API is down');

            }

            credentials.sso1 = auth.ssoToken;
            credentials.jtoken = auth.jToken;
            credentials.unid1 = auth.sessionAttributes.user.unique;
            credentials.userid = auth.sessionAttributes.user.uid;
            credentials.crmid = auth.sessionAttributes.user.subscriberId;
            credentials.subscriberId = auth.sessionAttributes.user.subscriberId;
            credentials.logindata = auth
            getacc()
        }

        return auth
    }

    function addoptiontobrowsecatchup(item, link, title, icon, playpath, group, language, category, tvgid) {

        item.addOptURL("Play Previous Shows of 7 Days", plugin.id + ':jio:browsecatchup:' + title + ':' + encodeURIComponent(tvgid), 'videocam');


    }

    //addOptionForAddingToMyFavorites(item, ch.channel_id, ch.channel_name, ch.logoUrl, playpath, ch.isCatchupAvailable, ch.channelLanguageId, ch.channelCategoryId, ch.channel_id);



    function addOptionForAddingToMyFavorites(item, link, title, icon, playpath, group, language, category, tvgid) {
        item.addOptAction("Add '" + title + "' to My Favorites", function () {
            var entry = JSON.stringify({
                link: encodeURIComponent(link),
                title: encodeURIComponent(title),
                icon: encodeURIComponent(icon),
                playpath: encodeURIComponent(playpath),
                group: encodeURIComponent(group),
                language: encodeURIComponent(language),
                category: encodeURIComponent(category),
                tvgid: encodeURIComponent(tvgid)

            });
         
            fav.data = JSON.stringify([entry].concat(eval(fav.data)));
            //  fav.data.push(entry);
            popup.notify("'" + title + "' has been added to My Favorites.", 2);
        }, "add");
    }

    function addOptionForRemovingFromMyFavorites(page, item, title, pos) {
        item.addOptAction("Remove '" + title + "' from My Favorites", function () {
            var list = eval(fav.data);
            popup.notify("'" + title + "' has been removed from My Favorites.", 2);
            list.splice(pos, 1);
            fav.data = JSON.stringify(list);
            page.flush();
            page.loading = false;
            // page.redirect(plugin.id + ':start');
            page.redirect(plugin.id + ':favourites');
        }, "exit_to_app");
    }

    function browseItems(page, query, count) {

        var offset = 1;
        page.entries = 0;

        function loader() {
            if (!offset) return false;
            page.loading = true;

            var args = {
                limit: 40,
                page: offset,
                key: service.key

            };
            for (var i in query)
                args[i] = unescape(query[i]);
            var is_fav = false;


            try {


                var c = JSON.parse(http.request(service.baseUrl + '/jioapi.php?', {
                    args: args,
                    caching: service.caching,
                    compression: true,
                    headers: {
                        'User-Agent': service.useragent,
                        'Connection': 'keep-alive'
                    },
                    cacheTime: (service.caching == true ? 3600 : 0)
                }));

            } catch (err) {
                page.error('Seems like API stopped working');
                return;
            }
            credentials.sub = c[0].category
            fav.chlimit = c[0].count
            page.metadata.logo = c.logo;
            page.loading = false;
            if (offset == 1 && page.metadata && c[0].count)
                page.metadata.title;
            for (var i in c) {
                addChannels(page, c[i]);
                if (count && page.entries > count) return offset = false;


            }
            offset++;
            return c && c[0].count > 0;


        }
        loader();

        page.asyncPaginator = loader;

        page.loading = false;
    }

    function browsecitems(page, value) {

        var offset = 1;
        page.entries = 0;

        function loader() {
            if (!offset) return false;
            page.loading = true;
            var c = getMatchingArrays('channelCategoryId', parseInt(value));
            count = c.count
            fav.chlimit = c.count
            page.metadata.logo = IMG_CATCHUP + c.logoUrl;
            page.loading = false;
            //  if 
            //(offset == 1 && page.metadata && c[0].count)
            // page.metadata.title;
            for (var i in c) {

                if (c[i].isCatchupAvailable === true && c[i].broadcasterId !== 6) {
                    addcatchup(page, c[i]);
                    if (count && page.entries > count) return offset = false;
                }


            }
            offset++;
            return c && c[0].count > 0;


        }
        loader();

        page.asyncPaginator = loader;

        page.loading = false;
    }

    function browseallItems(page, query) {
        var offset = 1;
        page.entries = 0;

        function loader() {
            page.loading = true;
            c = credentials.channels
            //page.metadata.logo =  c.logo;
            page.loading = false;
            if (offset == 1)
                for (var i in c) {
                    addChannels1(page, c[i]);
                }

            return c
        }
        loader();
        //page.paginator = loader;

        page.loading = false;
    }

    function browsesony(page, url) {
        var offset = 1;
        page.entries = 0;

        function loader() {
            page.loading = true;
            var args = {
                //limit: fav.chlimit,
                page: offset,
                key: service.key
            };
            try {
                var c = JSON.parse(http.request(url, {
                    args: args,
                  //  caching: service.caching,
                  //  cacheTime: (service.caching == true ? 3600 : 0),

                    compression: true,
                    headers: {
                        'User-Agent': service.useragent,
                        'Connection': 'keep-alive'
                    }
                }));
            } catch (err) {
                //page.error('Seems you are not subscribed');
                return;
            }
            page.metadata.logo = c.logo;
            page.loading = false;


          surfallhls(page, c)

            if (offset == 1)
                for (var i in c) {
                    addChannelsdirect(page, c[i]);
                }

            return c
        }
        loader();
        //page.paginator = loader;

        page.loading = false;
    }

    function parseM3UPlaylist(m3uContent) {
        function parseAttributes(attributeString) {
            var attributes = {};
            // Adjusted regex to handle spaces around the equals sign
            var regex = /([a-zA-Z0-9-]+)\s*=\s*"([^"]*)"/g;
            var match;
            while ((match = regex.exec(attributeString)) !== null) {
                attributes[match[1]] = match[2];
            }
            return attributes;
        }

        var lines = m3uContent.split('\n', '')
        var channels = [];

        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
                var attributePart = lines[i].substring(8).split(',')[0];
                var channelName = lines[i].substring(lines[i].indexOf(',') + 1).trim();
                var url = lines[i + 1] && lines[i + 1].trim();
                var attributes = parseAttributes(attributePart);

                // Pushing all attributes along with the channel name and link into one array
                var channelInfo = {
                    name: channelName,
                    uri: url,
                    // ...attributes
                };

                channels.push(channelInfo);

                i++; // Skip the URL line
            }
        }

        return channels;
    }

    function browsem3u(page, count) {
        var offset = 1;
        page.entries = 0;

        function loader() {
            page.loading = true;
            var args = {
                url: service.m3uplaylist,
                // page: offset,
                key: "gadha"
            };
            try {
                var c = JSON.parse(http.request('https://7bfd4144-28d9-4207-9df5-a3c61fbb5494-00-3qulg63mu94k.sisko.replit.dev/m2j.php?', {
                    args: args,
                    caching: service.caching,
                    cacheTime: (service.caching == true ? 3600 : 0),

                    compression: true,
                    headers: {
                        'User-Agent': OTTUA,
                        'Connection': 'keep-alive'
                    }
                }));
            } catch (err) {
                page.error('Seems you are not subscribed');
                return;
            }
            page.metadata.logo = c.logo;
            page.loading = false;
            if (offset == 1)
                for (var i in c) {
                    addChannelsdirect(page, c[i]);
                }
            var hlsm3u = http.request('http://jtad.coolpage.biz/tsky/jtvapi.php?sso=' + service.m3uplaylist + '&key=m3u', {
                method: "GET"
            })
            return c
        }
        loader();
        //page.paginator = loader;

        page.loading = false;
    }

    function browsecatchupitems(page, id, count) {
        var offset = 0;
        page.entries = 0;

        function loader() {
            // if (!offset) return false;
            page.loading = true;

            var args = {
                //limit: 40,
                // offset: offset,
                channel_id: id
            };
            var o = '-' + offset
            try {
                var c = JSON.parse(http.request('https://jiotvapi.cdn.jio.com/apis/v1.3/getepg/get?offset=' + o, {
                    args: args,
                    caching: service.caching,
                    compression: true,

                    cacheTime: (service.caching == true ? 3600 : 0)
                }));
            } catch (err) {
                page.error('Seems like API stopped working');
                return;
            }

            page.loading = false;
            var c = c.epg;
            for (var i in c) {
                addcatchupshows(page, c[i], c[i].channel_name);
                if (page.entries = 0) return offset = true;
            }
            offset++;
            return c;
        }
        loader();
        //page.asyncPaginator = loader;

        page.paginator = loader;
        page.loading = false;
    }

    function get_ts() {
        var date = new Date();
        return parseInt(date.getTime() / 1000);
    }

    function processStartPage(page) {
        getver()
        if (!service.tosaccepted)
            if (popup.message(tos, true)) service.tosaccepted = true;
        if (service.key !== accesskey);



        else {

            page.options.createAction('update', "Update JTV", function () {
                popup.notify("Updating, please wait for 10 seconds and click back ...", 10);
                page.redirect('https://github.com/alluringabhi/iptv1/raw/master/Logos/jtv.zip');
            });
            page.redirect(plugin.id + ':update');
            //  page.error("Terms & conditions are not accepted. Plugin is disabled or Check your key");

            return;
        }



        page.appendItem(plugin.id + ":favourites", "directory", {
            title: 'Favourites',
            icon: fav_logo,
        });


        page.appendItem("", "separator", {
            title: 'Jio Tv',
            icon: jiocinemalogo,
        });
        page.appendItem(plugin.id + ":login", "directory", {
            title: 'Login',
            icon: jiocinemalogo,
        });
        page.appendItem(plugin.id + ":logout", "directory", {
            title: 'Logout',
            icon: jiocinemalogo,
        });
        page.appendItem(plugin.id + ":list", "directory", {
            title: 'Categories',
            icon: jiocinemalogo,
        });
        page.appendItem(plugin.id + ":langi", "directory", {
            title: 'Languages',
            icon: jiocinemalogo,
        });
        page.appendItem(plugin.id + ":group", "directory", {
            title: 'Broadcastors',
            icon: jiocinemalogo,
        });
        page.appendItem(plugin.id + ":all", "directory", {
            title: 'All Channels',
            icon: jiocinemalogo,
        });
        page.appendItem(plugin.id + ":catchup", "directory", {
            title: 'Catchup',
            icon: jiocinemalogo,
        });

        page.appendItem("", "separator", {
            title: 'SuperStreams'
        });
        page.appendItem(plugin.id + ":tskycat", "directory", {
            title: 'Tatasky Categories',
            icon: tskylogo,
        });
      page.appendItem(plugin.id + ":mpddrm", "directory", { title: 'All Tatasky Channels',  icon: tskylogo, });
       // page.appendItem(plugin.id + ":atvdrm", "directory", { title: 'Airtel Channels',icon: "https://assets.airtel.in/static-assets/thanks/Reward%20page/Logo/Logo_3X.jpg",  });
       //  page.appendItem(plugin.id + ":slingtv", "directory", { title: 'Sling TV Channels', icon: "https://variety.com/wp-content/uploads/2015/01/sling-tv-logo.jpg",});
       //  page.appendItem(plugin.id + ":skycrave", "directory", {  title: 'Sky , Crave & Freeview Networks', icon: "https://www.cornergas.com/wp-content/uploads/2019/09/Untitled-design.png",});
       
        page.appendItem(plugin.id + ":ipl24", "directory", {
            title: 'IPL 2024',
            icon: "https://upload.wikimedia.org/wikipedia/en/1/19/TATA_IPL_2024_Logo.png",
        });
        
        
        
        
        //page.appendItem(plugin.id + ":discovery+", "directory", {  title: 'Discovery+', icon: "https://press.discoveryplus.com/wp-content/uploads/2021/01/discovery-plus-logo-vertical-white-wordmark.jpg", });
        //page.appendItem(plugin.id + ":category", "directory", {title: 'Category'   });
        //page.appendItem(plugin.id + ":language", "directory", {title: 'Language'});
        //page.appendItem(plugin.id + ":language", "directory", {title: 'Language'});
        // page.appendItem("", "separator", {title: 'More Channels'});
            
        
        page.appendItem(plugin.id + ":sftv", "directory", {
            title: 'Super TV',
            icon: logo,
        });
        page.appendItem(plugin.id + ":fancode", "directory", {
            title: 'Fancode Channels',
            icon: 'https://www.fancode.com/skillup-uploads/fc-web-logo/fc-logo-orange-block-bg.png',
        });
        page.appendItem(plugin.id + ":sony", "directory", {
            title: 'Extra Channels (HLS)',
            icon: logo,
        });
        page.appendItem(plugin.id + ":gitmpd", "directory", {
            title: 'Extra Channels (MPD)',
            icon: logo,
        });

        // page.appendItem(plugin.id + ":mag", "directory", { title: 'Mag links' });
        page.appendItem(plugin.id + ":refresh", "directory", {
            title: 'Refresh Playlists'
        });
        page.appendItem(plugin.id + ":update", "directory", {
            title: 'Update your plugin'
        });
        //page.appendItem(plugin.id + ":m3uplay", "directory", { title: 'Your M3U Playlist'});
       //  page.appendItem(plugin.id + ":alltsky", "directory", { title: 'All Tatasky'});
        //page.appendItem("", "separator", { title: 'Sports' });
        // browseItems(page, {  cat: 'Sports' }, 3);   
        //page.appendItem(plugin.id + ':sports', 'directory', { title: 'More ►' });






        //getplaylist();

        //getver()
        // runsurl();

        refreshtoken()

        page.loading = false;

        page.options.createAction('update', "Update JTV", function () {
            popup.notify("Updating, please wait for 10 seconds and click back ...", 10);
            page.redirect('https://github.com/alluringabhi/iptv1/raw/master/Logos/jtv.zip');
        });
    }

    function addChannels(page, ch, ch1, ch2) {
        var playpath = 'jiolive'
        var is_fav = false;
        var added = 0;
        var item = page.appendItem(plugin.id + ':jio:play:' + encodeURIComponent(ch.name) + ':' + encodeURIComponent(ch.tvgid) + ':' + encodeURIComponent(ch.logo) + ':' + playpath, "video", {
            title: new RichText(ch.name + ' ' + coloredStr(ch.language, orange), 50),
            icon: ch.logo,
            item: item,
            image: ch.logo,
            playpath: playpath,
            description: new RichText(
                coloredStr('\nBroadcaster: ', orange) + getbcastname((parseInt(ch.broadid))) +
                coloredStr('\nGroup: ', blue) + ch.group +
                coloredStr('\nLanguage: ', orange) + ch.language +
                coloredStr('\nCategory: ', green) + ch.category +
                coloredStr('\nChannel id: ', red) + ch.tvgid +
                coloredStr('\nCatchup Available: ', blue) + ch.catchup +
                coloredStr('\nquality: ', red) + ch.quality
            )
        });
        //   addOptionForAddingToMyFavorites(item, ch.tvgid, ch.name, ch.logo, playpath, ch.group, ch.language, ch.category, ch.tvgid);

        addoptiontobrowsecatchup(item, ch.tvgid, ch.name, ch.logo, playpath, ch.group, ch.language, ch.category, ch.tvgid);
        // item.addOptURL("Play in movianDRM",getjsonmpd(ch.tvgid),"play_arrow");	
        page.entries++;
    }

    function addChannelsdirect(page, ch, ch1, ch2) {
        var playpath = 'live'
        var is_fav = false;
        var added = 0;
        var description = "subtitle";
        var item = page.appendItem(plugin.id + ':play:' + encodeURIComponent(ch.name) + ':' + encodeURIComponent(ch.link) + ':' + encodeURIComponent(ch.logo) + ':' + playpath, "video",
            // var item = page.appendItem("movianDRM:hls:"+ encodeURIComponent(ch.link) + encodeURIComponent(ch.name)+':'  +':'  + encodeURIComponent(ch.logo)+':'+playpath, "video",
            //var item = page.appendItem(page.redirect("movianDRM:dash:"+encodeURIComponent(ch.link)+"::"+encodeURIComponent(ch.name)+"::::sub_title="+encodeURIComponent(description)+"::::artwork_uri="+ encodeURIComponent(ch.logo)+"::::subtitle_formatting=custom18-aaaaaa000000bf0064::close"), "video",
            {
                title: new RichText(ch.name, 50),
                icon: ch.logo,
                item: item,
                image: ch.logo,
                playpath: playpath
            });
        addOptionForAddingToMyFavorites(item, ch.link, ch.name, ch.logo, playpath);
        var mDRM_single = [];
        mDRM_single.push({
            uri: ch.link,
            artwork_uri: ch.logo,
            name: encodeURIComponent(ch.name)
            // extension: "m3u8",
            //mime_type: "application/x-mpegURL"

        });

        var drm_link = 'movianDRM:hls:' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));

        item.addOptURL("Play in movianDRM", drm_link, "play_arrow");

        page.entries++;
    }

    function addhlschannels(page, ch, ch1, ch2) {
      
        var playpath = 'live'
        var is_fav = false;
        var added = 0;
        var description = "subtitle";
        var item = page.appendItem(plugin.id + ':play:' + encodeURIComponent(ch.name) + ':' + encodeURIComponent(ch.uri) + ':' + encodeURIComponent(ch.logo) + ':' + playpath, "video",
            // var item = page.appendItem("movianDRM:hls:"+ encodeURIComponent(ch.link) + encodeURIComponent(ch.name)+':'  +':'  + encodeURIComponent(ch.logo)+':'+playpath, "video",
            //var item = page.appendItem(page.redirect("movianDRM:dash:"+encodeURIComponent(ch.link)+"::"+encodeURIComponent(ch.name)+"::::sub_title="+encodeURIComponent(description)+"::::artwork_uri="+ encodeURIComponent(ch.logo)+"::::subtitle_formatting=custom18-aaaaaa000000bf0064::close"), "video",
            {
                title: new RichText(ch.name, 50),
                icon: ch.logo,
                item: item,
                image: ch.logo,
                playpath: playpath
            });
        addOptionForAddingToMyFavorites(item, ch.link, ch.name, ch.logo, playpath);
        var mDRM_single = [];
        mDRM_single.push({
            uri: ch.uri,
            artwork_uri: ch.logo,
            name: encodeURIComponent(ch.name)
            // extension: "m3u8",
            //mime_type: "application/x-mpegURL"

        });

        var drm_link = 'movianDRM:hls:' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));

        item.addOptURL("Play in movianDRM", drm_link, "play_arrow");

        page.entries++;
    }

    function addChannelsdirect1(url) {

        var mDRM = [];

        var c = JSON.parse(http.request(url, {
            compression: true,
            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive'
            }
        }));

        var mDRM = c
        return mDRM;
    }

    function addChannelsdirectmpd(page, ch, ch1, ch2) {

        var mDRM = [];

        var args = {
            //limit: fav.chlimit,
            //  url: service.m3u,
            // page: offset,
            key: service.key
        };
        // var c = http.request('https://rftv.wtf/tp/RedjoyTP.m3u', {   
        var c = JSON.parse(http.request(service.baseUrl + '/mpd.php?', {
            //  var c = JSON.parse(http.request(service.baseUrl+'/b.json?', {    
            args: args,
            caching: service.caching,
            compression: true,
            cacheTime: (service.caching == true ? 3600 : 0),

            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive'
            }

        }));

        var mDRM = c

        return mDRM
    }

    function getkeys(query) {
        if (credentials.keys == "") {

            var c = JSON.parse(http.request("https://raw.githubusercontent.com/alluringabhi/iptv1/master/Logos/silver.json", {
                //  args: args,
                //caching: service.caching, 
               // cacheTime: (service.caching == true ? 3600 : 0),
                compression: true,
                headers: {
                    'User-Agent': service.useragent,
                    'Connection': 'keep-alive'
                }
               
            }));
            credentials.keys = c;
         
            return c;
        } else {

            return credentials.keys
        }

    }


    function gettatampd2(id) {
        var c = JSON.parse(http.request("https://kong-tatasky.videoready.tv/content-detail/pub/api/v2/channels/" + id, {
            caching: service.caching,
            compression: true,
            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive'
            },
            cacheTime: (service.caching == true ? 3600 : 0)
        }));

        c = c.data.detail.dashWidewinePlayUrl


        return c;
    }

    function checkuri(str) {
        if (str.indexOf('mpd') !== -1) {
            return 'dash';
        } else {
            return 'hls';
        }
    }
    function checkmime(str) {
        if (str.indexOf('mpd') !== -1) {
            return 'application/dash+xml';
        } else {
            return 'application/x-mpegURL';
        }
    }


   
    function checkm3u8(str) {
        if (str.indexOf('m3u8') !== -1) {
            return 'hls:';
        } else {
            return '';
        }
    }


    function checklic(str) {
        if (str.indexOf('http') !== -1) {
            return 'widevine';
        } else {
            return 'clearkey';
        }
    }

    function validlic(str,kid,k) {
        if (str.indexOf('widevine') !== -1 || str.indexOf('http')!== -1)  {
            return str;
        } else {
            return kid+':'+k;
        }
    }



    function addChannelstata(page, ch, drmscheme) {
        var playpath = 'tatalive'
        var is_fav = false;
        var added = 0;
       var uri = gettatampd(ch.channelMeta.id)
        var mime = checkuri(uri)
        var samples = [];
        var headers_single = [];

        headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);

        samples.push({
            headers: JSON.stringify(headers_single),
            subtitle_formatting: subtitle_format,
        });
        samples.push({
            uri: uri,
            name: encodeURIComponent(ch.channelMeta.name),
            artwork_uri: encodeURIComponent('https://tatalogo.pages.dev/' + ch.channelMeta.id + '.png'),
            drm_scheme: drmscheme,
            drm_license_uri: service.keylink + ch.channelMeta.id,
            //mime_type: "application/x-mpegURL",
            sub_title: ch.meta[0].title + '  ' + ch.meta[0].description
        });
        var drm_link = 'movianDRM:' + mime + ':' + encodeURIComponent('json://' + JSON.stringify(samples));
       
        var item = page.appendItem(drm_link, 'video',


            {
                title: new RichText(ch.channelMeta.name + ' ', 50),
                // icon: 'https://tatalogo.pages.dev/'+ch.channelMeta.id+'.png',
                icon: ch.meta[0].boxCoverImage,
                // backdrops: [  {url: ch.meta[0].boxCoverImage}],
                item: item,
                //   image: 'https://tatalogo.pages.dev/'+ch.channelMeta.id+'.png',
                playpath: playpath,
                description: new RichText(ch.meta[0].title +
                    coloredStr('\nChannel no: ', orange) + (ch.channelMeta.channelNumber) +
                    coloredStr('\nDescription :    ', blue) + (ch.meta[0].description))

            });


        addOptionForAddingToMyFavorites(item, uri, ch.channelMeta.name, 'https://tatalogo.pages.dev/' + ch.channelMeta.id + '.png', playpath, ch.group, ch.language, service.keylink + ch.channelMeta.id + "&key", 'clearkey');

        //addoptiontobrowsecatchup(item, ch.tvgid, ch.name, encodeURIComponent('https://tatalogo.pages.dev/'+ch.channelMeta.id+'.png'), playpath, ch.group, ch.language, ch.category, ch.tvgid);	
        // item.addOptURL("Play in movianDRM",getjsonmpd(ch.tvgid),"play_arrow");	
        page.entries++;
    }

    function addalltatachannels(page, ch, ch1, ch2) {
        var playpath = 'tatalive'
        var is_fav = false;
        var added = 0;
        var item = page.appendItem(plugin.id + ':tata:play:' + encodeURIComponent(ch.title) + ':' + encodeURIComponent(ch.id) + ':' + encodeURIComponent(ch.boxCoverImage) + ':' + playpath, "video", {
            title: new RichText(ch.title + ' ', 50),
            icon: ch.boxCoverImage,
            item: item,
            image: ch.boxCoverImage,
            playpath: playpath,
            description: new RichText(
                coloredStr('\nChannel id: ', orange) + (ch.id)

            )
        });
        addOptionForAddingToMyFavorites(item, gettatampd(ch.id), ch.title, encodeURIComponent(ch.boxCoverImage), playpath, ch.group, ch.language, service.keylink + ch.id, 'clearkey');

        //addoptiontobrowsecatchup(item, ch.tvgid, ch.name, ch.logo, playpath, ch.group, ch.language, ch.category, ch.tvgid);	
        // item.addOptURL("Play in movianDRM",getjsonmpd(ch.tvgid),"play_arrow");	
        page.entries++;
    }

    function addtataplay(page, ch, ch1, ch2) {
        var c = JSON.parse(http.request('https://api.npoint.io/02f97c158364e052a956', { //
            // args: args,
            caching: service.caching,
            compression: true,
            cacheTime: (service.caching == true ? 3600 : 0),

            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive'
            }

        }));

        var mDRM_single = [];
        for (var i in c) {
            mDRM_single.push({
                drm_scheme: c[i].drm_scheme,
                drm_license_uri: convertkey(c[i].drm_license_uri),
                artwork_uri: c[i].artwork_uri,
                uri: c[i].uri,
                name: encodeURIComponent(c[i].name),
                //  extension: "mpd",
                //mime_type: "application/dash+xml"

            });
        }


      
        return mDRM_single
    }
    function addmpdnpoint(page, url, ch1, ch2) {
        var c = JSON.parse(http.request(decodeURIComponent(url), { //
            // args: args,
            caching: service.caching,
            compression: true,
            cacheTime: (service.caching == true ? 3600 : 0),

            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive'
            }

        }));

        var mDRM_single = [];
        for (var i in c) {
            mDRM_single.push({
                drm_scheme: c[i].drm_scheme,
                drm_license_uri: convertkey(c[i].drm_license_uri),
                artwork_uri:c[i].artwork_uri,
                uri: c[i].uri,
                name: encodeURIComponent(c[i].name),
                extension:	checkextension(c[i].uri), // mpd or m3u8
	            mime_type:	checkmime(c[i].uri), // application/dash+xml or application/x-mpegURL

            });
        }


       
        return mDRM_single
    }
    function addmpdsftv(page, url) {


        try {
        var c = JSON.parse(http.request(decodeURIComponent(url), { //
            // args: args,
          //  caching: service.caching,
            compression: true,
         //   cacheTime: (service.caching == true ? 3600 : 0),

            headers: {
                'User-Agent': service.useragent
               // 'Connection': 'keep-alive'
            }

        }));
        
    } catch (err) {
        return
    }

        var mDRM_single = [];
        for (var i in c) {
            var lic = ""
            if (c[i].hasOwnProperty('lice') ) { lic = c[i].lice }
          
                 kid = c[i].keyid
                 k =  c[i].key
                 lic = lic.split("|")
                 lic= lic[0]
                 drmlice =  validlic (lic,kid,k)
                 drm_scheme =  checklic(drmlice),
                 ext = checkextension(c[i].dashWidewinePlayUrl)
                 mime = checkmime(ext)
              
            mDRM_single.push({
                drm_scheme: checklic(drmlice),
                drm_license_uri: convertkey(drmlice),
                artwork_uri:c[i].logo,
                uri: c[i].dashWidewinePlayUrl,
                name: encodeURIComponent(c[i].channelName),
                extension: ext,
                mime_type: mime

            });
        }

       
        return mDRM_single
    }
    function addfancode() {
        var c = JSON.parse(http.request(decodeURIComponent('https://raw.githubusercontent.com/byte-capsule/FanCode-Hls-Fetcher/main/Fancode_hls_m3u8.Json'), { 
            compression: true,
            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive'
            }

        }));
            c = c.channels
           
        var mDRM_single = [];
        for (var i in c) {
            mDRM_single.push({
               // drm_scheme: checklic(drmlice),
              //  drm_license_uri: convertkey(drmlice),
                artwork_uri:c[i].team_1_flag,
                uri: c[i].stream_link,
                name: encodeURIComponent(c[i].event_name),
                extension:	checkextension(c[i].stream_link), // mpd or m3u8
	            mime_type:	checkmime(c[i].stream_link), // application/dash+xml or application/x-mpegURL

            });
        }

        
        return mDRM_single
    }
    function addtplay(page, name, id, logo) {

        var mDRM_single = [];
        //   getkeys(); 
        //    var clearkeys = gettatakey('ts'+id, credentials.keys)
        var drmlink = gettatampd(id);
        //    var clearkeys = clearkeys.split('s0u0p0e0r')
        //    var idkey = clearkeys[1];
        //    var key = clearkeys[0];

        //    if  (!service.apikey) {
        //         var drm_license_uri = "https://vercel-php-clearkey-hex-base64-json.vercel.app/api/results.php?keyid=" + idkey + '&key=' + key 

        //          }
        //          else {//         }

        var drm_license_uri = service.keylink + id + "&key"



        mDRM_single.push({
            drm_scheme: 'clearkey',
            drm_license_uri: drm_license_uri,
            artwork_uri: 'https://tatalogo.pages.dev/' + id + '.png',
            uri: drmlink,
            name: encodeURIComponent(name)
            // extension: "mpd",
            //mime_type: "application/dash+xml"

        });
     
        return mDRM_single
    }

    function addcatchup(page, ch, ch1, ch2) {

        var is_fav = false;
        var added = 0;
        //  var item = page.appendItem(plugin.id + ':play:'+ encodeURIComponent(ch.name)+':'  + encodeURIComponent(ch.link)+':'  + encodeURIComponent(ch.logo), "video", 
        var item = page.appendItem(plugin.id + ':jio:browsecatchup:' + ch.channel_name + ":" + encodeURIComponent(ch.channel_id), "video", {
            title: new RichText(ch.channel_name, 5000),
            icon: IMG_CATCHUP + ch.logoUrl,
            item: item,
            image: IMG_CATCHUP + ch.logoUrl
        });
        // addOptionForAddingToMyFavorites(item, ch.link, ch.name, ch.logo, playpath);

        // page.metadata.glwview =  Plugin.path + "list.view";
        page.entries++;
    }

    function timeampm(time) { // Take a time in 24 hour format and format it in 12 hour format
        var time_part_array = time.split(":");
        var ampm = 'AM';

        if (time_part_array[0] >= 12) {
            ampm = 'PM';
        }

        if (time_part_array[0] > 12) {
            time_part_array[0] = time_part_array[0] - 12;
        }

        // formatted_time = time_part_array[0] + ':' + time_part_array[1] + ':' + time_part_array[2] + ' ' + ampm;
        formatted_time = time_part_array[0] + ':' + time_part_array[1] + " " + ampm;
        return formatted_time;
    }

    function getjson2org(url) {
        //var s = JSON.parse(http.request('https://jiotvapi.media.jio.com/playback/apis/v1/geturl', { 
        var s = JSON.parse(http.request('https://tv.media.jio.com/apis/v2.0/getchannelurl/getchannelurl?langId=6&userLanguages=All', {

            method: "POST",
            debug: service.debug,
            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive',
                'langId': ' 6',
                'subscriberId': credentials.subscriberId,
                'lbcookie': '1',
                'uniqueid': credentials.unid1,
                'ssotoken': credentials.sso1,
                'os': service.apiplatform,
                'deviceid': credentials.devid,
                'usergroup': 'tvYR7NSNn7rymo3F',
                "versioncode": "289",
                "dm": "ZUK ZUK Z1"
            },
            postdata: "channel_id=" + url + "&stream_type=Seek&"
        }))

        if (service.quality > +39) {

            playlink = s.bitrates.auto
        } else if (service.quality > +29) {
            playlink = s.bitrates.high
        } else if (service.quality > +19) {
            playlink = s.bitrates.medium
        } else if (service.quality > +9) {
            playlink = s.bitrates.low
        } else {
            //page.error("error")
            playlink = s.result
        }
        //playlink = s.result
        credentials.cookie = playlink.match(/__([^&]+)/g)
        //credentials.cookie = credentials.cookie.replace("m3u8?","")
        return playlink

    }

    function getjson2(url) {


        if (login.method == "password") {

            var s = JSON.parse(http.request('https://tv.media.jio.com/apis/v2.0/getchannelurl/getchannelurl?langId=6&userLanguages=All', {

                method: "POST",
                debug: service.debug,
                headers: {
                    'User-Agent': service.useragent,
                    'Connection': 'keep-alive',
                    'langId': ' 6',
                    'subscriberId': credentials.subscriberId,
                    'lbcookie': '1',
                    'uniqueid': credentials.unid1,
                    'ssotoken': credentials.sso1,
                    'os': service.apiplatform,
                    'deviceid': credentials.devid,
                    'usergroup': 'tvYR7NSNn7rymo3F',
                    "versioncode": "289",
                    "dm": "ZUK ZUK Z1"
                },
                postdata: "channel_id=" + url + "&stream_type=Seek&"
            }))
        } else {


            var s = JSON.parse(http.request('https://jiotvapi.media.jio.com/playback/apis/v1/geturl', {

                method: "POST",
                debug: service.debug,
                headers: {
                    'Host': 'jiotvapi.media.jio.com',
                    'langId': ' 6',
                    'User-Agent': 'jiotv/407 CFNetwork/1335.0.3 Darwin/21.6.0',
                    // 'subscriberId': credentials.logindata.subscriberId,
                    // 'uniqueid': credentials.logindata.sessionAttributes.user.unique,
                    'devicetype': 'phone',
                    //  'channelid': url,
                    'appversion': ' 4.6.8',
                    //  'ssotoken': credentials.logindata.ssoToken ,
                    'accesstoken': credentials.refreshedtoken,
                    //  'os': service.apiplatform,

                    'versioncode': '407',
                    'usertype': 'JIO',
                    'isott': ' false',
                    //'deviceid': credentials.logindata.deviceId,
                    // 'x-platform': 'iosmobile', 
                    'usergroup': 'tvYR7NSNn7rymo3F',
                    'appversioncode': '407',
                    'Accept-Language': 'en-IN,en-GB;q=0.9,en;q=0.8',
                    'Connection': ' keep-alive',
                    'Accept': '*/*',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept-Encoding': 'gzip, deflate, br',
                    //   'username': credentials.logindata.sessionAttributes.user.uid


                },
                postdata: "channel_id=" + url + "&stream_type=Seek&"
            }))

        }

        if (service.quality > +39) {

            playlink = s.bitrates.auto
        } else if (service.quality > +29) {
            playlink = s.bitrates.high
        } else if (service.quality > +19) {
            playlink = s.bitrates.medium
        } else if (service.quality > +9) {
            playlink = s.bitrates.low
        } else {
            //page.error("error")
            playlink = s.result
        }
        //playlink = s.result
        credentials.cookie = playlink.match(/__([^&]+)/g)
        //credentials.cookie = credentials.cookie.replace("m3u8?","")
        return playlink

    }

    function add_header(headers, scope, name, value) {
        if (!name || !value) return headers;

        var suffix;

        if (scope == "drm" || scope == "clr")
            suffix = "_" + scope;
        else
            suffix = "";

        var tmp = {};
        tmp["hdr" + suffix] = name;
        tmp["val" + suffix] = value;

        headers.push(tmp);
        return headers;
    }

    function getjsonmpd(url) {
        //var s = JSON.parse(http.request('https://jiotvapi.media.jio.com/playback/apis/v1/geturl', { 



        var drmheaders = {
            'User-Agent': service.useragent,
            'Connection': 'keep-alive',


            'langId': ' 6',
            //'User-Agent': ' JioTV.Plus/1.0.6.9 (Linux;Android 7.1.2) ExoPlayerLib/2.11.4',
            'subscriberId': credentials.subscriberId,
            'lbcookie': '1',
            // 'devicetype': 'stb',
            //'channelid': ' 291',
            'uniqueid': credentials.unid1,
            // 'appversion': ' 3.5.1',
            'ssotoken': credentials.sso1,
            'os': 'android',
            // 'srno': ' 220209291016',
            // 'app-name': ' RJIL_JioTVPlus',
            // 'x-api-key': ' l7xx61fae40fe3af4c93b02792ae12422a82',
            //  'appkey': ' 06758e99be484fca56fb',
            // 'versioncode': ' 324',
            // 'Content-Length': ' 94',
            // 'isott': ' false',
            'deviceid': credentials.devid,
            //'Connection': ' keep-alive',
            'usergroup': 'tvYR7NSNn7rymo3F',
            //'Accept-Language': ' en-IN,en-GB;q=0.9,en;q=0.8',
            // 'Accept': ' */*',
            //'Content-Type': ' application/x-www-form-urlencoded',
            "versioncode": "289",
            "dm": "ZUK ZUK Z1"
        }

        var s = JSON.parse(http.request('https://tv.media.jio.com/apis/v2.0/getchannelurl/getchannelurl?langId=6&userLanguages=All', {

            method: "POST",
            debug: service.debug,
            headers: drmheaders,
            postdata: "channel_id=" + url + "&stream_type=Seek&"
        }))


        //page.error("error")
        playlink = s.mpd.result
        key = s.mpd.key
        cookie = playlink.match(/__([^&]+)/g)


        var mDRM_single = []
        var headers = []
        var headers = drmheaders
        headers = add_header(headers, "all", "Cookie", cookie)

        mDRM_single.push({
            headers: JSON.stringify(headers),
            subtitle_formatting: subtitle_format,
        });


        mDRM_single.push({
            uri: playlink,
            drm_scheme: "widevine",
            drm_license_uri: key,
            extension: 'mpd', // mpd or m3u8
            mime_type: 'application/dash+xml' // application/dash+xml or application/x-mpegURL
            //name: encodeURIComponent("Widevine DASH (MP4, H264) HD (cenc)"), 
            //sub_title: "movianDRM Test Sample"
        });

        var drm_link = 'movianDRM:hls:' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
        //playlink = s.result
        // credentials.cookie = playlink.match (/__([^&]+)/g)
        //credentials.cookie = credentials.cookie.replace("m3u8?","")
        return mDRM_single

    }

    function remcolon(a) {

        var newtime = a.replace(":", "")
        var newtime = newtime.replace(":", "")
        return newtime;
    }

    function convertEpochToDate(epoch) {
        const date = new Date(epoch);
        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    function addcatchupshows(page, ch, ch1, ch2) {
        // postdata: "end=20231210T194400&channel_id="+url+"&showtime="+showtime+"&programId=231211144000&stream_type=Catchup&srno=20231211&begin=20231210T183000&"
        //tvgid, showtime, programid, srno, begin, end   programid is srno.  srno is date 
        var is_fav = false;
        var added = 0;
        var showtime = remcolon(ch.showtime)

        //var showtime = showtime.replace(":", "")
        // var showtime = showtime.replace(":", "")
        var sno = ch.srno
       
        var re = /[0-9]{6}/g
        var sno = re.exec(sno)
        var sno = "20" + sno[0]
      
        var begin = sno + "T" + remcolon(ch.showtime)
        // var begin = epochToJsDate(ch.startEpoch)
       
        var end = sno + "T" + remcolon(ch.endtime)
        var item = page.appendItem(plugin.id + ':jio:catchuplay:' + encodeURIComponent(ch.channel_id) + ':' + encodeURIComponent(showtime) + ':' + encodeURIComponent(ch.srno) + ':' + encodeURIComponent(sno) + ':' + encodeURIComponent(begin) + ':' + encodeURIComponent(end), "video",

            {
                title: new RichText(ch.showname + ' ' + coloredStr(timeampm(ch.showtime), orange) + "  " + coloredStr(convertEpochToDate((ch.startEpoch)), orchid)),

                icon: IMG_CATCHUP_SHOWS + ch.episodeThumbnail,

                backdrops: [{
                    url: IMG_CATCHUP_SHOWS + ch.episodePoster
                }],
                //  

                // [ {url:IMG_CATCHUP_SHOWS + ch.episodePoster}, {url: IMG_CATCHUP_SHOWS + ch.episodePoster} ],


                item: item,
                // image: IMG_CATCHUP_SHOWS +ch.episodePoster,
                description: ch.description,
                description: new RichText(
                    coloredStr('\n', blue) + ch.description +
                    coloredStr('\nDate: ', green) + convertEpochToDate(ch.startEpoch) +
                    coloredStr('\nStart: ', orange) + timeampm(ch.showtime) + coloredStr(' End: ', green) + timeampm(ch.endtime) +
                    coloredStr('\nEpisode no: ', red) + ch.episode_num +
                    coloredStr('\nKeyword: ', blue) + ch.keywords
                )


            });

        page.metadata.background = IMG_CATCHUP_SHOWS + ch.episodePoster;
        addOptionForAddingToMyFavorites(item, ch.tvgid, ch.showname, ch.logo, ch.quality, ch.group, ch.language, ch.category, ch.tvgid);
        //  addoptionforwatchingallepisodes(item,ch.tvgid,ch.showname,ch.showId)   

        page.entries++;
    }
//tvgid, showtime, programid, srno, begin, end
    function getcatchupjson(url, showtime, programid, srno, begin, end) {
        if (login.method == "password") {
        //tvgid, showtime, programid, srno, begin, end   programid is srno.  srno is date 
        // var s = JSON.parse(http.request('https://jiotvapi.media.jio.com/playback/apis/v1/geturl', { 
        var s = JSON.parse(http.request('https://tv.media.jio.com/apis/v2.0/getchannelurl/getchannelurl?langId=6&userLanguages=All', {

            method: "POST",
            debug: service.debug,
            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive',


                'langId': ' 6',
                //'User-Agent': ' JioTV.Plus/1.0.6.9 (Linux;Android 7.1.2) ExoPlayerLib/2.11.4',
                'subscriberId': credentials.subscriberId,
                'lbcookie': '1',
                // 'devicetype': 'stb',
                //'channelid': ' 291',
                'uniqueid': credentials.unid1,
                // 'appversion': ' 3.5.1',
                'ssotoken': credentials.sso1,
                'os': service.apiplatform,
                // 'srno': ' 220209291016',
                'app-name': ' RJIL_JioTVPlus',
                'x-api-key': ' l7xx61fae40fe3af4c93b02792ae12422a82',
                'appkey': ' 06758e99be484fca56fb',
                // 'versioncode': ' 324',
                // 'Content-Length': ' 94',
                // 'isott': ' false',
                'deviceid': credentials.devid,
                //'Connection': ' keep-alive',
                'usergroup': 'tvYR7NSNn7rymo3F'
                //'Accept-Language': ' en-IN,en-GB;q=0.9,en;q=0.8',
                // 'Accept': ' */*',
                //'Content-Type': ' application/x-www-form-urlencoded',
                // "versioncode": "289",
                //"dm" : "ZUK ZUK Z1"
            },
            // postdata: "end=20231210T194400&channel_id="+url+"&showtime="+showtime+"&programId=231211144000&stream_type=Catchup&srno=20231211&begin=20231210T183000&"
            postdata: "srno=" + srno + "&showtime=" + showtime + "&stream_type=Catchup&programId=" + programid + "&channel_id=" + url + "&begin=" + begin + "&end=" + end + "&"
            //postdata: "channel_id="+url+"&showtime="+showtime+"&programId="+programid+"&stream_type=Catchup&srno="+get_ts()+"&"
        }))
    } else {

        var s = JSON.parse(http.request('https://jiotvapi.media.jio.com/playback/apis/v1/geturl', {

        method: "POST",
        debug: service.debug,
        headers: {
            'Host': 'jiotvapi.media.jio.com',
            'langId': ' 6',
            'User-Agent': 'jiotv/407 CFNetwork/1335.0.3 Darwin/21.6.0',
            'devicetype': 'phone',
            'appversion': ' 4.6.8',
            'ssotoken':credentials.sso1,
            'accesstoken': credentials.refreshedtoken,
            'os' : "ios",
            'versioncode': '407',
            'x-platform': 'iosmobile',
            'usertype': 'JIO',
            'isott': ' false',
            'usergroup': 'tvYR7NSNn7rymo3F',
            'appversioncode': '407',
            'Accept-Language': 'en-IN,en-GB;q=0.9,en;q=0.8',
            'Connection': ' keep-alive',
            'Accept': '*/*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'gzip, deflate, br',
        },
        postdata: "end=" + end + "&channel_id=" + url + "&showtime=" + showtime + "&programId=" + programid + "&stream_type=Catchup" +"&srno=" + srno + "&begin=" + begin + "&"
                
    }))








    }


        if (service.quality > +39) {

            playlink = s.bitrates.auto
        } else if (service.quality > +29) {
            playlink = s.bitrates.high
        } else if (service.quality > +19) {
            playlink = s.bitrates.medium
        } else if (service.quality > +9) {
            playlink = s.bitrates.low
        } else {
            //page.error("error")
            playlink = s.result
        }
        //playlink = s.result
        credentials.cookie = ""
        //   credentials.cookie = playlink.match (/([^&]+)/g)
        //credentials.cookie = credentials.cookie.replace("m3u8?","")
        return playlink

    }

    function browsechannels(page, value, key, filter) {
        //  

        var offset = 1;
        page.entries = 0;

        function loader() {
            if (!offset) return false;
            page.loading = true;


            var is_fav = false;


            var c = getMatchingArrays(key, parseInt(value));



            var c = c.sort(function (a, b) {
                //  if (a.channelLanguageId === b.channelLanguageId && a.isHD == true) {return b.isHD - a.isHD;}

                if (a.channelLanguageId === b.channelLanguageId && a.isHD == true) {
                    return b.isHD - a.isHD;
                }
                return a.channelLanguageId - b.channelLanguageId
            });






            //   var c = c.sort(function(a, b){return b.isHD - a.isHD});
            //  var d = sortByKey(c,'channelLanguageId' )
            // var c = sortJsonByHd(c)    
            var count = c.length
            

            // credentials.sub = c[0].category
            fav.chlimit = c.count
            page.metadata.logo = c.logo;
            page.loading = false;
            if (offset == 1 && page.metadata && c.count)
                page.metadata.title;
            for (var i in c) {
                addChannels1(page, c[i]);
                if (count && page.entries > count) return offset = false;


            }
            offset++;
            return c && c.count > 0;


        }
        loader();

        page.asyncPaginator = loader;

        page.loading = false;
    }

    function browsemagchannels(page, value, key, filter) {
        //  

        var offset = 1;
        page.entries = 0;

        function loader() {
            if (!offset) return false;
            page.loading = true;


            var is_fav = false;


            var c = getmatcharray(key, value, pcache.magchannels);


            //   var c = c.sort(function(a, b){return b.isHD - a.isHD});
            //  var d = sortByKey(c,'channelLanguageId' )
            // var c = sortJsonByHd(c)    
            var count = c.length
           

            // credentials.sub = c[0].category
            fav.chlimit = c.count
            page.metadata.logo = c.logo;
            page.loading = false;
            if (offset == 1 && page.metadata && c.count)
                page.metadata.title;
            for (var i in c) {
                addmagchannels(page, c[i]);
                if (count && page.entries > count) return offset = false;


            }
            offset++;
            return c && c.count > 0;


        }
        loader();

        page.asyncPaginator = loader;

        page.loading = false;
    }

    function browsechannelsbylang(page, value, key, filter) {
        //  

        var offset = 1;
        page.entries = 0;

        function loader() {
            if (!offset) return false;
            page.loading = true;


            var is_fav = false;


            var c = getMatchingArrays(key, parseInt(value));



            var c = c.sort(function (a, b) {
                //  if (a.channelLanguageId === b.channelLanguageId && a.isHD == true) {return b.isHD - a.isHD;}

                if (a.channelCategoryId === b.channelCategoryId && a.isHD == true) {
                    return b.isHD - a.isHD;
                }
                return a.channelCategoryId - b.channelCategoryId
            });






            //   var c = c.sort(function(a, b){return b.isHD - a.isHD});
            //  var d = sortByKey(c,'channelLanguageId' )
            // var c = sortJsonByHd(c)    
            var count = c.length
          

            // credentials.sub = c[0].category
            fav.chlimit = c.count
            page.metadata.logo = c.logo;
            page.loading = false;
            if (offset == 1 && page.metadata && c.count)
                page.metadata.title;
            for (var i in c) {
                addChannels1(page, c[i]);
                if (count && page.entries > count) return offset = false;


            }
            offset++;
            return c && c.count > 0;


        }
        loader();

        page.asyncPaginator = loader;

        page.loading = false;
    }

    function addChannels1(page, ch, ch1, ch2) {
        var playpath = 'jiolive'
        var is_fav = false;
        var added = 0;
        var item = page.appendItem(plugin.id + ':jio:play:' + encodeURIComponent(ch.channel_name) + ':' + encodeURIComponent(ch.channel_id) + ':' + encodeURIComponent(IMG_CATCHUP + ch.logoUrl) + ':' + playpath, "video", {
            title: new RichText(ch.channel_name + ' ' + coloredStr(getlangname(ch.channelLanguageId), orange), 50),
            icon: IMG_CATCHUP + ch.logoUrl,
            item: item,
            image: IMG_CATCHUP + ch.logoUrl,
            playpath: playpath,
            description: new RichText(
                coloredStr('\nChannel no: ', red) + ch.channel_order + coloredStr('\nChannel id: ', red) + ch.channel_id +
                coloredStr('\nCatchup Available: ', blue) + ch.isCatchupAvailable +
                coloredStr('\nLanguage: ', orange) + getlangname(ch.channelLanguageId) +
                coloredStr('\nCategory: ', green) + getcatname(ch.channelCategoryId) +
                coloredStr('\nBroadcaster: ', blue) + getbcastname(ch.broadcasterId) +
                coloredStr('\nHD Channel: ', green) + ch.isHD
            )
        });

        addOptionForAddingToMyFavorites(item, ch.channel_id, ch.channel_name, IMG_CATCHUP + ch.logoUrl, playpath, ch.isCatchupAvailable, getlangname(ch.channelLanguageId), getcatname(ch.channelCategoryId), ch.channel_id);

        addoptiontobrowsecatchup(item, ch.channel_id, ch.channel_name, IMG_CATCHUP + ch.logoUrl, playpath, ch.isCatchupAvailable, getlangname(ch.channelLanguageId), getcatname(ch.channelCategoryId), ch.channel_id);
        // item.addOptURL("Play in movianDRM",getjsonmpd(ch.tvgid),"play_arrow");	
        page.entries++;
    }



    function getplaylist(query) {

        if (!credentials.channel) {
            var c = JSON.parse(http.request(service.channels, {
                //  args: args,
                caching: service.caching,
                compression: true,
                headers: {
                    'User-Agent': service.useragent,
                    'Connection': 'keep-alive'
                },
                cacheTime: (service.caching == true ? 3600 : 0)
            }));
            credentials.channels = c.result;

            var d = JSON.parse(http.request('https://api.npoint.io/f88b815e9d6e03b96bdf', {
                //  args: args,
                caching: service.caching,
                compression: true,
                headers: {
                    'User-Agent': service.useragent,
                    'Connection': 'keep-alive'
                },
                cacheTime: (service.caching == true ? 3600 : 0)
            }));

            pcache.tskychannels = d;


            return c.result;
        } else {

            return credentials.channels & pcache.tskychannels
        }




    }

    function getskylist(query) {
        var c = JSON.parse(http.request('https://tm.tapi.videoready.tv/portal-search/pub/api/v1/channels?limit=1200', {
            //  args: args,
            caching: service.caching,
            compression: true,
            headers: {
                'User-Agent': service.useragent,
                'Connection': 'keep-alive'
            },
            cacheTime: (service.caching == true ? 3600 : 0)
        }));
        credentials.skychannels = c.data.list;

        return c.result;
    }

    function getcatname(catid) {

        for (var i = 0; i < category.length; i++) {
            if (category[i][0] === catid.toString()) {
                return category[i][1];
            }
        }

        return "None";
    }

    function gettatampd(catid) {
        if (pcache.tskychannels == "") {
            getplaylist()
            tataskyplaylist = pcache.tskychannels

            for (var i = 0; i < tataskyplaylist.length; i++) {
                if (tataskyplaylist[i].id === catid) {

                    var url = tataskyplaylist[i].uri

                    return url;
                }
            }

            return "https://github.com/bbc/exoplayer-testing-samples/raw/master/app/src/androidTest/assets/streams/files/bigbuckbunny/bigbuckbunny.mpd";

        } else {
            tataskyplaylist = pcache.tskychannels

            for (var i = 0; i < tataskyplaylist.length; i++) {
                if (tataskyplaylist[i].id === catid) {
                    return tataskyplaylist[i].uri;
                }
            }

            return "https://github.com/bbc/exoplayer-testing-samples/raw/master/app/src/androidTest/assets/streams/files/bigbuckbunny/bigbuckbunny.mpd";
        }
    }

    function getlangname(catid) {
        for (var i = 0; i < langmap.length; i++) {
            if (langmap[i][0] === catid.toString()) {
                return langmap[i][1];
            }
        }

        return "Language not found";
    }

    function getbcastname(catid) {
        for (var i = 0; i < broadcaster.length; i++) {
            if (broadcaster[i][0] === catid.toString()) {
                return broadcaster[i][1];
            }
        }

        return "Broadcaster not found";
    }

    function getMatchingArrays(key, value) {



        var matchingArrays = [];
        data = credentials.channels
        for (var i = 0; i < data.length; i++) {
            if (data[i][key] === value) {
                matchingArrays.push(data[i]);
            }
        }
        return matchingArrays
    }


    function getmatcharray(key, value, data) {


        var matchingArrays = [];
        //data = credentials.channels
        for (var i = 0; i < data.length; i++) {
            if (data[i][key] === value) {
                matchingArrays.push(data[i]);
            }
        }
        return matchingArrays
    }

    function getmatchingmpd(key, value, data) {



        var matchingArrays = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i][key] === value) {
                matchingArrays.push(data[i]);
            }
        }
        return matchingArrays
    }

    function sortJsonByHd(json) {
        var trueValues = [];
        var falseValues = [];

        for (var key in json) {
            if (json[key].isHd === true) {
                trueValues.push(json[key]);
            } else {
                falseValues.push(json[key]);
            }
        }

        return trueValues.concat(falseValues);
    }

    function gettatakey(catid, keydata) {
        for (var i = 0; i < keydata.length; i++) {
            if (keydata[i].id === catid) {
                return keydata[i].epg;
            }
        }

        return "Broadcaster not found";
    }

    function browsetskyitems(page, query, count) {

        var offset = 1;
        page.entries = 0;

        function loader() {
            if (!offset) return false;
            page.loading = true;

            var args = {
                // limit: 40,
                page: offset,
                key: service.key

            };
            for (var i in query)
                args[i] = unescape(query[i]);
            var is_fav = false;


            try {


                var c = JSON.parse(http.request('https://kong-tatasky.videoready.tv/content-detail/pub/api/v2/live-tv-genre/channels?', {
                    args: args,
                    // caching: service.caching,
                    // cacheTime: (service.caching==true?3600:0),
                    compression: true,
                    headers: {
                        'User-Agent': service.useragent,
                        'Connection': 'keep-alive'
                    }


                }));

            } catch (err) {
                page.error('Seems like API stopped working');
                return;
            }
            //  credentials.sub = c[0].category

            var c = c.data.liveChannels
            var count = c.length
            // var count = c.count
      
            //  page.metadata.logo = c.logo;
            page.loading = false;
            if (offset == 1)
                page.metadata.title;
            var drmall = []
            var headers_single = [];

            headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
            drmall.push({
                headers: JSON.stringify(headers_single),
                subtitle_formatting: subtitle_format,
            });
       

            for (var i = 0; i < c.length; i++)
                drmall.push({
                    uri: gettatampd(c[i].channelMeta.id),
                    name: encodeURIComponent(c[i].channelMeta.name) +  '--'+ c[i].meta[0].title,
                    artwork_uri: encodeURIComponent('https://tatalogo.pages.dev/' + c[i].channelMeta.id + '.png'),
                    drm_scheme: "clearkey",
                    drm_license_uri: service.keylink + c[i].channelMeta.id + '&key',
                    //mime_type: "application/x-mpegURL",
                    sub_title: c[i].meta[0].title + ' : ' + c[i].meta[0].description
                });


            var drm_all = 'movianDRM:dash:' + encodeURIComponent('json://' + JSON.stringify(drmall));
            // page.openurl(drm_all);
            page.appendItem(drm_all, 'directory', {
                icon: logo,
                title: "Surf all Channels "
            });

            for (var i in c) {


                addChannelstata(page, c[i], service.drmscheme);
                if (count && page.entries > count) return offset = false;


            }
            offset++;
            return c && c.count > 0;


        }
        loader();

        page.asyncPaginator = loader;

        page.loading = false;
    }

    function browsealltskyitems(page, query) {
        var offset = 0;
        page.entries = 0;

        function loader() {
            // if (!offset) return false;
            page.loading = true;

            var args = {
                limit: 1000
                // offset: offset,
                //channel_id: id
            };
            if (pcache.tsky == "") {
                try {
                    var c = JSON.parse(http.request('https://tm.tapi.videoready.tv/portal-search/pub/api/v1//channels?', {
                        args: args,
                        caching: service.caching,
                        compression: true,

                        cacheTime: (service.caching == true ? 3600 : 0)
                    }));
                } catch (err) {
                    page.error('Seems like API stopped working');
                    return;
                }



                page.loading = false;
                var c = c.data.list;
                pcache.tsky = c;
            } else {

                c = pcache.tsky
            }
            for (var i in c) {
                addalltatachannels(page, c[i]);
                if (page.entries = 0) return offset = true;
            }
            offset++;
            return c;
        }
        loader();
        //page.asyncPaginator = loader;

        page.paginator = loader;
        page.loading = false;
    }


    //page routes
    new page.Route(plugin.id + ":tcat:(.*)", function (page, cat) {

        setPageHeader(page, cat);
        page.flush();


        page.metadata.glwview = res_path + "list.view";

        browsetskyitems(page, {
            'genre': cat
        });
        page.loading = false;
    });
    new page.Route(plugin.id + ":cati:(.*)", function (page, cat) {

        setPageHeader(page, getcatname(cat));
        browsechannels(page, cat, 'channelCategoryId', 'channelLanguageId');
        page.loading = false;
    });

    new page.Route(plugin.id + ":langi:(.*)", function (page, lang) {

        setPageHeader(page, getlangname(lang));
        browsechannelsbylang(page, lang, 'channelLanguageId', 'channelCategoryId');
        page.loading = false;
    });

    new page.Route(plugin.id + ":cat:(.*)", function (page, cat) {
        setPageHeader(page, cat);

        browseItems(page, {
            cat: cat
        });
        page.loading = false;
    });
    new page.Route(plugin.id + ":catchup:cat:(.*)", function (page, cat) {
        setPageHeader(page, getcatname(cat));
        page.flush()
        // page.metadata.glwview = res_path + "video.view";
        // browsechannels (page, cat, 'channelLanguageId', 'channelCategoryId' );

        browsecitems(page, cat);


        page.loading = false;
    });
    new page.Route(plugin.id + ":category", function (page, cat) {
        setPageHeader(page, 'Category', jiocinemalogo);
        for (var i in category) {
            var item = page.appendItem(plugin.id + ":cat:" + category[i][0], "directory", {
                title: category[i][1],
                icon: IMG_PUBLIC + category[i][2],
            });
        }
        page.loading = false;
    });
    new page.Route(plugin.id + ":jio:browsecatchup:(.*):(.*)", function (page, name, tvgid) {

        setPageHeader(page, name);
        page.flush();
        page.metadata.glwview = res_path + "list.view";

        browsecatchupitems(page, tvgid);
        page.loading = false;
    });
    new page.Route(plugin.id + ":lang:(.*)", function (page, lang) {
        setPageHeader(page, lang);
        browseItems(page, {
            lang: lang
        });
        page.loading = false;
    });
    new page.Route(plugin.id + ":language", function (page, lang) {
        setPageHeader(page, 'Language');
        for (var i in language) {
            var item = page.appendItem(plugin.id + ":lang:" + language[i], "directory", {
                title: language[i]
            });
        }
        page.loading = false;
    });
    new page.Route(plugin.id + ":set:(.*)", function (page, set) {
        setPageHeader(page, getbcastname(set));
        browsechannels(page, set, 'broadcasterId');
        page.loading = false;
    });
    new page.Route(plugin.id + ":group", function (page, set) {
        setPageHeader(page, 'Broadcastors');
        for (var i in broadcaster) {
            var item = page.appendItem(plugin.id + ":set:" + broadcaster[i][0], "directory", {
                title: broadcaster[i][1]
            });
        }
        page.loading = false;
    });

    function e64(sBase64) {
        return String(Duktape.enc('base64', sBase64))
    };
    new page.Route(plugin.id + ":login", function (page) {
        setPageHeader(page, 'Login Page');
        page.appendItem((plugin.id + ":loginbypassword"), "list", {
            title: 'Login by Password',
            icon: jiocinemalogo


        });
        page.appendItem((plugin.id + ":loginbyotp"), "list", {
            title: 'Login by OTP (Experimental unstable)',
            icon: jiocinemalogo

        });
        // getsso1();
        //getplaylist();
        //credentials.loggedin = true
        //page.flush();
        //popup.notify('Congratulations Successfully logged in to Jiotv', 4);
        page.loading = false;
        //page.redirect(plugin.id + ':start');

    });
    new page.Route(plugin.id + ":logout", function (page) {
        setPageHeader(page, 'Logout Page');
        credentials.sso1 = "";
        credentials.unid1 = "";

        page.flush();
        popup.notify('Logged Out', 4);
        page.loading = false;
        page.redirect(plugin.id + ':start');

    });
    new page.Route(plugin.id + ":favourites", function (page) {
        setPageHeader(page, 'Favourites');
        // checksub(page);
        page.options.createAction('cleanfav', "Remove all Favourites", function () {
            fav.data = []
            popup.notify("Cleared Favourites", 3);
            page.redirect(plugin.id + ':start');
        });
        fill_fav(page)
        page.loading = false;
    });
    new page.Route(plugin.id + ":all", function (page) {
        //checksub(page);
        setPageHeader(page, 'All channels');
        browseallItems(page);
        page.loading = false;

    });
    new page.Route(plugin.id + ":catchup", function (page, cat) {
        setPageHeader(page, 'Catchup');
        page.flush();
        page.type = "directory";
        //page.contents = item;
        for (var i in category) {
            var item = page.appendItem(plugin.id + ":catchup:cat:" + category[i][0], "directory", {
                title: category[i][1],
                icon: IMG_PUBLIC + category[i][2],

            });
        }
        page.loading = false;
    });
    new page.Route(plugin.id + ":sony", function (page) {
        setPageHeader(page, 'Live Channels');
        browsesony(page, 'https://raw.githubusercontent.com/alluringabhi/iptv1/master/Logos/gold.json')
        page.loading = false;

    });

    new page.Route(plugin.id + ":ipl24", function (page) {
        setPageHeader(page, 'IPL 2024');
        for (var i in dynalink) {
            browsesony(page, unescape(dynalink[i]))
        }
        page.loading = false;

    });
    new page.Route(plugin.id + ":discovery", function (page) {
        setPageHeader(page, 'Discovery+');
        browsesony(page, 'https://prod-ipl-live.pages.dev/Discovery.json')
        page.loading = false;

    });
    new page.Route(plugin.id + ":updateexecute", function (page) {
        page.redirect('https://github.com/alluringabhi/iptv1/raw/master/Logos/jtv.zip')
        popup.notify("Updating, please wait for 10 seconds and click back ...", 10);
        page.flush()
        page.loading = false;

    });
    new page.Route(plugin.id + ":update", function (page) {
        setPageHeader(page, 'Plugin Update');
        page.appendItem("", "separator", {
            title: 'Wrong key or you need update, Update your plugin by below option',
            icon: jiocinemalogo,
        });
        page.appendItem((plugin.id + ":updateexecute"), "list", {
            title: 'Press here to update Your Plugin',
            icon: logo
        });

        page.options.createAction('update', "Update JTV", function () {
            popup.notify("Updating, please wait for 10 seconds and click back ...", 10);
            page.redirect('https://github.com/alluringabhi/iptv1/raw/master/Logos/jtv.zip');
        });





        page.loading = false;

    });


    //https://vercel-php-clearkey-hex-base64-json.vercel.app/api/results.php?keyid=2f27d053d83d5284859cdd8b26bb17e2&key=022f0e4a9239ca11881091a5f5c2d91d
    function convertkey(string) {
        if (string.indexOf("http") !== -1) {
            return string;
        } else {
            var split = string.split(":");
            var license = 'https://vercel-php-clearkey-hex-base64-json.vercel.app/api/results.php?keyid=' + split[0] + '&key=' + split[1]
            return license;
        }
    }

    function checkextension(string) {
        if (string.indexOf(".mpd") !== -1) {
            return "mpd";
        } else {
            
            return "hls";
        }
    }



    new page.Route(plugin.id + ":gitmpd", function (page) {
        setPageHeader(page, 'More Streams');

        var mDRM_single = [];
        var headers_single = [];

        headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
        mDRM_single.push({
            headers: JSON.stringify(headers_single),
            subtitle_formatting: subtitle_format,
        }); 
        var samples = addChannelsdirect1('https://raw.githubusercontent.com/alluringabhi/iptv1/master/Logos/diamond.json');

      //  surfall(page, samples)
        for (var i = 0; i < samples.length; i++) {
           
            var lic = samples[i].drm_license_uri
            var drmscheme = checklic(lic)
            var mDRM_single = [];
            var drm_license = samples[i].drm_license_uri
            var drm_license_uri = convertkey(drm_license)
            mDRM_single.push({
                uri: samples[i].uri,
                drm_scheme: drmscheme,
                drm_license_uri: drm_license_uri,
                name: samples[i].name,
                artwork_uri: samples[i].artwork_uri
            });
     
            var drm_link = 'movianDRM:dash:' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));

            page.appendItem(drm_link, 'video', {
                icon: decodeURIComponent(samples[i].artwork_uri),
                title: decodeURIComponent(samples[i].name)
            });
        }
        page.loading = false;

    });
    new page.Route(plugin.id + ":mpddrm", function (page) {
        page.flush()
        setPageHeader(page, 'Tata Sky Channels');
        var samples = addmpdnpoint(page, encodeURIComponent('https://api.npoint.io/02f97c158364e052a956'));
       // var samples = addtataplay();

         surfall(page, samples)
        for (var i = 0; i < samples.length; i++) {

            var uri = samples[i].uri
            var mime = checkuri(uri)
            var mDRM_single = [];
            var headers_single = [];
            headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
            mDRM_single.push({
                headers: JSON.stringify(headers_single),
                subtitle_formatting: subtitle_format,
            }); 
            mDRM_single.push(samples[i]);
            //  var drm_link = 'movianDRM:dash:'+encodeURIComponent('json://'+JSON.stringify(mDRM_single));
            var drm_link = 'movianDRM:' + mime + ':' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
            item = page.appendItem(drm_link, 'video', {
                icon: decodeURIComponent(samples[i].artwork_uri),
                title: decodeURIComponent(samples[i].name)
            });
            addOptionForAddingToMyFavorites(item, samples[i].uri, decodeURIComponent(samples[i].name), samples[i].artwork_uri, "tatalive", "", "", samples[i].drm_license_uri, samples[i].drm_scheme);
        }

        page.loading = false;

    });
    new page.Route(plugin.id + ":atvdrm", function (page) {
        page.flush()
        setPageHeader(page, 'Airtel Xtream Play');
        var samples = addmpdnpoint(page, encodeURIComponent('https://api.npoint.io/14f72ca7b299c8b289d8'));
        surfall(page, samples)


        for (var i = 0; i < samples.length; i++) {

            var uri = samples[i].uri
            var mime = checkuri(uri)
            var mDRM_single = [];
            var headers_single = [];
            headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
            mDRM_single.push({
                headers: JSON.stringify(headers_single),
                subtitle_formatting: subtitle_format,
            }); 
            mDRM_single.push(samples[i]);
            //  var drm_link = 'movianDRM:dash:'+encodeURIComponent('json://'+JSON.stringify(mDRM_single));
            var drm_link = 'movianDRM:' + mime + ':' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
            item = page.appendItem(drm_link, 'video', {
                icon: decodeURIComponent(samples[i].artwork_uri),
                title: decodeURIComponent(samples[i].name)
            });
            addOptionForAddingToMyFavorites(item, samples[i].uri, decodeURIComponent(samples[i].name), samples[i].artwork_uri, "tatalive", "", "", samples[i].drm_license_uri, samples[i].drm_scheme);
        }

        page.loading = false;

    });
    new page.Route(plugin.id + ":slingtv", function (page) {
        page.flush()
        setPageHeader(page, 'Sling TV');
        var samples = addmpdnpoint(page, encodeURIComponent('https://api.npoint.io/9fdd3ce80f146ffa455f'));
        surfall(page, samples)


        for (var i = 0; i < samples.length; i++) {

            var uri = samples[i].uri
            var mime = checkuri(uri)
            var mDRM_single = [];
            var headers_single = [];
            headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
            mDRM_single.push({
                headers: JSON.stringify(headers_single),
                subtitle_formatting: subtitle_format,
            }); 
            mDRM_single.push(samples[i]);
            //  var drm_link = 'movianDRM:dash:'+encodeURIComponent('json://'+JSON.stringify(mDRM_single));
            var drm_link = 'movianDRM:' + mime + ':' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
            item = page.appendItem(drm_link, 'video', {
                icon: decodeURIComponent(samples[i].artwork_uri),
                title: decodeURIComponent(samples[i].name)
            });
            addOptionForAddingToMyFavorites(item, samples[i].uri, decodeURIComponent(samples[i].name), samples[i].artwork_uri, "tatalive", "", "", samples[i].drm_license_uri, samples[i].drm_scheme);
        }

        page.loading = false;

    });

    new page.Route(plugin.id + ":skycrave", function (page) {
        page.flush()
        setPageHeader(page, 'Sky Network, Crave & Freeview Network');
        var samples = addmpdnpoint(page, encodeURIComponent('https://api.npoint.io/e050950a37f7d4f88012'));
        surfall(page, samples)


        for (var i = 0; i < samples.length; i++) {

            var uri = samples[i].uri
            var mime = checkuri(uri)
            var mDRM_single = [];
            var headers_single = [];
            headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
            mDRM_single.push({
                headers: JSON.stringify(headers_single),
                subtitle_formatting: subtitle_format,
            }); 
            mDRM_single.push(samples[i]);
            //  var drm_link = 'movianDRM:dash:'+encodeURIComponent('json://'+JSON.stringify(mDRM_single));
            var drm_link = 'movianDRM:' + mime + ':' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
            item = page.appendItem(drm_link, 'video', {
                icon: decodeURIComponent(samples[i].artwork_uri),
                title: decodeURIComponent(samples[i].name)
            });
            addOptionForAddingToMyFavorites(item, samples[i].uri, decodeURIComponent(samples[i].name), samples[i].artwork_uri, "tatalive", "", "", samples[i].drm_license_uri, samples[i].drm_scheme);
        }

        page.loading = false;

    });


 


 var oldsftv = [
   ["https://rftv.wtf/tp/channels.json", "Tata Play"],
    ["https://rftv.wtf/tp/atv.json", "Airtel Extreme"],
    ["https://rftv.wtf/tp/jtv.json", "Jio TV (Worldwide)"],
   ["https://api.npoint.io/539b6c98652391424038", "Sun Networks"],
   // ["https://rftv.wtf/tp/sling.json", "Sling TV"],
    ["https://rftv.wtf/tp/myastro.json", "Astro Play"],
    ["https://rftv.wtf/tp/dia.json", "Dialog TV"],
    ["https://rftv.wtf/tp/amzn.json", "Amazon Networks"],
   // ["https://rftv.wtf/tp/sky.json", "Sky Networks"],
  //  ["https://api.npoint.io/40747e7bde07339d2054", ""],
   ["https://rftv.wtf/tp/hs.json", "Hotstar"],
  // ["https://rftv.wtf/tp/astro.json", "Astro Play"],
    
]



    new page.Route(plugin.id + ":sftv", function (page, set) {
        setPageHeader(page, 'SFTV');
        for (var i in sftv) {
            var item = page.appendItem(plugin.id + ":sftv:" + sftv[i][0], "directory", {
                title: sftv[i][1]
            });
        }
        page.loading = false;
    });


    new page.Route(plugin.id + ":sftv:(.*)", function (page, url) {
       // page.flush()
        setPageHeader(page, 'SFTV');
       
         samples = addmpdsftv(page, encodeURIComponent(url));
       
         surfall(page, samples)

        for (var i = 0; i < samples.length; i++) {

            var uri = samples[i].uri
            var mime = checkuri(uri)
            var mDRM_single = [];
            var headers_single = [];
            headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
            headers_single = add_header(headers_single, "all", "Connection", "Keep-Alive");
            mDRM_single.push({
                headers: JSON.stringify(headers_single),
                subtitle_formatting: subtitle_format,
            }); 
            mDRM_single.push(samples[i]);
            
            var drm_link = 'movianDRM:' + mime + ':' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
            item = page.appendItem(drm_link, 'video', {
                icon: decodeURIComponent(samples[i].artwork_uri),
                title: decodeURIComponent(samples[i].name)
            });
            addOptionForAddingToMyFavorites(item, samples[i].uri, decodeURIComponent(samples[i].name), samples[i].artwork_uri, "tatalive", "", "", samples[i].drm_license_uri, samples[i].drm_scheme);
        }

        page.loading = false;

    });
  
    new page.Route(plugin.id + ":fancode", function (page, url) {
        // page.flush()
         setPageHeader(page, 'Fancode' );
        
          samples = addfancode();
         for (var i = 0; i < samples.length; i++) {
             var uri = samples[i].uri
             var mime = checkuri(uri)
             var mDRM_single = [];
             var headers_single = [];
             headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
             mDRM_single.push({
                 headers: JSON.stringify(headers_single),
                 subtitle_formatting: subtitle_format,
             }); 
             mDRM_single.push(samples[i]);
             
             var drm_link = 'movianDRM:' + mime + ':' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
             item = page.appendItem(drm_link, 'video', {
                 icon: decodeURIComponent(samples[i].artwork_uri),
                 title: decodeURIComponent(samples[i].name)
             });
             addOptionForAddingToMyFavorites(item, samples[i].uri, decodeURIComponent(samples[i].name), samples[i].artwork_uri, "tatalive", "", "", samples[i].drm_license_uri, samples[i].drm_scheme);
         }
 
         page.loading = false;
 
     });

    new page.Route(plugin.id + ":m3uplay", function (page) {
        setPageHeader(page, 'M3U Playlist');
        browsem3u(page)

        page.loading = false;

    });
    new page.Route(plugin.id + ":sports", function (page) {
        setPageHeader(page, 'All Sports Channels');
        browseItems(page, {
            cat: 'Sports'
        });
        page.loading = false;
    });
    new page.Route(plugin.id + ":start", function (page) {
        setmainPageHeader(page, plugin.synopsis);
        if (movianDRM == DRM_NOT_INSTALLED) {
            popup.message('<font size="4" color="#FF1010">movianDRM is not installed</font><br><hr><br><font size="3" color="#C0C0C0">Click [OK] to open Movian DRM install page (Settings/General/DRM Upgrade)<br><hr></font>', true);
            page.redirect("showtime:upgradedrm");
            return;
        } else if (movianDRM == DRM_NOT_SUPPORTED) {
            popup.message('<font size="4" color="#FF1010">movianDRM is not supported on your platform</font><br><hr><br><font size="3" color="#C0C0C0">Android 5.1 and Movian 5.0.752 or later versions required<br><hr></font>', true);
            return;
        }

        console.log(". Your device id:" + Core.deviceId + ".  Your key:" + service.key + "  Current DRM version: " + movianDRM_ver);
        //addOptions(page);
        processStartPage(page);
    });
    new page.Route(plugin.id + ":jio:play:(.*):(.*):(.*):(.*)", function (page, name, tvgid, logo, playpath) {
        if (!credentials.logindata.ssoToken)

        {
            page.error(error);
        } else {
            page.loading = false;
            no_subtitle_scan = true;
            page.type = 'video';
            page.source = "videoparams:" + JSON.stringify({
                title: decodeURIComponent(name),
                name: decodeURIComponent(name),
                icon: decodeURIComponent(logo),
                playpath: playpath,
                // quality : decodeURIComponent(quality),
                canonicalUrl: plugin.id + ':jio:play:' + decodeURIComponent(name) + ':' + tvgid,
                sources: [{
                    url: "hls:" + getjson2(tvgid)
                }],

                no_subtitle_scan: true
            });
        }
    });
    new page.Route(plugin.id + ":play:(.*):(.*):(.*):(.*)", function (page, name, link, logo, playpath) {
        page.loading = false;
        no_subtitle_scan = true;
        page.type = 'video';
        page.source = "videoparams:" + JSON.stringify({
            title: decodeURIComponent(name),
            name: decodeURIComponent(name),
            icon: decodeURIComponent(logo),
            playpath: playpath,
            // quality : decodeURIComponent(quality),
            canonicalUrl: plugin.id + ':play:' + decodeURIComponent(name) + ':' + decodeURIComponent(link) + ':' + decodeURIComponent(logo) + ':' + playpath,
            sources: [{
                url: checkm3u8(link) + holdlive((decodeURIComponent(link)))
            }],
            no_subtitle_scan: true

        });
       
       


    });






    new page.Route(plugin.id + ":jio:catchuplay:(.*):(.*):(.*):(.*):(.*):(.*)", function (page, tvgid, showtime, programid, srno, begin, end) {
        if (!credentials.sso1)

        {
            page.error(error);
        }
        //tvgid, showtime, programid, srno, begin, end   programid is srno.  srno is date 
        else {
            page.loading = false;
            no_subtitle_scan = true;
            page.type = 'video';
            page.source = "videoparams:" + JSON.stringify({
                // title: decodeURIComponent(name),
                //   name:decodeURIComponent(name),
                // icon : decodeURIComponent(logo),
                // quality : decodeURIComponent(quality),
                canonicalUrl: plugin.id + ':jio:catchuplay:' + tvgid,
                sources: [{
                    url: "hls:" + getcatchupjson(tvgid, showtime, programid, srno, begin, end)
                }],
                no_subtitle_scan: no_subtitle_scan
            });
        }
    });
    new page.Route(plugin.id + ":tata:play:(.*):(.*):(.*):(.*)", function (page, name, link, logo, playpath) {
        page.flush()
        setPageHeader(page, 'Play Page');
        var samples = addtplay(page, decodeURIComponent(name), link, logo, playpath);


        for (var i = 0; i < samples.length; i++) {
            var mDRM_single = [];
            var headers_single = [];
            headers_single = add_header(headers_single, "all", "User-Agent", "Dalvik/2.1.0 (Linux; U; Android 9; Tata Sky Binge Plus Build/PTT1.200914.001)");
            mDRM_single.push({
                headers: JSON.stringify(headers_single),
                subtitle_formatting: subtitle_format,
            }); 
            mDRM_single.push(samples[i]);
            var drm_link = 'movianDRM:dash:' + encodeURIComponent('json://' + JSON.stringify(mDRM_single));
            page.appendItem(drm_link, 'video', {
                icon: decodeURIComponent(samples[i].artwork_uri),
                title: decodeURIComponent(samples[i].name)
            });
        }

        page.loading = false;

    });
    new page.Route(plugin.id + ":list", function (page, query) {
        setPageHeader(page, 'Category', jiocinemalogo);
        for (var i in category) {
            var item = page.appendItem(plugin.id + ":cati:" + category[i][0], "directory", {
                title: category[i][1],
                icon: IMG_PUBLIC + category[i][2],
            });
        }
        page.loading = false;
    });




    new page.Route(plugin.id + ":tskycat", function (page, query) {
        //  if (credentials.loggedin === true); else {page.error("Login your account with your username and passwords"); return; }





        setPageHeader(page, 'Category', jiocinemalogo);
        for (var i in tskycat) {
            var item = page.appendItem(plugin.id + ":tcat:" + tskycat[i], "directory", {
                title: tskycat[i],
                // icon: IMG_PUBLIC + category[i][2],
            });
        }
        page.loading = false;
    });
    new page.Route(plugin.id + ":langi", function (page, query) {
        setPageHeader(page, 'Languages', jiocinemalogo);
        for (var i in langmap) {
            var item = page.appendItem(plugin.id + ":langi:" + langmap[i][0], "directory", {
                title: langmap[i][1],
                //icon: IMG_PUBLIC + category[i][2],
            });
        }
        page.loading = false;
    });
    new page.Route(plugin.id + ":alltsky", function (page) {
        setPageHeader(page, 'All Tata Sky Channels');
        browsealltskyitems(page);
        page.loading = false;

    });
    new page.Route(plugin.id + ":refresh", function (page) {
        setPageHeader(page, 'Refresh');
        credentials.channels = ""
        credentials.keys = ""
        pcache.tsky = []
        pcache.tskykeys = []
        pcache.keys = []
        page.loading = false;
        page.flush();
        getplaylist();
        refreshtoken()
        popup.notify('Refreshed the Data', 5);
        page.loading = false;
        page.redirect(plugin.id + ':start');

    });



    function holdlive(url) {

        while (true) {

            var res = false;
            var s = {
                method: "GET",
                // debug: this.options().debug,
                //headers:{'Range': 'bytes=0-'},
                noFail: true,
                noFollow: true,
            };

            try {
                res = http.request(url, s);
            } catch (e) {
                
            }

           if(!res) break;
            if (res.statuscode == 302) {
                if (res.headers.hasOwnProperty('Location')) {
                    url = res.headers['Location'];
                } else {
                    break;
                }
            }
            if (res.statuscode == 200) {
                return url;
            }
        }

        return res;

    }

    function refreshtoken() {

        while (true) {

        var c = false

        try {
            
        var c = JSON.parse(http.request("https://auth.media.jio.com/tokenservice/apis/v1/refreshtoken?langId=6", {
            debug: true,
            method: "POST",
            noFollow: true,
            noFail: true,
            headers: {
                'accesstoken': credentials.refreshedtoken,
                'uniqueId': credentials.unid1,
                'devicetype': 'phone',
                'versionCode': '331',
                'User-Agent': service.useragent,
                'Content-Type': 'application/json'
            },
            postdata: JSON.stringify({
                appName: "RJIL_JioTV",
                deviceId: credentials.devid,
                refreshToken: credentials.logindata.refreshToken
            }),

        })) }
        catch (e) {
         
        }

      
        if (c.statuscode == 200) {
            return c.authToken;
        }
        else {
            break;
        }

    }
        credentials.refreshedtoken = c.authToken

        return c.authToken

    }

    new page.Route(plugin.id + ':loginbyotp', function (page) {

        page.metadata.title = "Login using OTP";
        // popup.notify("OTP has been send to your number", 3)

      //login.data = getssobyotp()
      login.data = {
        "analyticsId": "bab4be14-9a52-40ec-adbc-3b650bc56c20",
        "authToken": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImF1dGhUb2tlbklkIjoiMTkxMmExZjItODFmNS00NGE1LTg5OGEtMTY4NzE5YTQyMzNmIiwidXNlcklkIjoiYmFiNGJlMTQtOWE1Mi00MGVjLWFkYmMtM2I2NTBiYzU2YzIwIiwidXNlclR5cGUiOiJKSU8iLCJvcyI6ImlvcyIsImRldmljZVR5cGUiOiJwaG9uZSIsImFjY2Vzc0xldmVsIjoiOSIsImRldmljZUlkIjoiNTFEREVEMUFBQkZBNEIzNTg0MEExNjI5ODNGREI5ODkiLCJleHRyYSI6IntcIm51bWJlclwiOlwiU0ttOVR1N3dwZ1dzOWNXSU5WeTdTbE1FWTYvTktVdjhldUIwK0Q5RjdGdCtlK1FRNTBrZjEybz1cIixcInBsYW5kZXRhaWxzXCI6e1wiUGFja2FnZUluZm9cIjpbe1wicGxhbmlkXCI6XCIxXCIsXCJzdWJzY3JpcHRpb25zdGFydFwiOjE3MDAzOTUxNzIsXCJzdWJzY3JpcHRpb25lbmRcIjoxNzMzMjA2ODQ4LFwicGxhbnR5cGVcIjpcInByZW1pdW1cIixcImJ1c2luZXNzVHlwZVwiOlwiamlvXCIsXCJub3Rlc1wiOlwiXCJ9XX0sXCJqVG9rZW5cIjpcIjI3NmE4M2VhNWVhMGFmYWIzMTY1YWY5NDU5ZWQ2YjYxLmQ2ZjZkNDE0MmI5ODE3ZjU4MmU0YzJiNDQ3OGJmZDQ5NWU5ZGY5MzExNDg4MTQwYThmNDU3ZGRjYzViODYxZjkzMThkYjM4NjBjMDllMDNhZjMxZjgyZmIwZmYwNjc1OThmMWRjOTU3Zjg0NDIyYWY4MWI0NTM2MGZhNTRkMWZjNWE0ZDJjZDVmMzIzZjZjZjkzNzJlYWM3MWExMzk3OWMwOTY0OGY3YjkxYTIwOTVkZGIzNjFhYWY2NTYzZjhlNjliMTZiODUwYjE0MmFiNjI1ZWJlMTkxMjdiMjU4ZTAwY2RhZWU2OWU3NjNkYzk2MWRmN2RhMmM1NmZmZjhkMjIzMGNkZjA0Y2NjOGJiMmY1ZTljZTZjYTAwOWVhZDg2OWRkZmRkZmRmNTk2NGJiZDQyY2YwNTA1M2I3MGMwNDM4YjM2Y2UyMjkyYzE5OTJkYmMwY2VlNGIzMGNiNWM4NjNkZGI5ODFlNWNmNjMwNzgwYzZkOGY4YzEzOGQwNDQyOTk1YjczNTVmZTE1ZTYyMTE2MTFhMjg4ZTI2NDhiNzNlNDgwMThlYWQxMDBhZTM3YjY4M2M3NzQ0ZjJlNDlmMDQzN2I5ZWNmMjhhODBlZTZjZmYwZDk5NTg4ZDVhYWY0YjBhNjIwODFkMzRiZTM1MmJhZGFlOTVmMGNiYTQ5YzNhZTJlZWQ3MzAyMmQ0MDU2ZWRlZTRkZWM3OGI3MjQ2YjRjZGYwMGFiODEwYjNiY2Y5ZjBkOWNkZGYyNmU1YzA1NWFhMWExNDk2MWUwMDlkYmU2M2E1NDIwNDU2MDIyMTlkOTQ0ODNkYjU2NjZhMTc0OGU2MmY1MzI2MjExMDYxOTI1MTYwNTU2MTJmMmRkN2JiNjA2NWU5NzFkY2JhM2M5NDgwYzkzOTZkZmY3MGNhZTc5Mjg5NGYyNjllMTVmYTQ0XCIsXCJ1c2VyRGV0YWlsc1wiOlwiRnk5Q3o1QzREMjFXNlV2UlM2bHE0b1ZvU0dzMnFCTVdvQUpvYzRDK3hIZkFhczM5eTE1Wk1nN3BHVzQ3S0xLSlRsaXZMT201ai81TktNUXoxcEFYTUk0aWRRWUtqN25rdXBOTC9STG1SVU4vSGlyamJ1allqZWxLNUlhdjJjOXBHUExHdlNNeXJ4L0NxN041T1B4MDN3clh0by9EOVJLNGxsNzlERmkxRUwvb2RzdWxiYlNURGN4USs3VGRMV3pwTG9yQXhDSy9uSG13MStpS3R3VHhvenlOb0kxV0hoQ2hWaXRPWVlaei9PbVBLRUVZa2g3blc0VFNMYlU3QlVxSWdIVVFZdWFNdXExcWNNdVFzbmkrTlllSkxKY0hyVnc4bXdKQVNqeFVuYktzXCJ9Iiwic3Vic2NyaWJlcklkIjoiNzM2MTY0NDMyNSIsImFwcE5hbWUiOiJSSklMX0ppb1RWIiwidmVyc2lvbiI6InYxIn0sImV4cCI6MTcwMTU5MTY0OCwiaWF0IjoxNzAxNTg0NDQ4fQ.ggBYBnk5kiv7Od67OROEi2DwDMHqAFzUgKBBcHoajcT_9a9I6GGCY-bBiyJ8yBfNFxVhf2RL0fbBGDhWciO-gg",
        "newUser": true,
        "ssoToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkRm9yIjoiSmlvVFYiLCJkZXZpY2VJZCI6IjUxRERFRDFBQUJGQTRCMzU4NDBBMTYyOTgzRkRCOTg5IiwiaWF0IjoxNzAxNTg0NDQ4LCJzSWQiOiJVMkZzZEdWa1gxOWZJZk9IaGVPSFgvREFqeXMwczNRREUyejhRRVkyTUF3PSIsInVuaXF1ZSI6ImJhYjRiZTE0LTlhNTItNDBlYy1hZGJjLTNiNjUwYmM1NmMyMCIsInVzZXJUeXBlIjoiSklPIn0.KrTH3uZg5hVBn8hCOJF0BOZ6vxyo5KAFWc2l_pCHtIs",
        "deviceId": "51DDED1AABFA4B35840A162983FDB989",
        "refreshToken": "70fc794f-41f4-4fcf-9057-143ad789af0b",
        "profileId": "",
        "jToken": "276a83ea5ea0afab3165af9459ed6b61.d6f6d4142b9817f582e4c2b4478bfd495e9df9311488140a8f457ddcc5b861f9318db3860c09e03af31f82fb0ff067598f1dc957f84422af81b45360fa54d1fc5a4d2cd5f323f6cf9372eac71a13979c09648f7b91a2095ddb361aaf6563f8e69b16b850b142ab625ebe19127b258e00cdaee69e763dc961df7da2c56fff8d2230cdf04ccc8bb2f5e9ce6ca009ead869ddfddfdf5964bbd42cf05053b70c0438b36ce2292c1992dbc0cee4b30cb5c863ddb981e5cf630780c6d8f8c138d0442995b7355fe15e6211611a288e2648b73e48018ead100ae37b683c7744f2e49f0437b9ecf28a80ee6cff0d99588d5aaf4b0a62081d34be352badae95f0cba49c3ae2eed73022d4056edee4dec78b7246b4cdf00ab810b3bcf9f0d9cddf26e5c055aa1a14961e009dbe63a542045602219d94483db5666a1748e62f532621106192516055612f2dd7bb6065e971dcba3c9480c9396dff70cae792894f269e15fa44",
        "ip": "62576c9a7e802e512d6f4dd485f8d5a1",
        "sessionAttributes": {
            "user": {
                "commonName": "Aditya Sachan",
                "mobile": "+919696724203",
                "uid": "adityasachan_90",
                "unique": "bab4be14-9a52-40ec-adbc-3b650bc56c20",
                "ssoLevel": "20",
                "preferredLocale": "en-US",
                "subscriberId": "7361644325"
            }
        },
        "lbCookie": "1",
        "ssoLevel": "20",
        "name": ""
    }
        credentials.refreshedtoken = login.data.authToken
        credentials.sso1 = login.data.ssoToken;
        credentials.jtoken = login.data.jToken;
        credentials.unid1 = login.data.sessionAttributes.user.unique;
        credentials.userid = login.data.sessionAttributes.user.uid;
        credentials.crmid = login.data.sessionAttributes.user.subscriberId;
        credentials.subscriberId = login.data.sessionAttributes.user.subscriberId;
        credentials.refreshtoken = login.data.refreshToken
        credentials.deviceid = login.data.deviceId
        credentials.logindata = login.data
        credentials.refreshedtoken = refreshtoken()
        credentials.dummyrefreshedtoken = "accesstoken"
        login.method = "otp"
        logintime = get_ts() + 70000
        login.time = logintime
        login.status = true
     
        // getsso1();
        getplaylist();
    
        page.flush();
        popup.notify('Congratulations Successfully logged in to Jiotv', 4);
        page.redirect(plugin.id + ':start');

    });
    new page.Route(plugin.id + ':loginbypassword', function (page) {
        page.metadata.title = "Login using Password";
        login.data = getsso1()
        credentials.refreshedtoken = null
        credentials.sso1 = login.data.ssoToken;
        credentials.jtoken = login.data.jToken;
        credentials.unid1 = login.data.sessionAttributes.user.unique;
        credentials.userid = login.data.sessionAttributes.user.uid;
        credentials.crmid = login.data.sessionAttributes.user.subscriberId;
        credentials.subscriberId = login.data.sessionAttributes.user.subscriberId;
        credentials.refreshedtoken = 'ios'
        credentials.dummyrefreshedtoken = "os"
        credentials.logindata = login.data
        login.method = 'password'
        logintime = get_ts() + 70000
        login.time = logintime
    
        login.status = true
        getplaylist();
        page.flush();
        popup.notify('Congratulations Successfully logged in to Jiotv', 4);
        page.redirect(plugin.id + ':start');

    })

    function getssobyotp() {
        getotp()
        var name;
        name = 'Please enter your OTP received on your number';
        var text;
        text = 'Login with OTP';
        var otpinput = popup.textDialog(name, text, true);
        if (otpinput.rejected) {
             page.redirect(plugin.id + ':start')
        };
        
        try {
        var c = JSON.parse(http.request('https://jiotvapi.media.jio.com/userservice/apis/v1/loginotp/verify', {
            debug: true,
            method: "POST",
          //  noFollow: true,
            //noFail: true,
            headers: {
                
                'devicetype': 'phone',
                'Accept': '*/*',
                'appname': 'RJIL_JioTV',
                'os': 'ios',
                'Accept-Encoding': 'gzip, deflate, br',
                'deviceid' : credentials.devid,
                'User-Agent': 'jiotv/404 CFNetwork/1406.0.4 Darwin/22.4.0',
                'Content-Type': 'application/json'

            },
            postdata: JSON.stringify({
                
                otp: otpinput.input,
                deviceInfo: {
                    
                    info: {
                        type: 'ios',
                        platform: {
                            name: 'iPhone',
                            version: '270'
                        },
                        androidId: credentials.devid
                    },
                    consumptionDeviceName: 'iPhone'
                },

                number: e64(service.username)
            }),
        }));
    } catch (e) {}

        return c
    }

    function getotp() {
        c = (http.request('https://jiotvapi.media.jio.com/userservice/apis/v1/loginotp/send', {
            debug: true,
            method: "POST",
            noFollow: true,
            noFail: true,
            headers: {
                
                'appname': 'RJIL_JioTV',
                'os': 'ios',
                'devicetype': 'phone',
                'deviceid': credentials.devid,
                'User-Agent': 'jiotv/404 CFNetwork/1406.0.4 Darwin/22.4.0',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json'
            },
            postdata: JSON.stringify({
                number: e64(service.username)
            }),
        }))
          popup.notify('Status: ' + c, 9)
    }

    function surfall(page, c) {

        var drmall = []
      
        var headers_single = [];
        headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
        drmall.push({
            headers: JSON.stringify(headers_single),
            subtitle_formatting: subtitle_format,
        });
          
        for (var i = 0; i < c.length; i++)
            drmall.push({
                uri: c[i].uri,
                name: (c[i].name),
                artwork_uri: (c[i].artwork_uri),
                drm_license_uri: c[i].drm_license_uri,
                drm_scheme: c[i].drm_scheme,
                extension:	checkextension(c[i].uri), // mpd or m3u8
	            mime_type:	checkmime(c[i].uri), // application/dash+xml or application/x-mpegURL
                
            });
// c is an array having m3u8 and mpd links 
        var drm_all = 'movianDRM:dash:' + encodeURIComponent('json://' + JSON.stringify(drmall));
       
        page.appendItem(drm_all, 'directory', {
            icon: logo,
            title: "Surf all Channels "
        });  
    
    
    }


    function surfallhls(page, c) {

        var drmall = []
      
        var headers_single = [];
        headers_single = add_header(headers_single, "all", "User-Agent", OTTUA);
        drmall.push({
            headers: JSON.stringify(headers_single),
            subtitle_formatting: subtitle_format,
        });
          
        for (var i = 0; i < c.length; i++)
            drmall.push({
                uri: c[i].link,
                name: (c[i].name),
                artwork_uri: (c[i].logo),
          //      drm_license_uri: c[i].drm_license_uri,
              //  drm_scheme: c[i].drm_scheme,
              extension:	checkextension(c[i].link), // mpd or m3u8
	           mime_type:	checkmime(c[i].link), // application/dash+xml or application/x-mpegURL
                
            });
// c is an array having m3u8 and mpd links 
        var drm_all = 'movianDRM:dash:' + encodeURIComponent('json://' + JSON.stringify(drmall));
       
        page.appendItem(drm_all, 'directory', {
            icon: logo,
            title: "Surf all Channels "
        });  
    
    
    }