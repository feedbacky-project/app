### 1.0.0.alpha.5
* **[FEATURE]** Allow users to edit their comments (requested by [Matou0014](https://app.feedbacky.net/i/edit-comments.2681))
* **[FIX]** Fixed javascript URI schemes and XSS vulnerability via markdown links (reported by [Mattx8y](https://app.feedbacky.net/i/disable-javascript-uri-schemes-in-markdown.2795))

### 1.0.0.alpha.4
* **[FEATURE]** Page routes now includes browser changeable tab titles instead of hardcoded one
* **[FEATURE]** Ideas can be filtered by tags now (requested at [Feedbacky](https://app.feedbacky.net/i/more-moderation-options.2662))
* **[FEATURE]** Ideas commenting can be now restricted to moderators only
* **[IMPROVEMENT]** User will no longer receive notification emails if they made any changes to their own ideas
* **[CHANGE/CONTROVERSIAL]** Edited light mode UI, now shadowless with improved UI elements
* **[CHANGE]** Increased social links amount by 1 (because moved Roadmap icon to navbar)
* **[CHANGE]** Changed navbar UI for future categories feature implementation
* **[CHANGE]** Unified Web Content Accessibility Guidelines color contrast checking for various UI elements
* **[CHANGE]** Filters and sorts will be now reset after each page visit (requested by [yeah idk](https://app.feedbacky.net/i/reseting-the-filtering-and-sorting-types.2006))
* **[CHANGE]** Default sort for comments is now Newest
* **[CHANGE]** Default theme color is now blue-ish to look like Feedbacky theme colors not green
* **[FIX]** Google users couldn't log-in for the first time if their avatar URL length exceeded 255 characters
* **[FIX]** Moderators couldn't be removed

### 1.0.0.alpha.3
* **[FEATURE]** Added anonymous voting feature, toggleable in board admin panel (requested at [Feedbacky](https://app.feedbacky.net/i/anonymous-voting.730))
* **[FEATURE]** Added administrator role that can do everything that owner can without ability to delete board
(Partially implements request by [Matou0014](https://app.feedbacky.net/i/add-the-possibility-to-promote-users.2296))
* **[FEATURE]** Anonymous users (both by disabled accounts or anonymous voting) will use anonymous nicknames provided via custom nicknames file,
better to see random nicknames than Anonymous multiple times
* **[FEATURE]** Added API keys and Public API (backported from Cloud Service fork)
* **[CHANGE]** Dropped Tags, Webhooks and Moderators quotas, they should be unlimited using self-hosted version (requested by [Matou0014](https://app.feedbacky.net/i/increase-quota-for-tags.2643))

### 1.0.0.alpha.2
* **[IMPROVEMENT]** Added clearly visible Log In text in the log-in button
* **[IMPROVEMENT]** Creators Finish button do show loading spinners now
* **[CHANGE]** Appearance profile route can be viewed while not logged in
* **[CHANGE]** Replaced toast notifications with snackbar notifications
* **[CHANGE]** Idea closed comment icon is now Lock icon not Circle X
* **[CHANGE]** Made server-side API error messages more user friendly

### 1.0.0.alpha.1
* **[FEATURE]** Added MAINTENANCE.md inside client folder to describe file structure and naming for future code maintenance and contributors
* **[FEATURE]** Added reduced motion accessibility feature - if requested all non-essential animations (upvote, loaders, settings) won't display (prefers-reduced-motion: reduce)
* **[FEATURE]** Added ability to show amount of opened/closed and all ideas in the filter selection ([this suggestion](https://app.feedbacky.net/i/show-amount-of-open-closed-and-total-ideas.191))
* **[FEATURE]** Added search bar to search ideas by specific title (requested by [eartharoid](https://app.feedbacky.net/i/add-a-search-feature.2313))
* **[FEATURE]** Added self assignable tags that everyone can set when creating new idea (requested by [VentureKraft](https://app.feedbacky.net/i/self-assignable-tags.982))
* **[IMPROVEMENT]** Buttons all over the page now respect dark mode and use color and background depending on the chosen color mode
* **[IMPROVEMENT]** Webhook and social links creator pages are now inside board admin panel not on a separate pages
* **[IMPROVEMENT]** Updated colors at profile page to meet AAA color contrast
* **[IMPROVEMENT]** Made some changes towards easier keyboard accessibility (brought back links outlines, tabbing performance improved)
* **[IMPROVEMENT]** Smaller UI changes such as:
    * Page loading spinner now uses board theme color where applicable
    * Badges background on dark mode has now 10% alpha value instead 20%
    * Text shadows (were applicable) now have 4px instead of 3px size
    * Borders in webhooks creator cards now display properly
    * Moderative comment icons on dark mode are no longer full color and have transparent background
    * Removed brightness filter on board banner in dark mode
    * Changed moderator actions (close/open idea, change tags) icon to animated cog icon
    * Made more page elements board theme color dependant
    * Other either quality-of-life improvements or glitches fixes
* **[IMPROVEMENT]** Social links URLs are now clickable for the whole button not only the icon (reported by Tigerpanzer)
* **[IMPROVEMENT]** Removed sweetalert2 modals and replaced them with bootstrap alternatives so every modal is now in bootstrap
* **[IMPROVEMENT]** Added meta description tag and updated other meta tags for SEO purposes
* **[IMPROVEMENT]** Improved server-side performance and some requests are now returned faster
* **[IMPROVEMENT]** Replaced infinite scroller library and fixed some known issues with the old library while loading paginated content
* **[IMPROVEMENT / IN PROGRESS]** Slowly turning away from bootstrap making CSS code base smaller
* **[CHANGE / CONTROVERSIAL]** Dark mode is now shadowless, every UI element won't have shadow now, previously only forms didn't
* **[CHANGE / CONTROVERSIAL]** Not upvoted ideas buttons are now in gray color
* **[CHANGE]** Dark/light mode is no longer toggeable in navbar, you can change it at Settings > Appearance now
* **[CHANGE]** Replaced previous color palette in theme color selector with more contrast safe colors (to pass AA and/or AAA color contrast standards)
* **[FIX]** Social links are now properly updated without the need to reload when added/deleted in board admin panel
* **[FIX]** Theme selection modal in board admin panel didn't work properly
* **[FIX]** Suspensions feature wouldn't work when day or month number didn't have 2 digits (like 2020-1-1 instead of 2020-01-01)
* **[FIX]** When creating new webhook only created webhook will receive sample event not every hook at the board
* **[FIX]** Webhook messages contained user data tag instead of username in tag change webhook messages
* **[FIX]** Migrator fixes, no more issues with version detection 

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