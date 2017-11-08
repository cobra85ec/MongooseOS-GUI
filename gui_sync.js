//Config
var deviceIP    = "192.168.4.1";
var localConfig = {};

//RPC
function getRpc(rpc,data,timeout,callback){
     var request = $.ajax({
      url:         "http://" + deviceIP + "/rpc/" + rpc,
      method:      "POST",
      data:        JSON.stringify(data),
      dataType:    "json",
      async:       true,
      cache:       false,
      timeout:     timeout,
      callback:    callback
    });


    request.fail(function( jqXHR, textStatus ) {
      shutter(true,"No connection! reload...");
      setTimeout(function(){ location.reload(); }, 5000);
    });

    request.done(function( msg ) {
      if(this.callback != ""){window[this.callback](msg);}
    })
}

    //Get Config
    function doConfigGet(){
        getRpc("Config.Get",{},2000,"callbackConfigGet");
    }
    function callbackConfigGet(data){
        //Store Config
        localConfig = data;

            //Device
            $("#ConfigGetDeviceId").val(localConfig.device.id);
            $("#ConfigGetDevicePassword, #ConfigGetDevicePassword2").val(localConfig.device.password);

            //Wifi
            $("#ConfigGetWifiStaEnabled").prop('checked', localConfig.wifi.sta.enable);
            $("#ConfigGetWifiStaSsid").val(localConfig.wifi.sta.ssid);
            $("#ConfigGetWifiStaUser").val(localConfig.wifi.sta.user);
            $("#ConfigGetWifiStaPass").val(localConfig.wifi.sta.pass);
            if(localConfig.wifi.sta.user == ""){
              $("#ConfigGetWifiStaUser,#ConfigGetWifiStaUserLabel").slideUp();
            }else{
              $("#ConfigGetWifiStaUser,#ConfigGetWifiStaUserLabel").slideDown();
            }
            if(localConfig.wifi.sta.pass == ""){
              $("#ConfigGetWifiStaPass,#ConfigGetWifiStaPassLabel").slideUp();
            }else{
              $("#ConfigGetWifiStaPass,#ConfigGetWifiStaPassLabel").slideDown();
            }

            //MQTT
            $("#ConfigGetMqttEnabled").prop('checked', localConfig.mqtt.enable);
            $("#ConfigGetMqttServer").val(localConfig.mqtt.server);
            $("#ConfigGetMqttUser").val(localConfig.mqtt.user);
            $("#ConfigGetMqttPass").val(localConfig.mqtt.pass);
            $("#ConfigGetMqttClientId").val(localConfig.mqtt.client_id);
            $("#ConfigGetMqttKeepAlive").val(localConfig.mqtt.keep_alive);
            $("#ConfigGetMqttReconnectTimeoutMin").val(localConfig.mqtt.reconnect_timeout_min);
            $("#ConfigGetMqttReconnectTimeoutMax").val(localConfig.mqtt.reconnect_timeout_max);

        //Finish
        doWifiScan();
        shutter(false,"");
    }

    //Save ConfiG
    function getChanges(prev, now) {
        var changes = {}, prop, pc;
        for (prop in now) {
            if (!prev || prev[prop] !== now[prop]) {
                if (typeof now[prop] == "object") {
                    if(c = getChanges(prev[prop], now[prop]))
                        changes[prop] = c;
                } else {
                    changes[prop] = now[prop];
                }
            }
        }
        for (prop in changes)
            return changes;
        return false; // false when unchanged
    }
    function doConfigSave(){
        shutter(true,"Save..");
        var localConfigBuffer = $.extend(true, {}, localConfig);

        //Device
        localConfig.device.id       =   $("#ConfigGetDeviceId").val();
        localConfig.device.password =   $("#ConfigGetDevicePassword").val();
        if(!isValidNotNull(localConfig.device.id))      {alert("Node Name error");shutter(false,"");return;}
        if($("#ConfigGetDevicePassword").val() != $("#ConfigGetDevicePassword2").val()){alert("Node Passwords do not match");shutter(false,"");return;}
        if($("#ConfigGetDevicePassword").val().length < 8 && $("#ConfigGetDevicePassword").val().length > 0){alert("Node Passwords must be at least 8 Chars long");shutter(false,"");return;}
        if(!isValid(localConfig.device.password)){alert("Node Password error");shutter(false,"");return;}

        //Wifi
        localConfig.wifi.sta.enable =   $("#ConfigGetWifiStaEnabled").prop('checked');
        localConfig.wifi.sta.ssid   =   $("#ConfigGetWifiStaSsid").val();
        localConfig.wifi.sta.user   =   $("#ConfigGetWifiStaUser").val();
        localConfig.wifi.sta.pass   =   $("#ConfigGetWifiStaPass").val();
        if(localConfig.wifi.sta.ssid == "" && localConfig.wifi.sta.enable){alert("Wifi SSID cannot be empty");shutter(false,"");return;}

        //MQTT
        localConfig.mqtt.enable     =   $("#ConfigGetMqttEnabled").prop('checked');
        localConfig.mqtt.server     =   $("#ConfigGetMqttServer").val();
        localConfig.mqtt.user       =   $("#ConfigGetMqttUser").val();
        localConfig.mqtt.pass       =   $("#ConfigGetMqttPass").val();
        localConfig.mqtt.client_id  =   $("#ConfigGetMqttClientId").val();
        localConfig.mqtt.keep_alive =   $("#ConfigGetMqttKeepAlive").val()*1;
        localConfig.mqtt.reconnect_timeout_min  =   $("#ConfigGetMqttReconnectTimeoutMin").val()*1;
        localConfig.mqtt.reconnect_timeout_max  =   $("#ConfigGetMqttReconnectTimeoutMax").val()*1;
        if(localConfig.mqtt.server == "" && localConfig.mqtt.enable){alert("MQTT Server cannot be empty");shutter(false,"");return;}

        //Nexus
        localConfig.wifi.ap.ssid = localConfig.device.id + "-ConfigMe";
        localConfig.wifi.ap.pass = localConfig.device.password;

        //Finish
        var changes = getChanges(localConfigBuffer,localConfig);
        if(changes !== false){
            var confirmAP = confirm("Keep local Access Point enabled ?");
            localConfig.wifi.ap.enable = confirmAP ? true : false;
            getRpc("Config.Set",{config:changes},2000,"callbackDoConfigSave");
        }else{
            setTimeout(function(){ alert("Nothing to save..");}, 600);
            shutter(false,"");return;
        }
    }
    function callbackDoConfigSave(data){
        getRpc("Config.Save",{reboot:true},2000,"");
        alert("Config Saved. Restarting...");
        shutter(true,"No connection! please reload...");
        setTimeout(function(){ location.reload(); }, 5000);
    }

    //Get System Informations
    function doSysGetInfo(){
        getRpc("Sys.GetInfo",{},4000,"callbackSysGetInfo");
    }
    function callbackSysGetInfo(data){
       $("#SysGetInfoApp").html(data.app + " - " + data.fw_version + " | " + data.arch);
       $("#SysGetInfoUptime").html(Math.round(data.uptime/60) + " Minuten");
       $("#SysGetInfoWifiSsid").html(data.wifi.ssid);
       $("#SysGetInfoWifiStatus").html(data.wifi.status);
       $("#SysGetInfoWifiStaIp").html(data.wifi.sta_ip);
       $("#SysGetInfoMac").html(SysGetInfoPipeMac(data.mac,2));
       $("#SysGetInfoRam").progressbar({value: 100 - data.ram_free / data.ram_size * 100});
       $( "#SysGetInfoFs" ).progressbar({value: 100 - data.fs_free / data.fs_size * 100});
    }

    //Get Wifi Networks
    function doWifiScan(){
        $("#WifiScanNum").html("Scanning...");
        getRpc("Wifi.Scan"  ,{},5000,"callbackWifiScan");
    }
    function callbackWifiScan(data){
       $("#WifiScan").html("");
       $("#WifiScanNum").html("Wireless Networks (" + Object.keys(data.results).length + ")");
       if(data.lenght == 0){
          $("#WifiScan").html(`<div class='accespoint'>
                                    <h5>No Wireless Networks found!</h5>
                                    <h6>Ceck your Configuration an Range</h6>
                               </div>`);
       }else{
          data.results.sort(function(a, b){return b.rssi-a.rssi})
          for (var key in data.results) {
              let ap = data.results[key]
              let append = `<div class="accespoint" onclick="presetWifi('` + ap.ssid + `',` + ap.auth + `)">
                                <img src="` + WifiScanPipeRssi(ap.rssi) + `" class="status">
                                <h5>` + ap.ssid + `</h5>
                                <h6> Cannel: ` + ap.channel + ` | ` + ap.rssi + ` dBm | Security: ` + WifiScanPipeAuth(ap.auth) + `</h6>
                                <img src="gui_i_right.png" class="arrow">
                            </div>`;
              $("#WifiScan").html($("#WifiScan").html() + append);
          };
       };
    }

