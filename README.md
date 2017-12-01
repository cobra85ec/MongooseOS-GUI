# MongooseOS-GUI
<img width="300px" align="right" src="http://www.imakeyouintelligent.com/wp-content/uploads/2017/12/app.png">

## A Web-Based GUI to configure:
  * Device Name
  * Device Accesspoint SSID + Password
  * Station Scan
  * Station Accesspoint Credentials (WPA/WPA2/WPA2 Enterprise)
  * MQTT Server
  * User Credentials
  * Keep-Alive + Timeouts
 
#### The GUI Access Mongoose-OS configuration via RPC.

## Developement Roadmap:
 * Launch Mongoose-OS libary for Einable/Disable AccessPoint on Keypress
 * Captive Portal
 * SNTP Time Settings
 
<br />
<br />

## Installtion
  1. Create a folder "gui" in you Applications Root-Directory and copy GUI-Files into.
  2. Enable Mongoose-OSs Webserver and set Document-Root to "/gui"
  3. Important: use "mos flash *--esp-erase-chip*" to flash your Application
  4. Now create an extra filesystem on your ESP for the files

  #### ESP8266
  ###### Run in Shell:
  ```bash
  #Create Filesystem
  mos call FS.Mkfs '{"dev_type": "sysflash", "fs_type": "SPIFFS", "fs_opts": "{\"addr\": 3145728, \"size\": 262144"}'
  #Mount Filesystem
  mos call FS.Mount '{"dev_type": "sysflash", "fs_type": "SPIFFS", "fs_opts": "{\"addr\": 3145728, \"size\": 262144}", "path": "/gui"}'
  #Config Filesystem to be mounted on restart
  mos config-set sys.mount.path=/gui sys.mount.dev_type=sysflash sys.mount.fs_type=SPIFFS 'sys.mount.fs_opts={"addr": 3145728, "size": 262144}'
  ```
  #### ESP32
  ###### Add this in your Applications mos.yml:
  ```yamal
    build_vars:                                           
        ESP_IDF_EXTRA_PARTITION: gui,data,spiffs,,256K
  ```
  ###### Run in Shell:
  ```bash
  #Create Filesystem
  mos call FS.Mkfs '{"dev_type": "esp32part", "dev_opts": "{\"label\": \"gui\"}", "fs_type": "SPIFFS"}'
  #Mount Filesystem
  mos call FS.Mount '{"dev_type": "esp32part", "dev_opts": "{\"label\": \"gui\"}", "fs_type": "SPIFFS", "path": "/gui"}'
  #Config Filesystem to be mounted on restart
  mos config-set sys.mount.path=/gui sys.mount.dev_type=esp32part sys.mount.fs_type=SPIFFS 'sys.mount.dev_opts={"label": "gui"}'
  ```
  
  5. Enable the AP
  ```bash
  mos config-set wifi.ap.enable=true
  ```
  
  6. Navigate in the "/gui" directory of your Application
  5. Upload GUI-Files to the new created filesystem by running "uploadGUI.sh" in the /gui directory of your Application (this will take some minutes)
  6. After reboot connect to your ESPs AccessPoint and call *192.168.4.1* in the Browser

  Finish!
