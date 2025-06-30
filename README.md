# Breakout style game
---
## Overview
---
Breakout is a block busting game, where each level increase the challenge through increase of ball speed and more hits required to clear a level.
Each block is colour coded so that each time it is hit, the block changes colour and then eventually breaks.

Using a canvas and CSS styling on a basic HTML page, I have created a completely Java Script based version of it, that could be used on sites as a break from massive amounts of information, or just as a fun, addictive game.

Breakout, the original game was released in 1976, quickly becoming a cult classic and the basis for the creation of a multitude of similar games.

#### [https://en.wikipedia.org/wiki/Breakout_(video_game)] "The game was a worldwide commercial success. It was among the top five highest-grossing arcade video games of 1976 in the U.S. and Japan, and among the top three in both countries for 1977."
---
![responsive website](media/ResponsiveMockup.png "Mock-up of the responsive website")
---
## Table of Contents
---

- Site Structure and Design

---
## Site Structure and Design
---
![wireframe of site](media/Wireframe.png "Wireframe image of the layout of the site, on 3 screen sizes")

Above is a basic wireframe design of how I wanted the website to look.  
I have organised the files into specific folders; 'css', 'javascript' & 'media' relevent to each type of file. As stated earlier, the project consists of HTML, CSS and Javascript.  Each written in their own files.  I have not used Phaser or anything else to write this code, it is of my own writing.  

### HTML

- index.html - This is the loading page and where the game, instructions and leaderboard are displayed.

### CSS
  #### css folder
- breakout.css - This is where the styling for the game was originally, and I had a separate style sheet for the HTML.  It made no sense to keep them separate, so I combined them.

### JavaScript
  #### javascript folder
- breakout.js - The functions and build of the game is in this file.  I kept it as a single file, to improve loading times.

### Media
  #### media folder
- background.jpg - One of my background choices for the site.  I found this to be too busy for the game and caused a distraction.
- background1.jpg - Another background that I found and decided would be too busy for the game.
- CSS Validator.png
- HTML Validator.png
- ResponsiveMockup.png
- Wireframe.png

---
## User Experience Design

### User Experience
- #### Target Audience
  - Any age group, though a particular appeal to those who remember the basic game styles.
  - Use to build hand-eye co-ordination
  - A Gamer or casual player.

- #### Expectations
  - A clear & concise game that is quick to load and easy to play.
  - A level system that increases in difficulty each level passed.
  - A webpage and game that functions as expected.  All buttons behave as they should and controls act as required.
  - A scoring system that allows a quick and easy way to view and track scores.

- #### Visitor Goals
  - ##### First Time Visitor
    - "What is this game?"
    - "How do I control this?"
  
  - ##### Returning Visitor
    - "Are my scores still here?"
    - "Can I beat my scores from last time?"
  
  - ##### Frequent Visitor
    - "Can I play this on any device?"

- #### Criteria To Meet
  - Is the game self explanatory, is it easy to identify as a game?
  - Are the methods of controlling the game clear and easy to read?
  - Is the Scoreboard accessible and easy to read?
  - Are the scores saved and will they update?
  - Is the game and web page responsive in design?
  - Does the background cause a distraction and allow all text to be easily viewed?

- #### Methods to Acheive the Criteria
  - There is a title and easily recognisable game title both on the webpage and the tab on the browser.
  - The instuctions are constantly visible and in a large clear font and colour.
  - The score board needs to load on page load and then again at game over.
  - The score board need to update with new high scores as well as store and recall on each load.
  - Use Bootstrap or CSS design to create a responsive design.
  - Check the backgrounds and have people test the game, asking specifically if the background is distracting.

---
## Design
### Colours
  - #### Blocks
    - #FFC107 Orange (1 hit left)
    - #00BCD4 Cyan (2 hits left)
    - #E91E63 Pink/Red (3 or more hits left)
  - #### Paddle & Ball
    - #808080 - The ball colour
    - #D3D3D3 - The paddle colour
    - #000000 - Background

