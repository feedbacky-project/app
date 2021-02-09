### 1.0.0-alpha
* social links are now properly updated in admin panel and changes are reflected on main page without the need to reload
* staged creators for webhooks and social links are now inside admin panel not separate page
* buttons all over the page now respect dark mode and use badge-like background and color scheme
* changed badges background alpha value to 10%, looks better (just my opinion)
* changed small text shadow size from 3 to 4 px (better to read the text)
* borders in webhooks creator were broken, now they're fixed
* dark mode is now shadowless, every ui element now won't have shadows, previously only texteareas and forms did
* special comment icons on dark mode are no longer full color, alpha color is applied to look better
* loading spinners now do implement theme color of board where applicable
* removed brightness filter on board image (jumbotron) on dark mode
* another fix for color selection modal in admin panel
* added MAINTENANCE.md inside client folder to describe file structure and file naming for future code maintenance and contributors
* fixed client side didn't use optimized bootstrap-imports file, now it does and css size is smaller
* move social icons buttons hover url for the whole button not only the icon (Tigerpanzer suggestion)
* changed moderator actions icons to cog
* make more page elements theme dependant (use page theme for background or color)
* added accessibility support for prefers-reduced-motion for some non-essential animations (upvote, settings, loaders)
* replaced color in profile navbar on light mode with darker accent to meet AAA color contrast
* replaced some text with text-black-50 color to text-black-60 to meet AAA color contrast
* fixed issue that anyone could access admin panel of any board (couldn't use it and saw only public data no private data)
* upvote buttons are now grey if they're not upvoted
* replaced default color palette in theme selector with more color contrast safe colors
* made some changes towards easier keyboard accessibility (brought back links outlines, made new idea button tabindex 1)
* moved dark mode toggle from navbar dropdown to Settings > Appearance
* fixed suspensions feature didn't work on months and days with one digit (server validates date 2020-01-01 not 2020-1-1)
* removed sweetalert2, now using only react bootstrap modals (soon only react-overlays modals)
* isolated react-bootstrap components inside ui package
* slowly removing bootstrap and it's usages in code (only basic utilities and grid system will remain)
* add meta description and update meta tags for SEO
* added https://app.feedbacky.net/i/show-amount-of-open-closed-and-total-ideas.191 idea
* remove model mapper from api requests fetch dtos
* improve api fetching response time with entitygraphs
* force break-word on idea cards to avoid [this](https://cdn.discordapp.com/attachments/618782782348591111/796316504835751956/Screenshot_2021-01-06-10-57-17-570_org.mozilla.firefox.jpg)

TODO dynamically load SVGs from assets/svg/undraw for smaller js chunk sizes

!! TODO UI CARD INNER REF https://github.com/reactjs/reactjs.org/issues/2120
!! hover transform scale small/big

### 0.6.0-beta
* **[FEATURE]** Added search bar to search ideas by specific title (requested by [eartharoid](https://app.feedbacky.net/i/add-a-search-feature.2313))
* **[FEATURE]** Added self assignable tags that everyone can set when creating new idea (requested by [VentureKraft](https://app.feedbacky.net/i/self-assignable-tags.982))
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