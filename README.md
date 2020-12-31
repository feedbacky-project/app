<p align="center">
    <a href="https://feedbacky.net">
        <img src="https://static.plajer.xyz/feedbacky/img/new-banner-beta.png">
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

### Creating own instance
Minimum requirements and setup tutorial can be found at [our official wiki](https://docs.feedbacky.net).

## Further customizing
If you want you can customize your Feedbacky instance even more.
You can edit [this file](https://github.com/Plajer/feedbacky-project/blob/master/client/public/index.html) to add for example
your own OG meta tags like
![](https://static.plajer.xyz/feedbacky/img/og-example.png)

Mail templates can be edited [in this folder](https://github.com/Plajer/feedbacky-project/tree/master/server/src/main/resources/mail_templates).

## Updating from older versions
This section will contain information about variables you need to put to .env file to make Feedbacky work after you update it.
It might include other information as well. 

### Updating to 0.2.0
**!!!** New `.env` variables were added and are required to start, add them to the file and save:
```
MAIL_SENDGRID_API_KEY=apiKey
MAIL_SENDGRID_API_BASE_URL=baseUrl
```
If you don't plan to use SendGrid as a mail provider there is no need to modify these values.

Roadmaps were added in this version but Hibernate will automagically include it in database.
Migrator will migrate every user automatically to enable mail preferences for a new Mail Notifications feature.

**!!!** When using Mailgun as a mail provider add `/messages` at the end of `MAIL_MAILGUN_API_BASE_URL` env variable,
we no longer add this part in code.

### Updating to 0.5.0
**!!!** New `.env` variable was added and is required to start, add it to the file and save:
```
SETTINGS_ALLOW_COMMENTING_CLOSED_IDEAS=false
```
Replace `false` with `true` if you want to allow users to comment ideas which are closed.

**!!** `REACT_APP_DEFAULT_USER_AVATAR` value in `.env` has been changed.
If you wan't to use Letter Avatars please set it to this value:
```
REACT_APP_DEFAULT_USER_AVATAR=https://static.plajer.xyz/avatar/generator.php?name=%nick%
```

## Attribution note
Icons (from client project at /src/views/admin/subviews/webhooks/steps/StepSecond.jsx) made by [Prosymbols](https://www.flaticon.com/authors/prosymbols) from www.flaticon.com

Some SVG illustrations provided by https://undraw.co/

Design system used in project provided by https://getbootstrap.com/

## License
Feedbacky is free and open source software under the [MIT License](https://github.com/Plajer/feedbacky-project/blob/master/LICENSE.md).