### Fonts
 I have used 'Google Inter' as my main font with Arial as a back up as they are both in the Sans Serif family.
 Using the font across the entire site has helps to keep everything simplistic and aesthetically pleasing.

 ### Media
 Using a picture for a backgorund made everything too distracting.  I have changed it to be a Radial Gradient background:
 radial-gradient(circle, 
    rgba(0,17,36,0.9248291571753986) 50%, rgba(121,9,35,1) 80%, rgba(0,212,255,1) 90%)  I used this colour scheme and positioning, to 
    allow for the canvas and instructions to stay easily readable and the background to remain aesthetically pleasing.

  Here are the other two backgrounds I tried:
  ![Moon Scape Background](/media/background.jpg "A dark but detailed moonscape background.")
  ![Matrix Style Background](/media/background1.jpg "A background in the style of the Matrix computers")
---
## Testing
To test this site and game, I used the usual CSS, HTML and Lighthouse checks.
I also asked several peers to test the game for me.  I have summurised the responses and added my solutions.

### Peer reviews
-  #### Issue - "I don't have any time to prepare before a level starts, or I lose a life."
  - #### I have added a 3 second countdown timer and a pause function to allow for breaks and time to prepare.
- #### Issue - "The background is too distracting from the game"
  - #### I changed the background to the Radial Gradient design it is now.
- #### Issue - "I can't see my lives, score or level properly when they are on the game area.""
  - #### I have moved the game stats to below the canvas
- #### Issue - "It would be nice to have a play again option"
  - #### I have added a 'Play Again' button.  I do need to move it out of the game area, but this will be a future improvement.

### Validation
CSS Validation:
![CSS Validation Results](/media/CSS%20Validator.png)

HTML Validation:
![HTML Validation Results](/media/HTML%20Validator.png)

Light House Desktop Results:
![Light House Desktop Results](/media/lighthousetestDesktop.png)

Light House Mobile Results
![Light House Mobile Results](/media/lighthousetestMobile.png)

---
## Technologies Used
### Languages
HTML, CSS & Javascript for the design and creation of the site and game.

![Figma - Wireframes and Mind board](https://www.figma.com)
![Git, Github & Git Codespaces - Storage, editing and tracking the project](https://github.com/rhcompbuilds/CIMilestone2)
![Visual Studio Code - For my initial creation and coding while I was away from my desk](https://code.visualstudio.com)
![Google Developer Tools - Checking and troubleshooting all aspects of the site and game](/media/DevTools.png)
---
## Deployment
### To Deploy:
![The page is deployed using GitHub Pages](https://rhcompbuilds.github.io/CIMilestone2/ "Path to current deployed page")

### Local Development

- #### Fork the repository:

  1. Log in (or sign up) to Github.
  2. Go to the repository for this project, rhcompbuilds/CIMilestone2/
  3. Click the Fork button in the top right corner.

- #### Clone the repository:

  1. Log in (or sign up) to GitHub.
  2. Go to the repository for this project, rhcompbuilds/CIMilestone2/  (These are private, so you will only be able to do this with my permission)
  3. Click on the code button, select whether you would like to clone with HTTPS, SSH or GitHub CLI and copy the link shown.
  4. Open the terminal in your code editor and change the current working directory to the location you want to use for the cloned directory.
  5. Type 'git clone' into the terminal and then paste the link you copied in step 3. Press enter.
---
## Known Issues
 So far, the only issue I have found is that the 'Play Again' Button covers the leaderboard.
   To correct this, I will move the button into the stats area of the game, so it is completely removed from the canvas.

---
## Credits

#### The Original Breakout and Pong games 
  - I have played these and emulated versions of these for years.  I have enjoyed creating a similar game with this design.

#### Spencer Barriball
  - Spencer has provided me with great feedback and supported me with advice on layout and the Markdown language, by providing a reference guide.
  - Thank you for your help and support.

#### Tom Cowen
  - Amazing support and understanding throughout these last few weeks.  Thank you for your help and support.

#### My Peer Group
  - Thank you for taking the time to test and evaluate my game verbally.  It was a big help.