# (AI-900) Get started with computer vision in Microsoft Foundry

**Module slug:** `get-started-computer-vision-azure`
**Source:** https://learn.microsoft.com/en-us/training/modules/get-started-computer-vision-azure/
**Units:** 8

## Table of Contents

1. Introduction
2. Understand Foundry Tools for computer vision
3. Understand Azure Vision Image Analysis capabilities
4. Understand Azure Vision's Face service capabilities
5. Get started in Microsoft Foundry portal
6. Exercise - Get started with computer vision in Microsoft Foundry
7. Module assessment
8. Summary

---


# Introduction

- 2 minutes
Computer vision is a field of artificial intelligence (AI) that enables machines to interpret and understand visual information from the worldâsuch as images, videos, and live camera feeds. Computer vision capabilities support the automation of time-intensive tasks and enable possibilities that did not exist before.
Consider some of these applications of computer vision:
- Manufacturing â Defect Detection : AI vision systems inspect products on assembly lines in real time. They detect surface defects, misalignments, or missing components using object detection and image segmentation, reducing waste and improving quality control.
- Healthcare â Medical Imaging Analysis : Computer vision helps radiologists analyze X-rays, MRIs, and CT scans. AI models can highlight anomalies like tumors or fractures, assist in early diagnosis, and reduce human error.
- Retail â Shelf Monitoring : Retailers use AI vision to monitor store shelves. Cameras detect when products are out of stock or misplaced, enabling real-time inventory updates and improving customer experience.
- Transportation â Autonomous Vehicles : Self-driving cars rely on computer vision to recognize road signs, lane markings, pedestrians, and other vehicles. This enables safe navigation and decision-making in dynamic environments.
AI vision systems can be created using a range of Foundry Tools. In this module we explore Azure Vision , a cloud service that developers can use to create a wide range of computer vision solutions.

---


# Understand Foundry Tools for computer vision

- 3 minutes
Azure AI provides a wide range of cloud-based services for various AI tasks, including computer vision. Microsoft's Azure Vision service provides prebuilt and customizable computer vision models that are based on deep learning models and provide various capabilities. Azure Vision provides "off-the-shelf" functionality for many common computer vision scenarios, while retaining the ability to create custom models using your own images.
Azure Vision service contains several products. Within Azure Vision, there are services that handle specific sets of tasks including:
- Azure Vision Image Analysis service : Detects common objects in images, tags visual features, generates captions, and supports optical character recognition (OCR).
- Azure AI Face service : Detects, recognizes, and analyzes human faces in images. Provides specific models for facial analysis that extend beyond what is available with image analysis.
There are many applications for Azure Vision's image analysis and face detection, analysis, and recognition. For example:
- Search engine optimization - using image tagging and captioning for essential improvements in search ranking.
- Content moderation - using image detection to help monitor the safety of images posted online.
- Security - facial recognition can be used in building security applications, and in operating systems for unlocking devices.
- Social media - facial recognition can be used to automatically tag known friends in photographs.
- Missing persons - using public cameras systems, facial recognition can be used to identify if a missing person is in the image frame.
- Identity validation - useful at ports of entry kiosks where a person holds a special entry permit.
- Museum archive management - using optical character recognition to preserve information from paper documents.
Note
Many modern vision solutions are built with a combination of capabilities. For example, video analysis capabilities are supported by Azure AI Video indexer . Azure AI Video indexer is built on several Foundry Tools, such as Face, Translator, Image Analysis, and Speech.
Next, let's take a look at some core Azure Vision Image Analysis capabilities.

---


# Understand Azure Vision Image Analysis capabilities

