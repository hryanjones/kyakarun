# kyakarun
A web app to help you decide what's best to do right now.

----

## TODOs in rough prioirity order
* View & Edit existing tasks (goes to same place as done -> archive)
* Add priority as a new prop on activities and change the weighting
* Create a top bar with branding and menu
  * X button will become a right-facing arrow that takes the place of the menu
  * only menu item currently will be to list activities
* Add a settings section in the menu
  * only setting right now is whether or not to mix activities from nearby times
* Mix from times that are directly nearby *only* (reuse TIME_BREAK_POINTS)
* Timer screen when say "okay"
* Make it so you can add 1-time tasks that get archived when they're complete

### Nice to haves
* notification on the top (have to allow site to send notifications)
&npsp;&nbsp;* notifications would be for entering the app and saying what you're currently doing
* Tell the browser to cache the site
* logo

### Completed TODOs
* ~~do weighted choice... Array with values equal to object, repeats for higher priority, & result being the same object.~~
* ~~Also select tasks at next level up or down at smaller weighted rate~~
* ~~break things up into smaller components~~
* ~~use an object to store todos, I mean activities~~
* ~~Has to be really easy to add a task (big + always visible on bottom right)~~
* ~~Each thing should have a time range associated with it (any by default)~~
* ~~local storage~~

## Constraints
* each activity can have "constraints"
* examples:
  * because I need "a quiet place" (e.g. meditate, stretch,)
  * because I need "to be at home"
  * because I need "an internet connection"
  * because I need "a real computer"
* in additon to "okay" option when an activity is suggested it should display two other options:
  1. "can't"
    * when this is displayed it should expand any existing constraints as options to select
    * when one of these is selected, it should also add this to a "rejectedConstraints" state object which will filter out just like rejected does
  2. "don't want to"
    * Future: this should ask for a reason and log it. In the future can provide statistics and stuff
