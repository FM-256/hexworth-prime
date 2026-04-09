# Generate images with AI

**Module slug:** `generate-images-azure-openai`
**Source:** https://learn.microsoft.com/en-us/training/modules/generate-images-azure-openai/
**Units:** 7

## Table of Contents

1. Introduction
2. What are image-generation models?
3. Explore image-generation models in Microsoft Foundry portal
4. Create a client application that uses an image generation model
5. Exercise - Generate images with AI
6. Module assessment
7. Summary

---


# Introduction

- 1 minute
With Microsoft Foundry, you can use language models to generate content based on natural language prompts. Often the generated content is in the form of natural language text, but increasingly, models can generate other kinds of content.
For example, the OpenAI gpt-image-1 model can create original graphical content based on a description of a desired image.
The ability to use AI to generate graphics has many applications; including the creation of illustrations or photorealistic images for articles or marketing collateral, generation of unique product or company logos, or any scenario where a desired image can be described.
In this module, you'll learn how to develop an application that uses generative AI to generate original images.

---


# What are image-generation models?

- 2 minutes
Microsoft Foundry supports multiple models that are capable of generating images, including (but not limited to):
- The OpenAI gpt-image-1 series of models.
- The Black Forest Labs FLUX series of models.
Tip
View the Model catalog for the full set of models available in Microsoft Foundry. In the Foundry portal you can filter by inference task to find text to image models.
Image generation models are generative AI model that can create graphical data from natural language input. Put more simply, you can provide the model with a description and it can generate an appropriate image.
For example, you might submit the following natural language prompt to an image generation model:
A robot eating spaghetti
This prompt could result in the generation of graphical output such as the following image:
The images generated are original; they aren't retrieved from a curated image catalog. In other words, the model isn't a search system for finding appropriate images - it is an artificial intelligence (AI) model that generates new images based on the data on which it was trained.

---


# Explore image-generation models in Microsoft Foundry portal

- 3 minutes
To experiment with image generation models, you can create a Microsoft Foundry project and use the model playground in Microsoft Foundry portal to submit prompts and view the resulting generated images.
When using the playground (subject to model support), you can specify the resolution (size) of the generated images and include a reference image for the model to base it's output on.

---


# Create a client application that uses an image generation model

- 3 minutes
You can use a language-specific SDK (for example, the OpenAI Python SDK or the Azure OpenAI .NET SDK) to develop client applications that use models to generate images.
For example, the following Python code uses the OpenAI Images API to submit a request to a model to generate image of a robot eating a cheeseburger:

```
# Generate an image
img_results = client.images.generate(
    model="FLUX.1-Kontext-pro",
    prompt="A robot eating a cheeseburger.",
    n=1,
    size="1024x1024",
)

# Save the generated image
image_data = base64.b64decode(img_results.data[0].b64_json)
with open("image.png", "wb") as image_file:
    image_file.write(image_data)
```

The result is a binary stream containing the requested image:

---


# Exercise - Generate images with AI

- 20 minutes
Now it's your chance to use generative AI to create images. In this exercise, you'll provision a Microsoft Foundry project and deploy an image generation model. Then, you'll explore image generation in the Microsoft Foundry portal. Finally, you'll use the Python to consume the image generation model from a custom application.
Launch the exercise and follow the instructions.
Tip
After completing the exercise, if you've finished exploring Microsoft Foundry, delete the Azure resources that you created during the exercise.

---


# Module assessment

- 3 minutes
You want to find a model in Microsoft Foundry to generate images. Which inference task should you filter by?
Text to image
Image to text
Embeddings
Which OpenAI API can you use with image-generation models?
Video
Image
Graphics
You must answer all questions before checking your work.

---


# Summary

- 1 minute
This module described image generation models, and how you can use them in Microsoft Foundry to generate images based on natural language prompts. You can explore image generation models using the Images playground in Microsoft Foundry portal, and you can use REST APIs or SDKs to build applications that generate new images.

---