- 4 minutes
Azure Vision's image analysis capabilities can be used with or without customization. Some of the capabilities that do not require customization include:
- Describing an image with captions
- Detecting common objects in an image
- Tagging visual features
- Optical character recognition
Azure Vision has the ability to analyze an image, evaluate the objects in it, and generate a human-readable description of the image. For example, consider the following image:
Azure Vision returns the following caption for this image:
A person jumping on a skateboard
Azure Vision can identify thousands of common objects in images. For example, when used to detect objects in the skateboarder image discussed previously,  Azure Vision returns the following predictions:
- Skateboard (90.40%)
- Person (95.5%)
The predictions include a confidence score that indicates how confident the model is that what it describes is what is actually in the image.
In addition to the detected object labels and their probabilities, Azure Vision returns bounding box coordinates that indicate the top, left, width, and height of the object detected. You can use these coordinates to determine where in the image each object was detected, like this:
Azure Vision can suggest tags for an image based on its contents. Tags are associated with images as metadata. The tags summarize attributes of the image. You can use tags to index an image along with a set of key terms for a search solution.
For example, the tags returned for the skateboarder image (with associated confidence scores) include:
- sport (99.60%)
- person (99.56%)
- footwear (98.05%)
- skating (96.27%)
- boardsport (95.58%)
- skateboarding equipment (94.43%)
- clothing (94.02%)
- wall (93.81%)
- skateboarding (93.78%)
- skateboarder (93.25%)
- individual sports (92.80%)
- street stunts (90.81%)
- balance (90.81%)
- jumping (89.87%)
- sports equipment (88.61%)
- extreme sport (88.35%)
- kickflip (88.18%)
- stunt (87.27%)
- skateboard (86.87%)
- stunt performer (85.83%)
- knee (85.30%)
- sports (85.24%)
- longboard (84.61%)
- longboarding (84.45%)
- riding (73.37%)
- skate (67.27%)
- air (64.83%)
- young (63.29%)
- outdoor (61.39%)
Azure Vision service can use optical character recognition (OCR) capabilities to detect text in images. For example, consider the following image of a nutrition label on a product in a grocery store:
The Azure Vision service can analyze this image and extract the following text:

```
Nutrition Facts Amount Per Serving
Serving size:1 bar (40g)
Serving Per Package: 4
Total Fat 13g
Saturated Fat 1.5g
Amount Per Serving
Trans Fat 0g
calories 190
Cholesterol 0mg
ories from Fat 110
Sodium 20mg
ntDaily Values are based on
Vitamin A 50
calorie diet
```


## Training custom models

If the built-in models provided by Azure Vision don't meet your needs, you can use the service to train a custom model for image classification or object detection . Azure Vision builds custom models on the pre-trained foundation model, meaning that you can train sophisticated models by using relatively few training images.

### Image classification

An image classification model is used to predict the category, or class of an image. For example, you could train a model to determine which type of fruit is shown in an image, like this:
| Apple | Banana | Orange |
|---|---|---|
|  |  |  |

### Object detection

Object detection models detect and classify objects in an image, returning bounding box coordinates to locate each object. In addition to the built-in object detection capabilities in Azure Vision, you can train a custom object detection model with your own images. For example, you could use photographs of fruit to train a model that detects multiple fruits in an image, like this:
Note
Details of how to use Azure Vision to train a custom model are beyond the scope of this module. You can find information about custom model training in the Azure Vision documentation .
Next, let's look at capabilities specific to Azure Vision's Face service.

---


# Understand Azure Vision's Face service capabilities

- 3 minutes
As a product within Azure Vision, Azure AI Face supports specific use cases such as verifying user identity, liveness detection, touchless access control, and face redaction. Several concepts, including face detection and recognition, are essential to working with Face.

## Facial detection

Face detection involves identifying regions of an image that contain a human face, typically by returning bounding box coordinates that form a rectangle around the face, like this:
With Face, facial features can be used to train machine learning models to return other information, such as facial features such as nose, eyes, eyebrows, lips, and others.

## Facial recognition

A further application of facial analysis is to train a machine learning model to identify known individuals from their facial features. This is known as facial recognition , and uses multiple images of an individual to train the model. This trains the model so that it can detect those individuals in new images on which it wasn't trained.
When used responsibly, facial recognition is an important and useful technology that can improve efficiency, security, and customer experiences.

## Azure AI Face service capabilities

The Azure AI Face service can return the rectangle coordinates for any human faces that are found in an image, as well as a series of related attributes:
- Accessories : indicates whether the given face has accessories. This attribute returns possible accessories including headwear, glasses, and mask, with confidence score between zero and one for each accessory.
- Blur : how blurred the face is, which can be an indication of how likely the face is to be the main focus of the image.
- Exposure : such as whether the image is underexposed or over exposed. This applies to the face in the image and not the overall image exposure.
- Glasses : whether or not the person is wearing glasses.
- Head pose : the face's orientation in a 3D space.
- Mask : indicates whether the face is wearing a mask.
- Noise : refers to visual noise in the image. If you have taken a photo with a high ISO setting for darker settings, you would notice this noise in the image. The image looks grainy or full of tiny dots that make the image less clear.
- Occlusion : determines if there might be objects blocking the face in the image.
- Quality For Recognition : a rating of high, medium, or low that reflects if the image is of sufficient quality to attempt face recognition on.

