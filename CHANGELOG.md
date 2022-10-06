### 1.0.0.RC.6 (3.10.2022)
* **[FEATURE/QoL]** Attachment now contains preview icon and attachment text is truncated if too long (requested at [Feedbacky](https://app.feedbacky.net/i/attachment-icon.4432))
* **[FEATURE/QoL]** **[BETA]** Draft keyboard shortcuts feature is here (check out CTRL + K) (requested by [Matou0014](https://app.feedbacky.net/i/board-shortcuts.3216)) 
* **[IMPROVEMENT]** Badly designed vote reset modal adjusted (reported at [Feedbacky](https://app.feedbacky.net/i/badly-designed-vote-reset-modal.4431))
* **[FIX]** Emotes were parsed incorrectly due to html entities issue

### 1.0.0.RC.5 (31.08.2022 - 02.10.2022)
* **[FEATURE]** Added `REACT_APP_DEFAULT_BOARD_REROUTE` env variable utilize Single Board Feature (requested at [Feedbacky](https://app.feedbacky.net/i/single-board-self-hosted-instance.3514))
* **[FEATURE]** Advanced filters is now live in BETA stage (requested by [eartharoid](https://app.feedbacky.net/i/more-advanced-filters.4274))
* **[IMPROVEMENT]** Textarea in comments is now bigger (requested by [eartharoid](https://app.feedbacky.net/i/larger-comment-textarea.4451))
* **[IMPROVEMENT]** Many textareas across the page can now be previewed with markdown (requested by [eartharoid](https://app.feedbacky.net/i/markdown-editor-improvements.4455))
* **[FIX]** Markdown buttons overrode selected text on Firefox
* **[FIX]** Minor annoying UI issues for mobile

### 1.0.0.RC.4 (15.07.2022)
* **[FEATURE/QoL]** Added log-in intentions when not logged in (requested at [Feedbacky](https://app.feedbacky.net/i/log-in-intent.4385))
* **[FEATURE/QoL]** Titles can be edited up to 15 minutes after idea creation (requested by [Tigerpanzer_02](https://app.feedbacky.net/i/edit-title-of-own-ideas.4065))
* **[IMPROVEMENT/QoL]** Roadmap and changelog navbar nodes no longer redirect to /me page but feedback page (requested by [Tigerpanzer_02](https://app.feedbacky.net/i/linking-on-board-logo-name-upper-left-corner.4063) and community)
* **[FIX]** Metadata being null crashed pages (reported by eartharoid)
* **[FIX]** Moderator assigned message displayed assignee as a user who assigned an assignee
* **[FIX]** Wrongly displayed tags edit message (minor lexical issue)

### 1.0.0.RC.3
* **[FEATURE]** Added GitHub integration with following features:
  * Create GitHub Issue from Feedbacky idea
  * Sync GitHub Issue and Feedbacky idea with comments and idea/issue state
* **[IMPROVEMENT]** Admin panel sidebar redesigned
* **[IMPROVEMENT]** Replaced webhook events with action triggers used both for webhooks and integrations
* **[IMPROVEMENT]** Multiple users can now be assigned to an idea
* **[CHORE]** Update client-side dependencies to remove vulnerabilities
* **[FIX]** Show visible replies with not visible parent comments

### 1.0.0.RC.2
* **[FEATURE]** Board and account deletion modals now contain checkboxes to agree that you delete board/account (requested by [Matou0014](https://app.feedbacky.net/i/hardened-board-deletion.4089))
* **[FEATURE]** Comments can now receive replies
* **[FEATURE]** Added Twitch OAuth2 log-in support
* **[FEATURE]** Comment mentions feature added (requested at [Feedbacky](https://app.feedbacky.net/i/user-mentions.4099))
* **[IMPROVEMENT]** Reduced server-side service memory footprint by using different Docker image
* **[IMPROVEMENT]** Quality of Life improvement - all focusable input forms will now be focused by default for example in modals or creators
* **[IMPROVEMENT]** Improved server-side performance with entity graph adjustments
* **[CHANGE]** Breaking UI change - separated UI components from client, now they are standalone
* **[FIX]** Scrollbars didn't work properly on Chromium browsers
* **[FIX]** Changelog modal didn't respect 2500 chars change
* **[FIX]** Page crashing when having INTERNAL comment in discussion and being non-moderator user

### 1.0.0.RC.1
* **[FEATURE]** Display toast messages when page is loading for too long
* **[FEATURE]** Display all voters in a modal when clicking `+X more` text (requested at [Feedbacky](https://app.feedbacky.net/i/show-modal-with-all-voters.4046))
* **[IMPROVEMENT]** Dynamically change theme-color meta tag based on page theme color
* **[IMPROVEMENT]** Reduced motion now applies to most of hoverable UI elements
* **[IMPROVEMENT]** Webhooks will now assign changelog id to link to use latest scroll to changelog feature
* **[IMPROVEMENT]** Comment and idea edit forms should now contain markdown buttons (requested by [Tigerpanzer_02](https://app.feedbacky.net/i/markdown-bar-for-comments.4061))
* **[CHANGE]** Newly created idea will now display under pinned ones as it should (reported by [Tigerpanzer_02](https://app.feedbacky.net/i/new-ideas-get-added-over-pinned-idea.4059))
* **[FIX]** Reset idea create modal description when posting new idea (reported at [Feedbacky](https://app.feedbacky.net/i/reset-description-field-on-new-idea.4045))
* **[FIX]** `and X more` message didn't appear properly
* **[FIX]** Changelog create modal didn't preserve description on close (reported at [Feedbacky](https://app.feedbacky.net/i/changelog-create-modal-issue.4075))
* **[FIX]** Idea create modal didn't reset chosen tags and added attachment values (reported by [Tigerpanzer_02](https://app.feedbacky.net/i/new-idea-does-not-clear-previosly-used-values.4060))
* **[FIX]** Inconsistency between changelog update and create, description chars limit was 1800 and 2500.

### 1.0.0.RC.0
* **[FEATURE]** Reactions will now display who reacted
* **[FIX]** Scroll into view is now working properly even on mobile
* **[FIX]** `and 0 more` message fix for posts with exactly 3 reactions
* **[FIX]** Use `description` not `fields` field for Discord webhooks as they allow more characters

### 1.0.0.beta.10 (30.01.2022)
* **[FEATURE]** Implement light/dark mode text visibility indicator when choosing theme color for board/tags
* **[FEATURE]** Changelogs can now be shared with share box links (requested by [Matou0014](https://app.feedbacky.net/i/changelog-options.2942))
* **[FEATURE]** Boards can now configure whether users can comment closed ideas or not (requested at [Feedbacky](https://app.feedbacky.net/i/commenting-closed-ideas.3361))
* **[FEATURE]** Ideas' titles can now be edited by moderators (requested by [srnyx](https://app.feedbacky.net/i/ability-for-mods-to-change-idea-titles.3011))
* **[IMPROVEMENT]** Center moderative comments icon for mobile users when it's longer than 1 line
* **[CHANGE]** Distinguish non selected reactions even better (removed borders)
* **[FIX]** Comment and changelogs reactions are no longer left with null values in a database, they're properly removed
* **[FIX]** Changelog webhooks didn't work properly
* **[FIX]** Add background for non chosen and chosen reactions based on theme color to be visible in changelogs all the time
* **[FIX]** Changelog titles could overflow the page
* **[FIX]** Default markdown buttons interaction when no selection was made was to show `null` as a selection
* **[FIX]** Moderator assign modal UI fix
* **[FIX]** Form control placeholder text transparency (not working as intended on Chrome)
* **[FIX]** Setup cards UI fix (for Chrome)

### 1.0.0.beta.9
* **[FEATURE]** You can now check for similar ideas when writing new one in a modal (requested at [Feedbacky](https://app.feedbacky.net/i/show-similar-ideas-when-writing-new-idea.3297))
* **[FEATURE]** Added GitLab login support (requested by [AnonDev](https://app.feedbacky.net/i/more-oauth-providers.3194))
* **[FEATURE]** Comments and changelogs can now be reacted with emotes (requested by [Matou0014](https://app.feedbacky.net/i/comments-reaction.3219))
* **[FEATURE]** Existing webhooks can now be edited (requested by [Matou0014](https://app.feedbacky.net/i/edit-webhooks.3932))
* **[IMPROVEMENT]** Minor performance improvements for re-render of every comment while writing and posting new comment
* **[CHANGE]** Changelogs description length increased from 1800 chars to 2500
* **[FIX]** Tag edit modal now updates values properly when editing multiple tags
* **[FIX]** Don't mark freshly edited comments (within 5 minutes) with (edited) badge client-side
* **[FIX]** Reload button for failed with load comments/changelogs/ideas is now working properly
* **[FIX/REMOVE]** Brought back previous discord webhook library, current one contains some limitations and is no longer needed for current features

### 1.0.0.beta.8
* **[FEATURE]** Added strikethrough to markdown buttons
* **[IMPROVEMENT]** On network error display more friendly error messages with reload button
* **[IMPROVEMENT/CHANGE]** Major and minor UI changes:
  * Make log-in button more noticeable
  * Minor UI adjustments especially for mobile users
  * Internal comments are now evenly aligned with other comments in ideas Discussion section
  * Update markdown buttons and forms design
  * Loadable buttons have their spinners changed using new neat effect 
  * Various UI elements no longer use scale animation on hover but color adjustment
* **[CHANGE]** Changed comment max chars limit to 1800
* **[CHANGE]** Now hiding user email address client-side for privacy purposes e.g. mail@example.com -> m*****l@example.com
* **[FIX]** Minor UI fixes:
  * Emotes in markdown containers are no longer transparent but fully visible
  * When selecting tag in light mode it had transparent background
  * Chrome downscale blur for many images across the page should no longer occur
  * Markdown images will now fit their true (not 100%) width to the container
  * Board delete modal didn't use UiKeyboardInput element
  * Minor Light UI inconsistencies
* **[FIX]** Users couldn't edit their own ideas if they weren't board moderators
* **[FIX]** Mail notifications toggle didn't set proper values client-side but did server-side
* **[FIX]** Choosing tag filter and switching boards threw No ideas found error
* **[FIX]** On network error in idea Discussion section two errors were displayed: Network Error and No comments error
* **[FIX]** Attachments couldn't be deleted once uploaded
* **[FIX]** Changelogs discord webhooks weren't published due to server-side error

### 1.0.0.beta.7
* **[FEATURE]** Users can now be assigned to ideas (requested by [Matou0014](https://app.feedbacky.net/i/assignable-ideas.2876))
* **[FEATURE]** Idea votes can now be reset (all votes or anonymous ones) (requested at [Feedbacky](https://app.feedbacky.net/i/more-moderation-options.2662))
* **[FEATURE]** Search box now searches by description containing the input as well
* **[FEATURE]** Added search box to changelogs section
* **[IMPROVEMENT]** Search box now respects filters and sort values
* **[FIX]** Improper date parsing didn't show new changelog notification bubble
* **[FIX]** Reset tag update modal to default values after canceling action
* **[FIX]** Suspensions no longer worked

### 1.0.0.beta.6
* **[CHANGE]** Mail unsubscribe tokens are now longer
* **[FIX]** Editing changelogs crashed the app
* **[FIX]** After editing changelog once again changelog title in modal was missing
* **[FIX]** Accents and unicode symbols were replaced by html entity tags in various places (reported by [Matou0014](https://app.feedbacky.net/i/symbols-and-accents-gets-replaced-by-tags.2844))
* **[FIX]** Ideas filtered through Tags filtering or accessed via roadmap had all boolean values set to true (Database issue)
    
    Fixes `* Ideas retrieved via roadmap API route contains every boolean set to true even if they're not when user is not logged in.
  When logged in only some of them are true.`
* **[FIX]** Editing own comments crashed the app
* **[FIX]** Discord webhook didn't execute properly when idea or changelog title contained special characters (reported by [ANONYMANONYM](https://app.feedbacky.net/i/changelogs-are-not-sent-to-webhook.3220)) 

### 1.0.0.beta.5
* **[FEATURE]** Added small notification bubble if there is new unseen changelog posted
* **[IMPROVEMENT]** Improved navbar sections (Feedback, Changelog, Roadmap) for mobile users (requested at [Feedbacky](https://app.feedbacky.net/i/extended-navbar-on-mobile.3585))
* **[IMPROVEMENT]** Aligned all tag elements inside Filtering dropdown to be exactly same in width
* **[FIX]** 0 wasn't displayed as a badge in Filtering dropdown elements 

### 1.0.0.beta.4
* **[FEATURE]** Allow logging in via email address (requested by [ANONYMANONYM](https://app.feedbacky.net/i/add-option-to-login-just-with-email.2508))
* **[FEATURE]** Ideas can now be pinned and unpinned (requested by [Matou0014](https://app.feedbacky.net/i/pinnable-ideas.2875))
* **[FEATURE]** You can now upload attachment while editing idea (if not previously attached) (requested by [Matou0014](https://app.feedbacky.net/i/send-multiple-attachements.2680))
* **[IMPROVEMENT]** While changing idea state (open/close/pin etc.) comments will be refetched to contain latest changes in idea
* **[CHANGE]** Increase login cookie time from 14 days to 30
* **[FIX]** Logging out from profile page crashed the app
* **[FIX]** Warning and error toasts are now dark mode aware (will apply lighter color)

### 1.0.0.beta.3
* **[IMPROVEMENT]** Trend score received an improvement, now it includes subscribers and comments amount and it's should be 1.0 by default
to be seen at the top of ideas list
* **[FIX]** Inconsistency between sidebar and navbar theme colors in Profile Page

### 1.0.0.beta.2
* **[IMPROVEMENT]** Improve mails design and extended support for mail clients
* **[FIX]** Snackbars background color was shorter than the whole snackbar
* **[FIX]** Snackbars undo button was outside the snackbar
* **[FIX]** Default user avatar link replaced from /generator.php?name=xyz to /generator/xyz so different avatars won't be displayed if another query string is added
eg. ?name=Plajer?size=32 (broken, outputs Plajer?size=32)

### 1.0.0.beta.1
* **[IMPROVEMENT]** Snackbars are updated to look like other parts of the UI (transparent background, bold full color text)
* **[IMPROVEMENT]** Migrator is now using batch entry updates for better performance
* **[FIX]** Show confidential board data (API keys) only to admins and owners of the board not moderators
* **[FIX]** Profile page light theme color when switching from Dark to Light mode didn't change properly
* **[FIX]** Board creator navbar crashed the app when leaving the creator page while using it
* **[FIX]** Ensure error in tab title is properly set when error page shows up
* **[FIX]** Social links container in board banner will no longer show on mobile if it's empty - empty whitespace was there before

** **TODO** **
* Make migrator more stable

** **KNOWN BUGS** **
* Theme gets set to the default theme while switching between light and dark themes in Appearance settings

### 1.0.0.alpha.7 (July 12, 2021)
* **[FEATURE]** Changelogs can now be edited
* **[FEATURE]** User settings page is now directly tied to previous board so users won't leave currently viewed board
* **[IMPROVEMENT]** Increase tap target of mobile navbar Feedback/Roadmap/Changelog buttons (Mobile Friendly improvement from Google Lighthouse)
* **[CHANGE]** Removed dark mode CSS variables, they'll now override light mode variables when dark mode is enabled
* **[FIX]** Color picker in light mode had dark background
* **[REMOVE]** Roboto Light unused font is no longer included in CSS and won't be loaded anymore

### 1.0.0.alpha.6
* **[FEATURE]** Changelogs and roadmaps can now be disabled
* **[FEATURE]** You can now share ideas using Share Box (share to Facebook, Twitter or copy link) (requested at [Feedbacky](https://app.feedbacky.net/i/share-buttons.2612))
* **[IMPROVEMENT]** Links are now colored based on current page theme (requested at [Feedbacky](https://app.feedbacky.net/i/make-links-color-from-theme-color.3213))
* **[IMPROVEMENT]** Changelogs can now be deleted
* **[IMPROVEMENT]** Align public tags evenly in idea create modal (requested by [srnyx](https://app.feedbacky.net/i/align-tags-better.2933))
* **[FIX]** Changelogs webhook title wasn't displayed correctly
* **[FIX]** Height of some forms was set improperly
* **[FIX]** Tags weren't updated in comments once renamed (reported and fixed by [Matou0014](https://app.feedbacky.net/i/tag-name-not-updated-if-renamed.3197))
* **[FIX]** Idea description while writing new idea in modal should persist now after leaving the modal (reported at [Feedbacky](https://app.feedbacky.net/i/persist-idea-description-while-writing.3214))

### 1.0.0.alpha.5
* **[FEATURE]** Allow users to edit their comments (requested by [Matou0014](https://app.feedbacky.net/i/edit-comments.2681))
* **[FEATURE]** Added changelogs feature (still working on it) (requested at [Feedbacky](https://app.feedbacky.net/i/changelogs.1343))
* **[FEATURE]** Added simple markdown buttons (bold, italics, image, link) for some larger text areas
* **[CHANGE]** Markdown is now stripped at idea card descriptions to display clearer text (suggested by Matou0014)
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