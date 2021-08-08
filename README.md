# Table tennis visualizer

The goal of the project is to create a visualizer for table tennis.
It will have a rather broad scope.

## Audiances

1. It can be used by trainers to explain an exercise
2. It can be used by trainers to create a training
3. It can be used by coaches to prepare tactics
4. It can be used by coaches to track plays during the match
5. It can be used by coaches to analyze a match based on recordings
6. It can be used by TV to create intressting analytics

## Features

Following is a list of features that this project will generate

- Data
  - A data format that be imported and exported by various applications
  - Tracking the skeletons of players (single and double)
  - Tracking the ball (including accurancy)
  - Timeline (including metadata)
  - Assets (like movies and images)
  - Annotations
  - Tracking corrections and force behaviour
    - This is because when you follow a match you might wish to correct something afterwards. For example: You might have corrected to return but then noticed that the service is not accurate. Since changing the service would change the physical behaviour of the ball it would mean that the returning player should have behaved differently. The data should know when it should needs to enforce behaviour.
  - History
    - Because of the complexity of the game we can expect a lot of adjustments. This might also be the result of experimentations ("what-if" scenarios). It's important that people can share the data knowing the adjustments.
- Visualizer
  - The visualizer should be intressting and have a lot of customizations.
  - Visualizing the table
  - Visualizing the floor
  - Shadows and lights (!)
    - I can't stress how vital this is since the human mind uses shadow to determine the height of floating objects.
  - Visualizing the players (skeleton), footwork, bats (orientation, rotation, linear velocity, twirling, et cetera) and the ball.
  - Visualizing the score
  - Visualizing the area (since players can have different amount of space behind the table)
  - Adding 3D annotations (floating text boxes with an optional callout arrow)
  - Displaying a timeline
- Editor
  - Should work in the editor
  - Should be realtime
  - Has integrated history for a quick reverseal
  - Build in tutorial
  - Quick placement using a 9-grid (each side of the table is seperated in 9 grid and each oustide area is also divided in grids). That way the user can simply tap the position on the screen to determine where the ball should be placed.
  - Once the 9-grid is used, the user can quickly select the strokes played from the list.
- Simulation
  - Due to the difficulty of the sport, the system will use user inserted key-frames, automatic generated keyframes and will calculate intermediate frames based on that using algorithms. 
- Analyzer
- Presentator