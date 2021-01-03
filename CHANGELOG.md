### 0.5.0-beta (December 31, 2020)
* **[FEATURE]** Added feature to suspend users you don't want to see at your board.
Feature located under `Suspensions` tab in Admin Panel
* **[FEATURE]** Added Letter Avatars to show instead of default Feedbacky user avatar
* **[FEATURE]** Added new setting to allow commenting closed ideas `SETTINGS_ALLOW_COMMENTING_CLOSED_IDEAS` in `.env.`
* **[IMPROVEMENT]** Profile settings won't display loading spinner anymore, loading button for avatar change will show instead
* **[IMPROVEMENT]** Moderative comments are now ID Tag based for Moderators and Tags inside them,
once Moderator is updated or Tag is changed they will reflect the changes in the comment as well, before they had hardcoded HTML code inside instead
* **[IMPROVEMENT]** Action buttons all over the page should show Loading indicator once action is requested
* **[IMPROVEMENT]** Comment creation textarea is now visible when not logged in to encourage to log in when someone clicks it to add a comment
* **[FIX]** Various Dark Mode fixes and improvements
    * Background for modal validation alerts now displays properly on Dark Mode
    * Feedbacky detected Dark Mode as enabled by default even if it wasn't
    * Progress bars on Dark Mode are now more visible
    * Idea Tags Editor does respect Dark Mode now
* **[FIX]** Fixed consistency between Moderation modals and User modals
* **[FIX]** Buttons all over the page should now be hoverable (will show hover action on hover instead of nothing)
* **[FIX]** Replaced localStorage with Cookies due to unknown Firefox issues with localStorage
* **[FIX]** Liking comments while not logged in will redirect you to Log-in Modal now
* **[FIX]** Log-in button will no longer show any shadows on hover/click
* **[FIX]** If there are no voters for an idea `None` will appear under Voters section instead of nothing 
* **[FIX]** Color selection modal didn't update theme color properly

### 0.3.1-beta (July 6, 2020)
* **[FEATURE]** Added slugs to idea links (eg. https://app.feedbacky.net/i/this-is-a-demo-page-feel-free-to-test.66)
* **[IMPROVEMENT]** UI was updated to be consistent across all the pages
    * Bootstrap modals are now centered with same shadows as modals from sweetalert2
    * Made stuff more rounded so its consistent across all the pages
    * Profile page theme color in dark mode is now the same as in light mode
    * Added few more rows to idea create modal description field - looks better
    * Dark more is now updated with more enjoyable color palette and minor fixes
    * Removed `!important` hell from CSS files
* **[IMPROVEMENT]** Dark mode will now be enabled in early page load if requested
(if dark mode is enabled or color scheme preference is dark), page won't blink white anymore
* **[IMPROVEMENT]** Editing ideas within 5 minutes after their creation won't mark idea as edited now
It's a feature for typo fixes so no spam in comments about edits is posted
* **[IMPROVEMENT]** Empty roadmap will now show no content image instead empty page
* **[IMPROVEMENT]** Added color brightness warning when creating new tag, too bright or too dark colors will be warned
because they're bad either for light or dark modes
* **[FIX]** App won't crash anymore when deleting idea and viewing it at the same time
* **[FIX]** Fixed theme color didn't set properly when creating new board
* **[FIX]** `Create Board` button won't change into `Next` when finalizing create new board process
* **[FIX]** Board creator no longer uses previously set page theme, uses own one now
* **[FIX]** Fixed issue when settings weren't applied when tags were edited or idea was closed/opened
* **[FIX]** Webhooks will now use REACT_APP_SERVER_IP_ADDRESS instead hardcoded `https://app.feedbacky.net` for links
* **[FIX]** Removed SETTINGS_MAINTENANCE_MODE unused env variable which was required before

### 0.3.0-beta (June 9, 2020)
Initially planned to release it as 0.2.1 but since we removed Private Boards it should be marked as a bigger release.
Private Boards feature was removed due to being unpopular and unused feature and contained security exploit.
This version also aims to fix regressions caused by previous update.
* Page no longer blinks and reloads when switching filtering or sorting
* Page no longer blinks when switching between boards in navbar
* Tag edit/create modal roadmap ignore option is now inline on desktop view (UI improvement)
* Social links should be now properly sorted and added without any problems through admin page
* Smaller admin page UI improvements
* Removed Private Boards feature

### 0.2.0-beta (June 5, 2020)
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
* Updated all dependencies both for frontend and backend