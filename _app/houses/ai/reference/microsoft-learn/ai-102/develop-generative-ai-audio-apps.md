# Develop a speech-capable generative AI application

**Module slug:** `develop-generative-ai-audio-apps`
**Source:** https://learn.microsoft.com/en-us/training/modules/develop-generative-ai-audio-apps/
**Units:** 7

## Table of Contents

1. Introduction
2. Choose a speech-capable model
3. Transcribe speech
4. Synthesize speech
5. Exercise - Use speech-capable generative AI models
6. Module assessment
7. Summary

---


# Introduction

- 1 minute
Speech transcription and synthesis are useful capabilities in many scenarios, including:
- Documenting spoken conversations in calls and meetings.
- Generating captions for videos or presentations.
- Creating audible user interfaces to improve application accessibility.
- Developing hands-free AI assistants that read text messages or emails aloud.
In this module, we'll explore how to use speech-capable generative AI models in Microsoft Foundry to convert speech to text and text to speech.

---


# Choose a speech-capable model

- 3 minutes
Microsoft Foundry Models is a model catalog that includes generative AI models from multiple providers. Different models have different capabilities, and are optimized for different use-cases.
To find a suitable model, you can use the filter and search features in the Microsoft Foundry Portal.
When it comes to speech-capable models, there are two common use-cases to consider:
- Generative AI models that can transcribe speech to text.
- Generative AI models that can synthesize text to speech.
Microsoft Foundry provides models that support both of these use-cases, including specialized speech-capable models from the gpt-4o family of OpenAI models.
Tip
To learn more about available models in Microsoft Foundry, see the Microsoft Foundry Models overview article in the Microsoft Foundry documentation.

---


# Transcribe speech

- 3 minutes
Speech transcription, or speech-to-text , involves submitting audio content to a model, which responds with a text-based transcript of the speech in the audio source.
Models that support speech-to-text operations include:
- gpt-4o-transcribe
- gpt-4o-mini-transcribe
- gpt-4o-transcribe-diarize
Note
Model availability varies by region. Review the model regional availability table in the Microsoft Foundry documentation.

## Using a speech-to-text model

To use a speech-to-text model in your own application, you can use the AzureOpenAI client in the OpenAI SDK to connect to the endpoint for your Microsoft Foundry resource, and upload the contents of an audio file to the model for transcription.

```
from openai import AzureOpenAI
from pathlib import Path

# Create an AzureOpenAI client
client = AzureOpenAI(
    azure_endpoint=YOUR_FOUNDRY_ENDPOINT,
    api_key=YOUR_FOUNDRY_KEY,
    api_version="2025-03-01-preview"
)

# Get the audio file
file_path = Path("speech.mp3")
audio_file = open(file_path, "rb")

# Use the model to transcribe the audio file
transcription = client.audio.transcriptions.create(
    model=YOUR_MODEL_DEPLOYMENT,
    file=audio_file,
    response_format="text"
)

print(transcription)
```


---


# Synthesize speech

- 3 minutes
Speech synthesis, or text-to-speech , is the reverse of speech-to-text. It involves submitting text to a model, which returns an audio stream of the vocalized text.
Models that support text-to-speech operations include:
- gpt-4o-tts
- gpt-4o-mini-tts
Note
Model availability varies by region. Review the model regional availability table in the Microsoft Foundry documentation.

## Using a text-to-speech model

Similarly to speech-to-text models, you can use the AzureOpenAI client in the OpenAI SDK to connect to the endpoint for your Microsoft Foundry resource, and upload text to a text-to-speech model for speech synthesis.

```
from openai import AzureOpenAI
from pathlib import Path

# Create an AzureOpenAI client
client = AzureOpenAI(
    azure_endpoint=YOUR_FOUNDRY_ENDPOINT,
    api_key=YOUR_FOUNDRY_KEY,
    api_version="2025-03-01-preview"
)

# Path for audio output file
speech_file_path = Path("output_speech.wav")

# Generate speech and save to file
with client.audio.speech.with_streaming_response.create(
            model=YOUR_MODEL_DEPLOYMENT,
            voice="alloy",
            input="This speech was AI-generated!",
            instructions="Speak in an upbeat, excited tone.",
    ) as response:
    response.stream_to_file(speech_file_path)

print(f"Speech generated and saved to {speech_file_path}")
```


---


# Exercise - Use speech-capable generative AI models

- 30 minutes
If you have an Azure subscription, you can complete this exercise to implement speech transcription and synthesis using generative AI models in Microsoft Foundry.
Note
If you don't have an Azure subscription, you can sign up for an account , which includes credits for the first 30 days.
Launch the exercise and follow the instructions.

---


# Module assessment

- 2 minutes
Which model can you use to generate text from speech?
gpt-4o-mini
gpt-4o-mini-tts
gpt-4o-mini-transcribe
Which model can you use to synthesize speech from text?
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you learned about speech-capable AI models, and how you can use Microsoft Foundry to create generative AI solutions that:
- Transcribe speech to text.
- Synthesize speech from text.
Tip
For more information about speech-capable models in Microsoft Foundry, see Audio models in the Microsoft Foundry documentation.

---

