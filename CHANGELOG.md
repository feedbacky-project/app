### 0.2.0-beta (X, 2020)
* Fixed bug with board admin panel losing theme color after page refresh
* Removed MDBootstrap dependency (client CSS size reduced)
* Moved css to sass and compiling bootstrap there to reduce unused css (client CSS size reduced)
* Client size assets (SVGs, images) are now stored in src/assets folder not at cdn.feedbacky.net
* Minor UI changes including:
  * Special comments icons change
  * Board admin panel and profile page UI changes
* Added mail notifications feature, subscribe to idea to receive mails when it gets changed, supported notifications:
  * Idea commented by board moderator
  * Idea tags changed
  * Idea status changed (closed, opened)
* Comments are now loaded from oldest
* Board settings changed in admin panel now are updated properly for the whole page
* Social link and webhooks creators won't break anymore when putting invalid url value
* Replaced custom edited snarkdown library with marked for better markdown parsing and to fix broken parsing issues
* Comments should load in good order now, before later pages could be returned earlier and would load first
* Dark mode received some improvements, theme colors are lighten to fit it better and badges are changed as well
* Server side messages when editing/updating stuff will now return more user friendly messages on failure
* In case of client app crash, error crash view will be displayed now
* Mailgun url at MAIL_MAILGUN_API_BASE_URL in .env has changed and now requires /messages at the end to use API properly 
* Added support for SendGrid mail provider
* Admin panel won't blink any longer when switching between sections (data passing works better now)