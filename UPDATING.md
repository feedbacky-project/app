Please check out all important update changes.

If you update for example from 0.1.0 to 0.5.0 **you must** apply all changes from 0.2.0 and 0.5.0 not only 0.5.0!

## Important updates
* [Updating to 0.5.0-beta](https://github.com/Plajer/feedbacky-project/blob/master/UPDATING.MD#updating-to-050-beta) (1 new `.env` variable)
* [Updating to 0.2.0-beta](https://github.com/Plajer/feedbacky-project/blob/master/UPDATING.MD#updating-to-020-beta) (2 new `.env` variables, Mailgun `.env` variable update)

### Updating to 0.5.0-beta
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

### Updating to 0.2.0-beta
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