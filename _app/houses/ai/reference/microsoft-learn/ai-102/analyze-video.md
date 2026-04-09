# Analyze video

**Module slug:** `analyze-video`
**Source:** https://learn.microsoft.com/en-us/training/modules/analyze-video/
**Units:** 7

## Table of Contents

1. Introduction
2. Understand Azure Video Indexer capabilities
3. Extract custom insights
4. Use Video Analyzer widgets and APIs
5. Exercise - Analyze video
6. Module assessment
7. Summary

---


# Introduction

- 3 minutes
It's increasingly common for organizations and individuals to generate content in video format. For example, you might use a cellphone to capture a live event, or you might record a teleconference that combines webcam footage and presentation of slides or documents. As a result, a great deal of information is encapsulated in video files, and you may need to extract this information for analysis or to support indexing for searchability.
In this module, you will learn how to use the Azure Video Indexer service to analyze videos.
After completing this module, youâll be able to:
- Describe Azure Video Indexer capabilities.
- Extract custom insights.
- Use Azure Video Indexer widgets and APIs.

---


# Understand Azure Video Indexer capabilities

- 3 minutes
The Azure Video Indexer service is designed to help you extract information from videos. It provides functionality that you can use for:
- Facial recognition - detecting the presence of individual people in the image. This requires Limited Access approval.
- Optical character recognition - reading text in the video.
- Speech transcription - creating a text transcript of spoken dialog in the video.
- Topics - identification of key topics discussed in the video.
- Sentiment - analysis of how positive or negative segments within the video are.
- Labels - label tags that identify key objects or themes throughout the video.
- Content moderation - detection of adult or violent themes in the video.
- Scene segmentation - a breakdown of the video into its constituent scenes.
The Video Analyzer service provides a portal website that you can use to upload, view, and analyze videos interactively.

---


# Extract custom insights

- 3 minutes
Azure Video Indexer includes predefined models that can recognize well-known celebrities, do OCR, and transcribe spoken phrases into text. You can extend the recognition capabilities of Video Analyzer by creating custom models for:
- People . Add images of the faces of people you want to recognize in videos, and train a model. Video Indexer will then recognize these people in all of your videos. Note This only works after Limited Access approval, adhering to our Responsible AI standard.
Note
This only works after Limited Access approval, adhering to our Responsible AI standard.
- Language . If your organization uses specific terminology that may not be in common usage, you can train a custom model to detect and transcribe it.
- Brands . You can train a model to recognize specific names as brands, for example to identify products, projects, or companies that are relevant to your business.

---


# Use Video Analyzer widgets and APIs

- 3 minutes
While you can perform all video analysis tasks in the Azure Video Indexer portal, you may want to incorporate the service into custom applications. There are two ways you can accomplish this.

## Azure Video Indexer widgets

The widgets used in the Azure Video Indexer portal to play, analyze, and edit videos can be embedded in your own custom HTML interfaces. You can use this technique to share insights from specific videos with others without giving them full access to your account in the Azure Video Indexer portal.

## Azure Video Indexer API

Azure Video Indexer provides a REST API that you can use to obtain information about your account, including an access token.

```
https://api.videoindexer.ai/Auth/<location>/Accounts/<accountId>/AccessToken
```

You can then use your token to consume the REST API and automate video indexing tasks, creating projects, retrieving insights, and creating or deleting custom models.
For example, a GET call to https://api.videoindexer.ai/<location>/Accounts/<accountId>/Customization/CustomLogos/Logos/<logoId>?<accessToken> REST endpoint returns the specified logo. In another example, you can send a GET request to https://api.videoindexer.ai/<location>/Accounts/<accountId>/Videos?<accessToken> , which returns details of videos in your account, similar to the following JSON example:

```
{
    "accountId": "SampleAccountId",
    "id": "30e66ec1b1",
    "partition": null,
    "externalId": null,
    "metadata": null,
    "name": "test3",
    "description": null,
    "created": "2018-04-25T16=50=00.967+00=00",
    "lastModified": "2018-04-25T16=58=13.409+00=00",
    "lastIndexed": "2018-04-25T16=50=12.991+00=00",
    "privacyMode": "Private",
    "userName": "SampleUserName",
    "isOwned": true,
    "isBase": true,
    "state": "Processing",
    "processingProgress": "",
    "durationInSeconds": 13,
    "thumbnailVideoId": "30e66ec1b1",
    "thumbnailId": "55848b7b-8be7-4285-893e-cdc366e09133",
    "social": {
        "likedByUser": false,
        "likes": 0,
        "views": 0
    },
    "searchMatches": [],
    "indexingPreset": "Default",
    "streamingPreset": "Default",
    "sourceLanguage": "en-US"
}
```


## Deploy with ARM template

Azure Resource Manager (ARM) templates are available to create the Azure AI Video Indexer resource in your subscription, based on the parameters specified in the template file.
For a full list of available APIs, see the Video Indexer Developer Portal .

---


# Exercise - Analyze video

- 30 minutes
Now it's your turn to try using the Azure AI Video Indexer service.
In this exercise, you analyze a video using the Azure AI Video Indexer portal and its API.
Note
To complete this lab, you need an Azure subscription in which you have administrative access.
Launch the exercise and follow the instructions.
Tip
After completing the exercise, if you've finished exploring Foundry Tools, delete the Azure resources that you created during the exercise.

---


# Module assessment

- 3 minutes

## Check your knowledge

You want Azure Video Indexer to analyze a video. What must you do first?
Use the Azure Vision service to extract key frames from the video.
Upload the video to Azure Video Indexer and index it.
Store the video file in an Azure blob store container.
You want Azure Video Indexer to recognize brands in videos recorded from conference calls. What should you do?
Edit the Brands model to show brands suggested by Bing, and add any new brands you want to detect.
Edit all recorded conference call videos to include a caption of each brand seen on their first appearance.
Embed the Azure Video Indexer widgets in a custom web site.
You must answer all questions before checking your work.

---


# Summary

- 3 minutes
In this module, you learned how to use the Azure Video Indexer service to analyze videos.
Now that you've completed this module, you can:
- Describe Azure Video Indexer capabilities.
- Extract custom insights.
- Use Azure Video Indexer widgets and APIs.
To find out more about the Azure Video Indexer service, see the Azure Video Indexer documentation .

---

