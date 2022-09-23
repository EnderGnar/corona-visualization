# corona-visualization
A HTML project to visualize switzerlands corona data.

This is just a personal project.

# usage
node main.js

#features
on the website you find a canvas which will be used to draw the visualizations.

to get something on the screen you first have to add a Process:
-> Add Import 
-> Theme: cases 
-> Filter: geoRegion 
-> add 
-> geoRegion: CHFL

then we have to scale the canvas accordingly:
-> Add scale call
-> add process id of our process to the scale call

finally we have to add the data to be drawn:
-> Add draw call
-> add process id of our process

press DRAW!
