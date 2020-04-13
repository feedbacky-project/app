<p align="center">
    <a href="https://feedbacky.net">
        <img src="https://static.plajer.xyz/feedbacky/img/banner-beta.png">
    </a>
</p>
<p align="center">
    Web service dedicated to collect users feedback in a friendly and easy way.
</p>
<strong align="center">
    Feedbacky is in beta and it's still under development, self hosted open source version will be improving by the time.
</strong>

<p align="center">
    <h3 align="center"><a href="https://feedbacky.net">Website</a> | <a href="https://app.feedbacky.net">Try demo</a></h3>
    <img src="https://cdn.feedbacky.net/static/img/main_banner.png">
    <img src="https://cdn.feedbacky.net/static/img/main_banner_ideas.png">
</p>

### Minimum requirements
* ~300 MB ram for runtime (at least 1 GB recommended for source compilation purposes)
* ~100 MB disk space (at least 2 GB space for source compilation purposes, can be pruned via docker afterwards)
* Docker and Docker Compose (latest recommended, older versions tend to break Node.js compilation somehow) installed
* (Recommended) Git installed to clone this repository sources (alternatively you can just download source zip and unpack to skip this part)
* MySQL database (recommended version 5.6 or higher)
* Account at mailgun.com **OR** own SMTP server for mail sending feature
* Account on at least one of following services: Discord, GitHub, Google for 3rd party login purposes
* (Optional) Account at cheetaho.com for image compression feature

## Creating own instance
To run your own Feedbacky instance you must firstly meet all requirements above and have docker, docker-compose, database
and mail server installed (or mailgun account).

Helpful tutorials:
* How to install Docker - https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04 (just Step 1)
* How to install Docker Compose - https://docs.docker.com/compose/install/
* How to install MySQL - https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04

1. Once requirements are installed you can either use git tool to clone repository or download and unpack sources yourself.
To clone repository with Git use:
    ```
    git clone https://github.com/Plajer/feedbacky-project
    ```
   
2. Open `.env` file located in `feedbacky-project` folder (you can use `nano .env`) and configure database credentials i.e.
`MYSQL_USERNAME`, `MYSQL_PASSWORD` and `MYSQL_URL`.

    Please note that `localhost` won't work in `MYSQL_URL` variable due to nature of Docker (container is considered as a remote machine).
    IP of server must be provided and MySQL must be configured to accept non localhost connections.
    
    To adjust that, `bind-address` at `/etc/mysql/mysql.conf.d/mysqld.cnf` must be set to `0.0.0.0` and MySQL user with `%` login access should be made.

3. Visit https://www.grc.com/passwords.htm site and copy one of safely generated tokens, if page is offline search for JWT secret generator
or any safe random long text generator online.
Paste copied token into `JWT_SECRET` variable.

4. Create OAuth application(s) at login providers you want to use:
    To set up Discord OAuth application go and create one here https://discordapp.com/developers/applications
    
    To set up Google OAuth application go here https://console.developers.google.com/apis/dashboard create new project and check Credentials section
    
    To set up GitHub OAuth application go and create one here https://github.com/settings/developers
    
    Redirect URI for OAuth apps should be: <server ip/domain>:port/auth/<provider> eg. `http://188.222.333.22:8090/auth/discord`.
    Valid providers: discord, github, google

5. Set your mail sender at `MAIL_SENDER`, choose mail type under `MAIL_SERVICE_TYPE` and configure proper variables based on your choice (mailgun or smtp)

6. (Optional) Create account at cheetaho.com, get API key and enable Image Compression.

7. (Optional) If you have any apps running or port 8090 or 8095 edit `CLIENT_APP_PORT` and `SERVER_APP_PORT` variables.

8. Domain configuration
    a) Replace `REACT_APP_SERVER_IP_ADDRESS` with your server's IP and CLIENT_APP_PORT variable eg. http://188.222.333.22:8090 without trailing slash! (no `/` at the end).
    If you use port 80 (web port), then you don't need to put port there.  
    b) Or use your own domain name in `REACT_APP_SERVER_IP_ADDRESS`, if you have a domain and want to use it you can get Apache Server,
    create virtual host configuration file at `etc/apache2/sites-available`
    Your file must end with `.conf` and should contain this:
    ```
    <VirtualHost *:80>
      ServerName %domain name%
      ProxyPreserveHost On
      ProxyRequests Off
      ProxyVia Off
      ProxyPass / %your server ip and CLIENT_APP_PORT variable eg. http://188.222.333.22:8090%
      ProxyPassReverse / %same as above%
    </VirtualHost>
    ```
    Replace %text% with proper settings.
    Then do `a2ensite <file name>.conf` to enable that virtual host configuration.

9. Now you can create screen session if you want to see how Feedbacky runs in the background by doing `screen -S <screen name>`
and go to `feedbacky-project` folder.
    
    Begin the source compilation process by doing `docker-compose up`, it will take few minutes depending on your server capabilities.
    Server will likely use high amount of CPU at this part. After successfull compilation your Feedbacky instance should be ready.

## License
Feedbacky is free and open source software under the [MIT License](https://github.com/Plajer/feedbacky-project/blob/master/LICENSE.md).