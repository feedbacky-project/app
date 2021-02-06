<p align="center">
    <a href="https://feedbacky.net">
        <img src="https://static.plajer.xyz/feedbacky/img/new-banner-beta.png">
    </a>
</p>

<p align="center">
    <h3 align="center"><a href="https://feedbacky.net">Website</a> | <a href="https://app.feedbacky.net">Try demo</a></h3>
</p>
<p align="center">
    <img src="https://cdn.feedbacky.net/static/img/main_banner.png" width="680">
    <img src="https://cdn.feedbacky.net/static/img/main_banner_ideas.png" width="680">
</p>

### Self-host Feedbacky yourself
Minimum requirements and setup tutorial can be found at [our official wiki](https://docs.feedbacky.net/self-hosting/hosting-feedbacky-instance).
Only Linux tutorial is available.

## Further customizing
Wanna more customization? Fork the repo and edit files manually at GitHub to customize parts of the app.
* Customize meta tags (eg. for Discord)
    Edit [this file](https://github.com/Plajer/feedbacky-project/blob/master/client/public/index.html)
    
    You can include og meta tags like at https://app.feedbacky.net, our forked [file is located here](https://github.com/Feedbacky/feedbacky-project/blob/master/client/public/index.html#L15)
    
    Example
    
    ![](https://static.plajer.xyz/feedbacky/img/og-example.png)
* Customize email templates
    Head over [to this folder](https://github.com/Plajer/feedbacky-project/tree/master/server/src/main/resources/mail_templates)
    and edit HTML of files as you wish.
    
    **Be careful not to replace any placeholders like `${host.address}`**
* Customize/add new OAuth2 providers
    Check out [this file](https://github.com/Plajer/feedbacky-project/blob/master/server/src/main/resources/oauth_providers.yml)
    
    There is no official documentation on this file so please contact developers if you want to add or change anything here.

## Updating from older versions
See [UPDATING.md](https://github.com/Plajer/feedbacky-project/blob/master/UPDATING.md)

## Attribution note
Icons (from client project at client/src/routes/board/admin/subroutes/webhooks/creator/StepSecondSubroute.js) made by [Prosymbols](https://www.flaticon.com/authors/prosymbols) from www.flaticon.com

Some SVG illustrations provided by https://undraw.co/

Design system used in project provided by https://getbootstrap.com/

## License
Feedbacky is free and open source software under the [MIT License](https://github.com/Plajer/feedbacky-project/blob/master/LICENSE.md).