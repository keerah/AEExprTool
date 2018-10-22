AE_ExprTool
===========

A simple scripted tool to add/disable/remove error correction code to Adobe After Effect expressions in bulk.

---

## What

The tool gives you options to **Add**/Uncomment, **Disable** (comment), ot **Remove** try{ } cath instuctions in bulk.
You can also modify the try-catch code and set your own regexp patterns for the commenting/uncommenting process.

## Why

When you have lots of error controlled expressions within #AfterEffects project it quickly becomes very
difficult to test/change things. Moreover when inside **"try {} catch"** #AE stops tracking the properties
names, and you have to do it manually.

## When

This is very early release and not all the features have been implemented yet:

The working scope mode is "composition" only. 
The search patterns are ignored.
The code needs a total restructuring.
The UI fully dockable but barely resizable.
Tested on Windows. Mac support provided but not tested.
