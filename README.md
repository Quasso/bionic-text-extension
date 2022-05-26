# Bionic Reader Extension

## UI

![BRE Cover Image](assets/bre-cover-image-chrome-webstore.png "Bionic Reader Extension: Cover Image")

###  Example A in action (MIT Technology Review)

![MIT Technology Review](assets/Extension_MIT.png "Bionic Reader Extension: MIT Technology Review")

###  Example B in action (Wikipedia)

![Wikipedia](assets/Extension_Wikipedia.png "Bionic Reader Extension: Wikipedia")

## Description

A new concept called Bionic Reading aims to increase readability of text for humans.

This extension converts text on-the-fly into Bionic Text. The goal of this extension is partly to measure and adapt the techniques around this, probably on an individual basis, because the original author of this plugin believes that the value of this technique is highly dependent upon a number of factors which must increase legibility of text.

## Development

If you're a developer and would like to contribute, you are (probably!) welcome!

For now, if you contact me directly or file a [sensible] issue on the repo, you may well be invited to join the project as a "core" or "ephemeral" contributor.

## Get started

Clone this repo:

```zsh
git clone https://github.com/Quasso/bionic-reader-extension.git;
cd bionic-reader-extension
```

Open this project in your favourite editor, then run:

```zsh
code .; npm install; npm run build
```

From your terminal (at the root of this project!).

Next, if you are viewing this repo from your Chrome browser, click below to navigate to the extensions page:

[chrome://extensions](chrome://extensions)

Alternatively, copy the following address and paste it into Chrome:

```zsh
chrome://extensions/
```

Next, toggle "Developer mode" in the top right hand corner.

Finally, click the "Load unpacked" button on the left hand side of the page. Navigate to your copy of this repository, specifically the `./dist` dir.

## Official Published Extension

Coming very soon! It has been submitted for approval as of 26 May. Once it's live I will update the repo with a link to the install page :)

## With <3 from Alex

Thanks for checking this out. I did hack this together quickly on a Saturday for the first working version but have tidied things up, experimented with ideas and refactored/enhanced things a lot since then prior to publishing v1.0.0. If you like it, I'm delighted!

Please feel free to fork this repository and strip it back to create your own Chrome extensions if you think it a worthy baseline! The webpack config will need modifying to support new use cases but this can be improved. I just made it work with this quite practically so far.
