# kyakarun
A web app to help you decide what's best to do right now.

----

## TODOs in rough prioirity order
* Timer screen when say "okay" -- NEEDS TESTING

* View & Edit existing tasks
* Create a top bar with branding and menu
  * X button will become a right-facing arrow that takes the place of the menu
  * only menu item currently will be to list activities
* Add a settings section in the menu
  * only setting right now is whether or not to mix activities from nearby times
* Add default options under "can't" that include that "X minutes is too short/long for Y" if the activity idealtime doesn't match the suggested time
* Add priority as a new prop on activities and change the weighting
* Make it so you can add 1-time tasks that get archived when they're complete
* on selecting "naw" could ask for an optional reason why not (doubles the number of clicks to reject, is worth it?)

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

### Not going to do
* ~~Mix from times that are directly nearby *only* (reuse TIME_BREAK_POINTS)~~
