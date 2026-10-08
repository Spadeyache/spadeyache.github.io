---
title: Following a path on slopes, where the robot slips
date: "[DATE]"
kind: hardcoded
pinned: true
project: RoboCupJunior Rescue
keywords: [line following, PID, wheel slip, suspension]
video: ../../media/video/slope-line-following.mp4
poster: ../../media/video/slope-line-following-first.png
caption: Line following across a flat-to-slope transition.
x: ""
---

## Problem

On slopes, the robot slipped and lost the line at transitions, while it tracked fine on flat ground.

## What I did

I ruled out perception and unit consistency first. The data was consistent, and the movement matched what the camera saw.

I then compared the same PID controller approaching the path from uphill and from downhill. The asymmetry showed that gravity-induced slip was the cause, and that the way the robot rotates toward the line had to account for it.

To change how the robot rotates, I had to understand how the rotational axis behaves on a four-wheel drive robot. The suspension was absorbing the rotation, so the axis was not something I could set in software. That took a hardware change.

Once I could place the axis, I moved it to the four extreme corners and compared each against gentle and steep slopes, uphill and downhill turns. Each position had conditions where it worked. That comparison showed where the axis should actually sit.

## Result

[RESULT WITH A NUMBER, e.g. success rate on slope transitions before → after]

## Still hardcoded

I chose the axis by hand, for the slopes I tested. A learned version would estimate slip on its own and adjust how it turns on terrain it has never seen.
