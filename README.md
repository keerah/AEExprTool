# AE Expressions Tool

A simple scripted tool to add/disable/remove error handling code to Adobe After Effects expressions in bulk

---

## What

The tool gives you options to **Add/Enable** (Add/Uncomment), **Disable** (Comment), or **Remove** completely
the **try { } cath** instuctions in bulk.
You can also modify the **try {} catch** code and set your own regexp patterns for the commenting/uncommenting process (future feature).
The script respects indentation and its enabled by default, supports Undo.

## Why

When you have lots of error handled expressions within After Effects project it quickly becomes very 
difficult to test/change things. Moreover when inside **"try {} catch"** AE stops tracking the properties
name changes and you have to track them manually.

## How

You can run it as any other AE script using **File -> Scripts > Run Script...**
or alternatively put it into **Support Files\Script\ScriptUI Panels** to use it as a docable AE panel.

## When

This is very early release and not all the features have been implemented yet:

The functional scope mode is composition only for now.  
The RegExp search custom patterns are ignored yet, they just represent the hardcoded ones.  
The code needs a total restructuring, it was done fast to solve my current tasks.  
Tested on Windows. Mac support provided but not tested.  