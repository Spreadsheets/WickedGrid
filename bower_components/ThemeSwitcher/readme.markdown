This is custom theme switcher that I've basically forked from jQuery UI's [Theme Switcher Widget](http://jqueryui.com/docs/Theming/ThemeSwitcher)

What I've done that makes my widget unique is a couple of things.

1. I've changed the urls for the images, so that they will work on sites outside of the jquery domain.  This was something that 
   I noticed was happening not only for me but also the community at large.
   
2. I've added the ability to add your own jQuery UI themes to the mix.  I've also included an example of how to do this using
   [Wijmo's Themes](http://wijmo.com/widgets/theming/). I'm just using Wijmo as an example because I, myself, am not a designer,
   and I needed a reference for how to do this.  As such, I'm not afiliated with Wijmo in any way.

3. You can easily exclude themes by passing in an array of the names which you want to exclude.

The Examples
----------------

- If you want to use the drop down with it's default behavior, please refer to index.htm.

- However, if you would like to add additional themes, other than the ones provided by jQuery UI,
  you can very easily add them, and a good example would be found in the addingcustomthemes.htm file.
  
- What if you don't want one of the themes that comes from jQuery UI?  You can optionally exclude any 
  of the default themes, and there's an example of how to do that in the excludethemes.htm file.
  
Dependencies
----------------

- [jQuery UI](http://jqueryui.com)

- [jQuery Templates](http://api.jquery.com/category/plugins/templates/)

Roadmap
----------------

- I want to be able to actually associate other theme files to the jQuery UI theme files.  The
  best way I can describe this would be as an example.  Let's say you have a site and you are using
  jQuery UI elements all throughout your site, but you're site has a certain color scheme / look and feel
  that is outside the realm of jQuery UI.  It would be nice if I could tell a designer to build a set of
  themes for my site, but that are all associated with the various jQuery UI themes that I am using (like
  say for instance UI Lightness, UI Darkness, Redmond, and Le Frog. Once the designer has finished his designs
  for each various theme, I would want to be able to associate those files with their respective themes
  in the theme switcher, so when someone picks a different theme, not only will it switch out the 
  jQuery UI theme, but also the underlying site theme.