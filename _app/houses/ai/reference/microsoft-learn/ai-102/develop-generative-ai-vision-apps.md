# Develop a vision-enabled generative AI application

**Module slug:** `develop-generative-ai-vision-apps`
**Source:** https://learn.microsoft.com/en-us/training/modules/develop-generative-ai-vision-apps/
**Units:** 6

## Table of Contents

1. Introduction
2. Use a vision-capable model in the Microsoft Foundry portal
3. Develop a vision-based chat app
4. Exercise - Develop a vision-enabled chat app
5. Module assessment
6. Summary

---


# Introduction

- 1 minute
Generative AI models enable you to develop chat-based applications that reason over and respond to input. Often this input takes the form of a text-based prompt, but increasingly multimodal models that can respond to visual input are becoming available.
In this module, we'll discuss vision-enabled generative AI and explore how you can use Microsoft Foundry to create generative AI solutions that respond to prompts that include a mix of text and image data.

---


# Use a vision-capable model in the Microsoft Foundry portal

- 3 minutes
To handle prompts that include images, you need to deploy a multimodal generative AI model - in other words, a model that supports not only text-based input, but image-based (and in some cases, audio-based) input as well. Multimodal models available in Microsoft Foundry include (among others):
- Microsoft Phi-4-multimodal-instruct
- OpenAI gpt-4.1
- OpenAI gpt-4.1-mini
Tip
To learn more about available models in Microsoft Foundry, see the Microsoft Foundry Models overview article in the Microsoft Foundry documentation.

## Testing multimodal models with image-based prompts

After deploying a multimodal model, you can test it in the chat playground in Microsoft Foundry portal.
In the chat playground, you can upload an image from a local file and add text to the message to elicit a response from a multimodal model.

---


# Develop a vision-based chat app

- 5 minutes
To develop a client app that engages in vision-based chats with a multimodal model, you can use the same basic techniques used for text-based chats. You require a connection to the endpoint where the model is deployed, and you use that endpoint to submit prompts that consists of messages to the model and process the responses.
The key difference is that prompts for a vision-based chat include multi-part user messages that contain both a text content item and an image content item.

## Submit an image-based prompt using the Responses API

To include an image in a prompt using the Responses API, specify a URL for a web-based image file, or load a local image and encode its data in Base64 format and submit a URL in the format data:image/jpeg;base64,{image_data} (replacing "jpeg" with "png" pr other formats as appropriate).
The following Python example shows how to submit an image in a prompt using the Responses API:

```
# Read the image data from a local file
image_path = Path("dragon-fruit.jpeg")
image_format = "jpeg"
with open(image_path, "rb") as image_file:
    image_data = base64.b64encode(image_file.read()).decode("utf-8")

data_url = f"data:image/{image_format};base64,{image_data}" # You can also use a web URL

# Send the image data in a prompt to the model
response = client.responses.create(
    model="gpt-4.1",
    input=[
        {"role": "developer", "content": "You are an AI assistant for chefs planning recipes."},
        {"role": "user", "content": [  
            { "type": "input_text", "text": "What desserts could I make with this?"},
            { "type": "input_image", "image_url": data_url}
        ] } 
    ]
)
print(response.output_text)
```


## Submit an image-based prompt using the ChatCompletions API

When using the Azure OpenAI endpoint to submit prompts to models that don't support the Responses API, you can use the CatCompletions API; like this:

```
# Read the image data from a local file
image_path = Path("orange.jpeg")
image_format = "jpeg"
with open(image_path, "rb") as image_file:
    image_data = base64.b64encode(image_file.read()).decode("utf-8")

data_url = f"data:image/{image_format};base64,{image_data}" # You can also use a web URL

# Send the image data in a prompt to the model
response = client.chat.completions.create(
    model="Phi-4-multimodal-instruct",
    messages=[
        {"role": "system", "content": "You are an AI assistant for chefs planning recipes."},
        { "role": "user", "content": [  
            { "type": "text", "text": "What can I make with this fruit?"},
            { "type": "image_url", "image_url": {"url": data_url}}
        ] }
    ]
)
print(response.choices[0].message.content)
```


---


# Exercise - Develop a vision-enabled chat app

- 30 minutes
If you have an Azure subscription, you can complete this exercise to develop a vision-enabled chat app.
Note
If you don't have an Azure subscription, you can sign up for an account , which includes credits for the first 30 days.
Launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes
Which kind of model can you use to respond to visual input?
Only OpenAI GPT models
Embedding models
Multimodal models
How can you submit a prompt that asks a model to analyze an image?
Submit one prompt with an image-based message followed by another prompt with a text-based message.
Submit a prompt that contains a multi-part user message, containing both text content and image content.
Submit the image as the system message and the instruction or question as the user message.
How can you include an image in a message?
As a URL or as binary data
Only as a URL
Only as binary data
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you learned about vision-enabled generative AI models and how to implement chat solutions that include image-based input.
Vision-enabled models let you create AI solutions that can understand images and respond to related questions or instructions. Beyond just identifying objects in pictures, some models can also use reasoning based on what they see. For instance, they can interpret a chart or assess if an object is damaged.
Tip
For more information about analyzing images with the OpenAI Responses API, see, see Images and vision in the OpenAI developer guide.

---

