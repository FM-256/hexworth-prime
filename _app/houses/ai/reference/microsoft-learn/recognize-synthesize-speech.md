# (AI-900) Get started with speech in Microsoft Foundry

**Module slug:** `recognize-synthesize-speech`
**Source:** https://learn.microsoft.com/en-us/training/modules/recognize-synthesize-speech/
**Units:** 7

## Table of Contents

1. Introduction
2. Understand speech recognition and synthesis
3. Get started with speech on Azure
4. Use Azure Speech
5. Exercise - Get started with speech in Microsoft Foundry
6. Module assessment
7. Summary

---


# Introduction

- 1 minute
AI speech capabilities enable us to manage home and auto systems with voice instructions, get answers from computers for spoken questions, generate captions from audio, and much more.
To enable this kind of interaction, the AI system must support at least two capabilities:
- Speech recognition - the ability to detect and interpret spoken input
- Speech synthesis - the ability to generate spoken output
Azure Speech provides speech to text, text to speech, and speech translation capabilities through speech recognition and synthesis. You can use prebuilt and custom Speech service models for a variety of tasks, from transcribing audio to text with high accuracy, to identifying speakers in conversations, creating custom voices, and more. Next you'll learn how AI speech capabilities work.

---


# Understand speech recognition and synthesis

- 2 minutes
Speech recognition takes the spoken word and converts it into data that can be processed - often by transcribing it into text. The spoken words can be in the form of a recorded voice in an audio file, or live audio from a microphone.  Speech patterns are analyzed in the audio to determine recognizable patterns that are mapped to words. To accomplish this, the software typically uses multiple models, including:
- An acoustic model that converts the audio signal into phonemes (representations of specific sounds).
- A language model that maps phonemes to words, usually using a statistical algorithm that predicts the most probable sequence of words based on the phonemes.
The recognized words are typically converted to text, which you can use for various purposes, such as:
- Providing closed captions for recorded or live videos
- Creating a transcript of a phone call or meeting
- Automated note dictation
- Determining intended user input for further processing
Speech synthesis is concerned with vocalizing data, usually by converting text to speech. A speech synthesis solution typically requires the following information:
- The text to be spoken
- The voice to be used to vocalize the speech
To synthesize speech, the system typically tokenizes the text to break it down into individual words, and assigns phonetic sounds to each word. It then breaks the phonetic transcription into prosodic units (such as phrases, clauses, or sentences) to create phonemes that will be converted to audio format. These phonemes are then synthesized as audio and can be assigned a particular voice, speaking rate, pitch, and volume.
You can use the output of speech synthesis for many purposes, including:
- Generating spoken responses to user input
- Creating voice menus for phone systems
- Reading email or text messages aloud in hands-free scenarios
- Broadcasting announcements in public locations, such as railway stations or airports

---


# Get started with speech on Azure