## Responsible AI use

Important
To support Microsoft's Responsible AI Standard , Azure AI Face and Azure Vision have a Limited Access policy .
Anyone can use the Face service to:
- Detect the location of faces in an image.
- Determine if a person is wearing glasses.
- Determine if there's occlusion, blur, noise, or over/under exposure for any of the faces.
- Return the head pose coordinates for each face in an image.
The Limited Access policy requires customers to submit an intake form to access additional Azure AI Face service capabilities including:
- Face verification: the ability to compare faces for similarity.
- Face identification: the ability to identify named individuals in an image.
- Liveness detection: the ability to detect and mitigate instances of recurring content and/or behaviors that indicate a violation of policies (e.g., such as if the input video stream is real or fake).
Next, let's take a look at how you can get started with Azure Vision.

---


# Get started in Microsoft Foundry portal

- 4 minutes
Azure Vision provides the building blocks for incorporating vision capabilities into applications. As one of many Foundry Tools, you can create solutions with Azure Vision in several ways including:
- The Microsoft Foundry portal
- A software development kit (SDK) or REST API

## Azure resources for Azure Vision service

To use Azure Vision, you need to create a resource for it in your Azure subscription. You can use either of the following resource types:
- Azure Vision : A specific resource for the Azure Vision service. Use this resource type if you don't intend to use any other Foundry Tools, or if you want to track utilization and costs for your Azure Vision resource separately.
- Foundry Tools : A general resource that includes Azure Vision along with many other Foundry Tools; such as Azure Language, Azure AI Custom Vision, Azure Translator, and others. Use this resource type if you plan to use multiple AI services and want to simplify administration and development.
Note
There are several ways to create resources with Azure. You can use a user interface to create resources or write a script. Both the Azure portal and Microsoft Foundry portal provide user interfaces for resource creation. Choose the Microsoft Foundry portal when you also want to see examples of Foundry Tools in action.
Microsoft Foundry provides a unified platform for enterprise AI operations, model builders, and application development. Microsoft Foundry portal provides a user interface based around hubs and projects . To use any of the Foundry Tools, including Azure Vision, you create a project in Microsoft Foundry, which will also create a Foundry Tools resource for you.
Projects in Microsoft Foundry help you organize your work and resources effectively. Projects act as containers for datasets, models, and other resources, making it easier to manage and collaborate on AI solutions.
Within Microsoft Foundry portal, you have the ability to try out service features by testing with sample images or uploading your own.
Next let's try out Azure Vision in Microsoft Foundry portal.

---


# Exercise - Get started with computer vision in Microsoft Foundry

- 30 minutes
If you have an Azure subscription, you can use Microsoft Foundry to explore the capabilities of Azure Vision.
Note
If you don't already have one, you can sign up for an Azure subscription , which includes free credits for the first 30 days.
Launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes

## Check your knowledge

You want to use the Azure Vision service to identify the location of individual items in an image. Which of the following features should you retrieve?
Objects
Visual Tags
Dense Captions
How does the Face service indicate the location of faces in images?
A pair of coordinates for each face, indicating the center of the face
Two pairs of coordinates for each face, indicating the location of the eyes
A set of coordinates for each face, defining a rectangular bounding box around the face
Which of the following is a benefit of using the Microsoft Foundry portal for Azure Vision?
It only supports facial recognition features.
It provides a user interface with hubs and projects to organize and test AI services.
It limits access to only one Azure service at a time.
You must answer all questions before checking your work.

---


# Summary

- 1 minute
Azure Vision is a cloud-based service that offers both prebuilt and customizable computer vision models powered by deep learning. It supports a variety of tasks including object detection, image tagging, caption generation, and optical character recognition (OCR). The service is divided into specialized components:
- Image Analysis: Detects objects, tags features, generates captions, and performs OCR.
- Face Service: Detects and analyzes human faces with advanced facial recognition capabilities.
These tools are used in real-world applications such as SEO optimization, content moderation, security systems, social media tagging, identity validation, and digital archiving. You can get started with Azure Vision in Microsoft Foundry portal.
Tip
You can find out more about using the Azure Vision service in the service documentation .

---