//Pipes
function WifiScanPipeRssi(rssi){
    if(rssi < -100){return "gui_i_wifi_0.png";}
    if(rssi <  -86){return "gui_i_wifi_1.png";}
    if(rssi <  -70){return "gui_i_wifi_2.png";}
    if(rssi >  -70){return "gui_i_wifi_3.png";}
}
function WifiScanPipeAuth(auth){
    if(auth == 5){return "WPA2 Enterprise";}
    if(auth == 4){return "WPA/WPA2-PSK";}
    if(auth == 3){return "WPA2-PSK";}
    if(auth == 2){return "WPA-PSK";}
    if(auth == 1){return "WEP";}
    if(auth == 0){return "open";}
}
function SysGetInfoPipeMac(str, n) {
   var a = [], start=0;
   while(start<str.length) {
      a.push(str.slice(start, start+n));
      start+=n;
   }
   return a.join(":");
}

//User Interface
function shutter(stat,text){
    $("#shh2").html(text);
    if(stat === true){
        $("#sh").slideDown();
    }else{
        $("#sh").slideUp();
    }
}
function presetWifi(ssid,auth){

    //Clear
    $("#ConfigGetWifiStaSsid").val(ssid);
    $("#ConfigGetWifiStaUser").val("");
    $("#ConfigGetWifiStaPass").val("");
    $("#ConfigGetWifiStaEnabled").prop('checked', true);

    if(auth == 0){
      $("#ConfigGetWifiStaUser,#ConfigGetWifiStaUserLabel").slideUp();
      $("#ConfigGetWifiStaPass,#ConfigGetWifiStaPassLabel").slideUp();
    }else if(auth == 5){
      $("#ConfigGetWifiStaUser,#ConfigGetWifiStaUserLabel").slideDown();
      $("#ConfigGetWifiStaPass,#ConfigGetWifiStaPassLabel").slideDown();
      $("#ConfigGetWifiStaUser").focus();
    }else{
      $("#ConfigGetWifiStaUser,#ConfigGetWifiStaUserLabel").slideUp();
      $("#ConfigGetWifiStaPass,#ConfigGetWifiStaPassLabel").slideDown();
      $("#ConfigGetWifiStaPass").focus();
    }

}
function isValid(str) {
    return /[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]/.test(str);
}
function isValidNotNull(str) {
    if(str == ""){return false};
    return /[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]/.test(str);
}

$(document).ready(function(){
 setInterval(function(){ doSysGetInfo() }, 4000);doSysGetInfo();
 setTimeout(function(){ doConfigGet() }, 500);
});