- 3 minutes
Microsoft Azure offers speech recognition and synthesis capabilities through Azure Speech service, which supports many capabilities, including:
- Speech to text
- Text to speech
- Speech translation
You can use Azure Speech to text API to perform real-time or batch transcription of audio into a text format. The audio source for transcription can be a real-time audio stream from a microphone or an audio file.
Azure AI's Speech to text API is based on Microsoft's Universal Language Model.  The data for the model is Microsoft-owned and deployed to Azure.  The model is optimized for two scenarios, conversational and dictation. You can also create and train your own custom models including acoustics, language, and pronunciation if the prebuilt models from Microsoft don't provide what you need.
Real-time transcription : Real-time speech to text allows you to transcribe audio streams to text. You can use real-time transcription for presentations, demos, or any other scenario where a person is speaking.
In order for real-time transcription to work, your application needs to be listening for incoming audio from a microphone, or other audio input source such as an audio file. Your application code streams the audio to the service, which returns the transcribed text.
Batch transcription : Not all speech to text scenarios are real time.  You might have audio recordings stored on a file share, a remote server, or even on Azure storage. You can point to audio files with a shared access signature (SAS) URI and asynchronously receive transcription results.
Batch transcription should be run in an asynchronous manner because the batch jobs are scheduled on a best-effort basis . Normally a job starts executing within minutes of the request but there's no estimate for when a job changes into the running state.
The text to speech API enables you to convert text input to audible speech, which can either be played directly through a computer speaker or written to an audio file.
Speech synthesis voices : When you use the text to speech API, you can specify the voice to be used to vocalize the text. This capability offers you the flexibility to personalize your speech synthesis solution and give it a specific character.
The service includes multiple predefined voices with support for multiple languages and regional pronunciation, including neural voices that leverage neural networks to overcome common limitations in speech synthesis with regard to intonation, resulting in a more natural sounding voice. You can also develop custom voices and use them with the text to speech API.
Azure Speech Translation is a feature of the Azure Speech service. Azure Speech Translation enables real-time translation of spoken language by taking inputs of audio streams and returning text in a specified language. It works by first converting speech to text using automatic speech recognition (ASR), then translating the recognized text into one or more target languages using machine translation. The service supports a wide range of source and target languages and can deliver translations as text or synthesized speech. Developers can integrate this functionality into applications using REST APIs or SDKs. These applications work well in scenarios like multilingual meetings, live event captioning, or global customer support.

---


# Use Azure Speech

- 2 minutes
Azure Speech is available for use through several tools and programming languages including:
- Studio interfaces
- Command Line Interface (CLI)
- REST APIs and Software Development Kits (SDKs)

## Using studio interfaces

You can create Azure Speech projects using Microsoft Foundry portal's Speech Playground .

## Azure resources for Azure Speech

To use Azure Speech in an application, you must create an appropriate resource in your Azure subscription. You can choose to create either of the following types of resource:
- A Speech resource - choose this resource type if you only plan to use Azure Speech, or if you want to manage access and billing for the resource separately from other services.
- A Foundry Tools resource - choose this resource type if you plan to use Azure Speech in combination with other Foundry Tools, and you want to manage access and billing for these services together.

---


# Exercise - Get started with speech in Microsoft Foundry

- 30 minutes
If you have an Azure subscription, you can use the Microsoft Foundry to explore the capabilities of Azure Speech.
Note
If you don't already have one, you can sign up for an Azure subscription , which includes free credits for the first 30 days.
Launch the exercise and follow the instructions.

---


# Module assessment

- 2 minutes
You plan to build an application that uses Azure Speech to transcribe audio recordings of phone calls into text, and then submit the transcribed text to Azure Language to extract key phrases. You want to manage access and billing for the application services with a single Azure resource. Which type of Azure resource should you create?
Speech
Language
Foundry Tools
You want to use Azure Speech service to build an application that reads incoming email message subjects aloud. Which API should you use?
Speech to text
Text to speech
Translator
What is the main function of the Azure Speech to text API?
It converts text into audible speech.
It translates speech from one language to another.
It performs real-time or batch transcription of audio into a text format.
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you learned about two key aspects of voice technology: speech recognition and synthesis. Speech recognition involves converting spoken words into data, often transcribed into text, using an acoustic model and a language model. This text can be used for various purposes like closed captions, transcripts, automated note dictation, and user input processing. Speech synthesis, on the other hand, is about vocalizing data, typically by converting text to speech. Synthesized speech can be used for generating spoken responses, creating voice menus, reading emails or texts aloud, and broadcasting announcements. You also learned about Microsoft Azure's AI Speech service, which provides speech recognition and synthesis capabilities through features such as Speech to Text and Text to Speech APIs.
The main takeaways from this module are the functionalities of Azure Speech service. The Speech to Text API allows for real-time or batch transcription of audio into text, using a model based on the Universal Language Model trained by Microsoft. It can be used for real-time transcriptions during presentations or demos, or for batch transcriptions of stored audio files. The Text to Speech API converts text input into audible speech, which can be customized with different voices, languages, and regional pronunciations.
You can find out more about Azure Speech in the service documentation .

---

